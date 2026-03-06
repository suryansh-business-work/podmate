import { v4 as uuidv4 } from 'uuid';
import { FeedbackModel, toFeedback } from './feedback.models';
import type {
  Feedback,
  PaginatedFeedback,
  CreateFeedbackInput,
  FeedbackStatus,
} from './feedback.models';
import logger from '../../lib/logger';

export async function createFeedback(
  userId: string,
  input: CreateFeedbackInput,
): Promise<Feedback> {
  const now = new Date().toISOString();
  const doc = await FeedbackModel.create({
    _id: uuidv4(),
    userId,
    type: input.type,
    title: input.title,
    description: input.description,
    status: 'PENDING',
    createdAt: now,
    updatedAt: now,
  });

  logger.info(`Feedback submitted by user ${userId}: ${input.type} - ${input.title}`);
  return toFeedback(doc.toObject({ virtuals: true }));
}

export async function getMyFeedback(userId: string): Promise<Feedback[]> {
  const docs = await FeedbackModel.find({ userId })
    .sort({ createdAt: -1 })
    .lean({ virtuals: true });
  return docs.map((d) => toFeedback(d as never));
}

export async function getAllFeedback(
  page: number,
  limit: number,
  search?: string,
  status?: string,
): Promise<PaginatedFeedback> {
  const filter: Record<string, unknown> = {};
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }
  if (status) {
    filter.status = status;
  }

  const total = await FeedbackModel.countDocuments(filter);
  const totalPages = Math.ceil(total / limit);
  const skip = (page - 1) * limit;

  const docs = await FeedbackModel.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean({ virtuals: true });

  return {
    items: docs.map((d) => toFeedback(d as never)),
    total,
    page,
    limit,
    totalPages,
  };
}

export async function updateFeedback(
  id: string,
  status?: FeedbackStatus,
  adminNotes?: string,
): Promise<Feedback> {
  const update: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  if (status) update.status = status;
  if (adminNotes !== undefined) update.adminNotes = adminNotes;

  const doc = await FeedbackModel.findByIdAndUpdate(
    id,
    { $set: update },
    { returnDocument: 'after' },
  );
  if (!doc) throw new Error('Feedback not found');
  return toFeedback(doc.toObject({ virtuals: true }));
}

export async function deleteFeedback(id: string): Promise<boolean> {
  const result = await FeedbackModel.deleteOne({ _id: id });
  return result.deletedCount > 0;
}
