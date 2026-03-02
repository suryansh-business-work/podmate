import { v4 as uuidv4 } from 'uuid';
import type {
  SupportTicket,
  CreateSupportTicketInput,
  UpdateSupportTicketInput,
} from './support.models';
import { SupportTicketModel, toSupportTicket } from './support.models';
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
    createdAt: now,
    updatedAt: now,
  });
  logger.info(`Support ticket created: ${doc.subject} by user ${userId}`);
  return toSupportTicket(doc.toObject({ virtuals: true })) as SupportTicket;
}

export async function getMyTickets(userId: string): Promise<SupportTicket[]> {
  const docs = await SupportTicketModel.find({ userId })
    .sort({ createdAt: -1 })
    .lean({ virtuals: true });
  return docs.map(toSupportTicket).filter(Boolean) as SupportTicket[];
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
