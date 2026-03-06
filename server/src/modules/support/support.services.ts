import { v4 as uuidv4 } from 'uuid';
import type {
  SupportTicket,
  CreateSupportTicketInput,
  UpdateSupportTicketInput,
  TicketReply,
  TicketReplySenderRole,
} from './support.models';
import { SupportTicketModel, toSupportTicket } from './support.models';
import { createNotification } from '../notification/notification.services';
import logger from '../../lib/logger';

export interface SupportPaginationInput {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  priority?: string;
  sortBy?: string;
  order?: 'ASC' | 'DESC';
}

export interface PaginatedSupportTickets {
  items: SupportTicket[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function createSupportTicket(
  userId: string,
  input: CreateSupportTicketInput,
): Promise<SupportTicket> {
  const now = new Date().toISOString();
  const doc = await SupportTicketModel.create({
    _id: uuidv4(),
    userId,
    subject: input.subject.trim(),
    message: input.message.trim(),
    priority: input.priority ?? 'MEDIUM',
    status: 'OPEN',
    adminReply: '',
    replies: [],
    createdAt: now,
    updatedAt: now,
  });
  logger.info(`Support ticket created: ${doc.subject} by user ${userId}`);
  return toSupportTicket(doc.toObject({ virtuals: true })) as SupportTicket;
}

export async function adminCreateSupportTicket(
  adminId: string,
  userId: string,
  input: CreateSupportTicketInput,
): Promise<SupportTicket> {
  const now = new Date().toISOString();
  const doc = await SupportTicketModel.create({
    _id: uuidv4(),
    userId,
    subject: input.subject.trim(),
    message: input.message.trim(),
    priority: input.priority ?? 'MEDIUM',
    status: 'OPEN',
    adminReply: '',
    replies: [],
    createdAt: now,
    updatedAt: now,
  });
  logger.info(`Support ticket created by admin ${adminId} for user ${userId}: ${doc.subject}`);
  return toSupportTicket(doc.toObject({ virtuals: true })) as SupportTicket;
}

export async function getMyTickets(userId: string): Promise<SupportTicket[]> {
  const docs = await SupportTicketModel.find({ userId })
    .sort({ createdAt: -1 })
    .lean({ virtuals: true });
  return docs.map(toSupportTicket).filter(Boolean) as SupportTicket[];
}

export async function getTicketById(id: string): Promise<SupportTicket | null> {
  const doc = await SupportTicketModel.findById(id).lean({ virtuals: true });
  return toSupportTicket(doc);
}

export async function getPaginatedTickets(
  input: SupportPaginationInput,
): Promise<PaginatedSupportTickets> {
  const filter: Record<string, unknown> = {};
  if (input.status) filter.status = input.status;
  if (input.priority) filter.priority = input.priority;
  if (input.search) {
    filter.$or = [
      { subject: { $regex: input.search, $options: 'i' } },
      { message: { $regex: input.search, $options: 'i' } },
    ];
  }

  const sortBy = input.sortBy ?? 'createdAt';
  const sortOrder = input.order === 'ASC' ? 1 : -1;
  const total = await SupportTicketModel.countDocuments(filter);
  const totalPages = Math.ceil(total / input.limit);
  const skip = (input.page - 1) * input.limit;

  const docs = await SupportTicketModel.find(filter)
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(input.limit)
    .lean({ virtuals: true });

  return {
    items: docs.map(toSupportTicket).filter(Boolean) as SupportTicket[],
    total,
    page: input.page,
    limit: input.limit,
    totalPages,
  };
}

export async function updateSupportTicket(
  id: string,
  input: UpdateSupportTicketInput,
): Promise<SupportTicket> {
  const update: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  if (input.status !== undefined) update.status = input.status;
  if (input.adminReply !== undefined) update.adminReply = input.adminReply;
  if (input.priority !== undefined) update.priority = input.priority;

  const updated = await SupportTicketModel.findByIdAndUpdate(
    id,
    { $set: update },
    { returnDocument: 'after' },
  ).lean({ virtuals: true });
  const result = toSupportTicket(updated);
  if (!result) throw new Error('Support ticket not found');
  logger.info(`Support ticket updated: ${result.id}`);
  return result;
}

export async function replySupportTicket(
  ticketId: string,
  senderId: string,
  senderRole: TicketReplySenderRole,
  content: string,
  parentReplyId?: string,
): Promise<SupportTicket> {
  const ticket = await SupportTicketModel.findById(ticketId);
  if (!ticket) throw new Error('Support ticket not found');

  /* Users can only reply to their own tickets */
  if (senderRole === 'USER' && ticket.userId !== senderId) {
    throw new Error('You can only reply to your own tickets');
  }

  /* Validate parentReplyId if provided */
  if (parentReplyId) {
    const parentExists = ticket.replies.some((r) => r.id === parentReplyId);
    if (!parentExists) throw new Error('Parent reply not found');
  }

  const reply: TicketReply = {
    id: uuidv4(),
    senderId,
    senderRole,
    parentReplyId: parentReplyId ?? undefined,
    content: content.trim(),
    createdAt: new Date().toISOString(),
  };

  /* Auto-set status to IN_PROGRESS when admin replies to OPEN ticket */
  const statusUpdate: Record<string, unknown> = {};
  if (senderRole === 'ADMIN' && ticket.status === 'OPEN') {
    statusUpdate.status = 'IN_PROGRESS';
  }
  /* Re-open ticket if user replies to RESOLVED ticket */
  if (senderRole === 'USER' && ticket.status === 'RESOLVED') {
    statusUpdate.status = 'OPEN';
  }

  const updated = await SupportTicketModel.findByIdAndUpdate(
    ticketId,
    {
      $push: { replies: reply },
      $set: { updatedAt: new Date().toISOString(), ...statusUpdate },
    },
    { returnDocument: 'after' },
  ).lean({ virtuals: true });

  const result = toSupportTicket(updated);
  if (!result) throw new Error('Support ticket not found');
  logger.info(`Reply added to ticket ${ticketId} by ${senderRole} ${senderId}`);

  /* Send notification to the other party */
  try {
    if (senderRole === 'ADMIN') {
      await createNotification(
        ticket.userId,
        'SUPPORT_REPLY',
        'New reply on your support ticket',
        `An admin replied to your ticket: "${ticket.subject}"`,
        JSON.stringify({ ticketId, replyId: reply.id }),
      );
    }
  } catch (err) {
    logger.error('Failed to send support reply notification:', err);
  }

  return result;
}

export async function deleteSupportTicket(id: string): Promise<boolean> {
  const result = await SupportTicketModel.deleteOne({ _id: id });
  if (result.deletedCount > 0) logger.info(`Support ticket deleted: ${id}`);
  return result.deletedCount > 0;
}

export interface SupportTicketCounts {
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  total: number;
}

export async function getTicketCounts(): Promise<SupportTicketCounts> {
  const [open, inProgress, resolved, closed, total] = await Promise.all([
    SupportTicketModel.countDocuments({ status: 'OPEN' }),
    SupportTicketModel.countDocuments({ status: 'IN_PROGRESS' }),
    SupportTicketModel.countDocuments({ status: 'RESOLVED' }),
    SupportTicketModel.countDocuments({ status: 'CLOSED' }),
    SupportTicketModel.countDocuments(),
  ]);
  return { open, inProgress, resolved, closed, total };
}
