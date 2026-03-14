import { v4 as uuidv4 } from 'uuid';
import type { Moment, MomentComment, PaginatedMoments, CreateMomentInput } from './moment.models';
import {
  MomentModel,
  MomentCommentModel,
  MomentLikeModel,
  toMoment,
  toMomentComment,
} from './moment.models';

export async function getMomentsFeed(
  page: number,
  limit: number,
): Promise<PaginatedMoments> {
  const filter = { isActive: true };
  const total = await MomentModel.countDocuments(filter);
  const totalPages = Math.ceil(total / limit);
  const skip = (page - 1) * limit;

  const docs = await MomentModel.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean({ virtuals: true });

  return {
    items: docs.map(toMoment).filter(Boolean) as Moment[],
    total,
    page,
    limit,
    totalPages,
  };
}

export async function getUserMoments(
  userId: string,
  page: number,
  limit: number,
): Promise<PaginatedMoments> {
  const filter = { userId, isActive: true };
  const total = await MomentModel.countDocuments(filter);
  const totalPages = Math.ceil(total / limit);
  const skip = (page - 1) * limit;

  const docs = await MomentModel.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean({ virtuals: true });

  return {
    items: docs.map(toMoment).filter(Boolean) as Moment[],
    total,
    page,
    limit,
    totalPages,
  };
}

export async function createMoment(
  input: CreateMomentInput,
  userId: string,
): Promise<Moment> {
  const doc = await MomentModel.create({
    _id: uuidv4(),
    userId,
    caption: input.caption,
    mediaUrls: input.mediaUrls,
    likeCount: 0,
    commentCount: 0,
    isActive: true,
    createdAt: new Date().toISOString(),
  });
  return toMoment(doc.toObject({ virtuals: true })) as Moment;
}

export async function deleteMoment(id: string, userId: string): Promise<boolean> {
  const doc = await MomentModel.findById(id);
  if (!doc) throw new Error('Moment not found');
  if (doc.userId !== userId) throw new Error('Not authorized');

  await MomentModel.findByIdAndUpdate(id, { $set: { isActive: false } });
  return true;
}

export async function likeMoment(momentId: string, userId: string): Promise<Moment> {
  const moment = await MomentModel.findById(momentId);
  if (!moment) throw new Error('Moment not found');

  const existing = await MomentLikeModel.findOne({ momentId, userId });
  if (existing) throw new Error('Already liked');

  await MomentLikeModel.create({
    _id: uuidv4(),
    momentId,
    userId,
    createdAt: new Date().toISOString(),
  });

  const updated = await MomentModel.findByIdAndUpdate(
    momentId,
    { $inc: { likeCount: 1 } },
    { returnDocument: 'after' },
  ).lean({ virtuals: true });
  return toMoment(updated) as Moment;
}

export async function unlikeMoment(momentId: string, userId: string): Promise<Moment> {
  const moment = await MomentModel.findById(momentId);
  if (!moment) throw new Error('Moment not found');

  const deleted = await MomentLikeModel.findOneAndDelete({ momentId, userId });
  if (!deleted) throw new Error('Not liked');

  const updated = await MomentModel.findByIdAndUpdate(
    momentId,
    { $inc: { likeCount: -1 } },
    { returnDocument: 'after' },
  ).lean({ virtuals: true });
  return toMoment(updated) as Moment;
}

export async function isLikedByUser(momentId: string, userId: string): Promise<boolean> {
  const like = await MomentLikeModel.findOne({ momentId, userId });
  return !!like;
}

export async function addComment(
  momentId: string,
  userId: string,
  content: string,
): Promise<MomentComment> {
  const moment = await MomentModel.findById(momentId);
  if (!moment) throw new Error('Moment not found');

  const doc = await MomentCommentModel.create({
    _id: uuidv4(),
    momentId,
    userId,
    content,
    createdAt: new Date().toISOString(),
  });

  await MomentModel.findByIdAndUpdate(momentId, { $inc: { commentCount: 1 } });
  return toMomentComment(doc.toObject({ virtuals: true })) as MomentComment;
}

export async function getComments(
  momentId: string,
  page: number,
  limit: number,
): Promise<{ items: MomentComment[]; total: number }> {
  const filter = { momentId };
  const total = await MomentCommentModel.countDocuments(filter);
  const skip = (page - 1) * limit;

  const docs = await MomentCommentModel.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean({ virtuals: true });

  return {
    items: docs.map(toMomentComment).filter(Boolean) as MomentComment[],
    total,
  };
}
