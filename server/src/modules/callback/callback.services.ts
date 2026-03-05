import { v4 as uuidv4 } from 'uuid';
import type {
  CallbackRequest,
  CreateCallbackRequestInput,
  UpdateCallbackRequestInput,
} from './callback.models';
import { CallbackRequestModel, toCallbackRequest } from './callback.models';
import logger from '../../lib/logger';

export interface CallbackPaginationInput {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  sortBy?: string;
  order?: 'ASC' | 'DESC';
}

export interface PaginatedCallbackRequests {
  items: CallbackRequest[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function createCallbackRequest(
  userId: string,
  phone: string,
  input: CreateCallbackRequestInput,
): Promise<CallbackRequest> {
  const now = new Date().toISOString();
  const doc = await CallbackRequestModel.create({
    _id: uuidv4(),
    userId,
    phone,
    reason: input.reason.trim(),
    preferredTime: input.preferredTime?.trim() ?? '',
    status: 'PENDING',
    adminNote: '',
    scheduledAt: '',
    completedAt: '',
    createdAt: now,
    updatedAt: now,
  });
  logger.info(`Callback request created by user ${userId}`);
  return toCallbackRequest(doc.toObject({ virtuals: true })) as CallbackRequest;
}

export async function getMyCallbackRequests(userId: string): Promise<CallbackRequest[]> {
  const docs = await CallbackRequestModel.find({ userId })
    .sort({ createdAt: -1 })
    .lean({ virtuals: true });
  return docs.map(toCallbackRequest).filter(Boolean) as CallbackRequest[];
}

export async function getCallbackRequestById(id: string): Promise<CallbackRequest | null> {
  const doc = await CallbackRequestModel.findById(id).lean({ virtuals: true });
  return toCallbackRequest(doc);
}

export async function getPaginatedCallbackRequests(
  input: CallbackPaginationInput,
): Promise<PaginatedCallbackRequests> {
  const filter: Record<string, unknown> = {};
  if (input.status) filter.status = input.status;
  if (input.search) {
    filter.$or = [
      { reason: { $regex: input.search, $options: 'i' } },
      { phone: { $regex: input.search, $options: 'i' } },
    ];
  }

  const sortBy = input.sortBy ?? 'createdAt';
  const sortOrder = input.order === 'ASC' ? 1 : -1;
  const total = await CallbackRequestModel.countDocuments(filter);
  const totalPages = Math.ceil(total / input.limit);
  const skip = (input.page - 1) * input.limit;

  const docs = await CallbackRequestModel.find(filter)
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(input.limit)
    .lean({ virtuals: true });

  return {
    items: docs.map(toCallbackRequest).filter(Boolean) as CallbackRequest[],
    total,
    page: input.page,
    limit: input.limit,
    totalPages,
  };
}

export async function updateCallbackRequest(
  id: string,
  input: UpdateCallbackRequestInput,
): Promise<CallbackRequest> {
  const update: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  if (input.status !== undefined) {
    update.status = input.status;
    if (input.status === 'COMPLETED') {
      update.completedAt = new Date().toISOString();
    }
  }
  if (input.adminNote !== undefined) update.adminNote = input.adminNote;
  if (input.scheduledAt !== undefined) update.scheduledAt = input.scheduledAt;

  const updated = await CallbackRequestModel.findByIdAndUpdate(
    id,
    { $set: update },
    { returnDocument: 'after' },
  ).lean({ virtuals: true });
  const result = toCallbackRequest(updated);
  if (!result) throw new Error('Callback request not found');
  logger.info(`Callback request updated: ${result.id}`);
  return result;
}

export async function deleteCallbackRequest(id: string): Promise<boolean> {
  const result = await CallbackRequestModel.deleteOne({ _id: id });
  if (result.deletedCount > 0) logger.info(`Callback request deleted: ${id}`);
  return result.deletedCount > 0;
}

export interface CallbackRequestCounts {
  pending: number;
  scheduled: number;
  completed: number;
  cancelled: number;
  total: number;
}

export async function getCallbackCounts(): Promise<CallbackRequestCounts> {
  const [pending, scheduled, completed, cancelled, total] = await Promise.all([
    CallbackRequestModel.countDocuments({ status: 'PENDING' }),
    CallbackRequestModel.countDocuments({ status: 'SCHEDULED' }),
    CallbackRequestModel.countDocuments({ status: 'COMPLETED' }),
    CallbackRequestModel.countDocuments({ status: 'CANCELLED' }),
    CallbackRequestModel.countDocuments(),
  ]);
  return { pending, scheduled, completed, cancelled, total };
}
