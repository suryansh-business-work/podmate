import { v4 as uuidv4 } from 'uuid';
import { FollowModel, toFollow } from './follow.models';
import type { Follow, FollowStats, PaginatedFollows } from './follow.models';
import logger from '../../lib/logger';

export async function followUser(followerId: string, followingId: string): Promise<Follow> {
  if (followerId === followingId) {
    throw new Error('You cannot follow yourself');
  }

  const existing = await FollowModel.findOne({ followerId, followingId }).lean();
  if (existing) {
    throw new Error('Already following this user');
  }

  const doc = await FollowModel.create({
    _id: uuidv4(),
    followerId,
    followingId,
    createdAt: new Date().toISOString(),
  });

  logger.info(`User ${followerId} followed user ${followingId}`);
  return toFollow(doc.toObject({ virtuals: true }));
}

export async function unfollowUser(followerId: string, followingId: string): Promise<boolean> {
  const result = await FollowModel.deleteOne({ followerId, followingId });
  if (result.deletedCount > 0) {
    logger.info(`User ${followerId} unfollowed user ${followingId}`);
    return true;
  }
  return false;
}

export async function getFollowStats(userId: string, viewerId?: string): Promise<FollowStats> {
  const [followersCount, followingCount] = await Promise.all([
    FollowModel.countDocuments({ followingId: userId }),
    FollowModel.countDocuments({ followerId: userId }),
  ]);

  let isFollowing = false;
  if (viewerId && viewerId !== userId) {
    const follow = await FollowModel.findOne({ followerId: viewerId, followingId: userId }).lean();
    isFollowing = Boolean(follow);
  }

  return { followersCount, followingCount, isFollowing };
}

export async function getFollowers(
  userId: string,
  page: number,
  limit: number,
): Promise<PaginatedFollows> {
  const total = await FollowModel.countDocuments({ followingId: userId });
  const totalPages = Math.ceil(total / limit);
  const skip = (page - 1) * limit;

  const docs = await FollowModel.find({ followingId: userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean({ virtuals: true });

  return {
    items: docs.map((d) => toFollow(d as never)),
    total,
    page,
    limit,
    totalPages,
  };
}

export async function getFollowing(
  userId: string,
  page: number,
  limit: number,
): Promise<PaginatedFollows> {
  const total = await FollowModel.countDocuments({ followerId: userId });
  const totalPages = Math.ceil(total / limit);
  const skip = (page - 1) * limit;

  const docs = await FollowModel.find({ followerId: userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean({ virtuals: true });

  return {
    items: docs.map((d) => toFollow(d as never)),
    total,
    page,
    limit,
    totalPages,
  };
}

export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
  const doc = await FollowModel.findOne({ followerId, followingId }).lean();
  return Boolean(doc);
}
