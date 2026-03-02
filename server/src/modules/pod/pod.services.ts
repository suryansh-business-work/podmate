import { v4 as uuidv4 } from 'uuid';
import type { Pod, CreatePodInput, UpdatePodInput, PodPaginationInput, PaginatedPods, PodStatus } from './pod.models';
import { PodModel, toPod } from './pod.models';
import type { User } from '../user/user.models';
import { UserModel, toUser } from '../user/user.models';
import { findUserById } from '../user/user.services';
import { createNotification } from '../notification/notification.services';

export async function getPaginatedPods(input: PodPaginationInput): Promise<PaginatedPods> {
  const filter: Record<string, unknown> = {};

  if (input.category && input.category !== 'All') {
    filter.category = { $regex: new RegExp(`^${input.category}$`, 'i') };
  }
  if (input.search) {
    const q = input.search;
    filter.$or = [
      { title: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
    ];
  }

  const sortBy = input.sortBy ?? 'createdAt';
  const sortOrder = input.order === 'ASC' ? 1 : -1;
  const total = await PodModel.countDocuments(filter);
  const totalPages = Math.ceil(total / input.limit);
  const skip = (input.page - 1) * input.limit;

  const docs = await PodModel.find(filter)
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(input.limit)
    .lean({ virtuals: true });

  return {
    items: docs.map(toPod).filter(Boolean) as Pod[],
    total,
    page: input.page,
    limit: input.limit,
    totalPages,
  };
}

export async function getPodById(id: string): Promise<Pod | null> {
  const doc = await PodModel.findById(id).lean({ virtuals: true });
  return toPod(doc);
}

export async function getMyPods(hostId: string): Promise<Pod[]> {
  const docs = await PodModel.find({ hostId }).lean({ virtuals: true });
  return docs.map(toPod).filter(Boolean) as Pod[];
}

export async function createPod(input: CreatePodInput, hostId: string): Promise<Pod> {
  const doc = await PodModel.create({
    _id: uuidv4(),
    title: input.title,
    description: input.description,
    category: input.category,
    imageUrl: input.imageUrl ?? '',
    hostId,
    placeId: input.placeId ?? '',
    feePerPerson: input.feePerPerson,
    maxSeats: input.maxSeats,
    dateTime: input.dateTime,
    location: input.location,
    locationDetail: input.locationDetail,
    refundPolicy: input.refundPolicy ?? '24h Refund',
    currentSeats: 0,
    attendeeIds: [],
    rating: 0,
    reviewCount: 0,
    status: 'NEW',
    createdAt: new Date().toISOString(),
  });
  return toPod(doc.toObject({ virtuals: true })) as Pod;
}

export async function updatePod(id: string, hostId: string, input: UpdatePodInput): Promise<Pod> {
  const pod = await PodModel.findById(id);
  if (!pod) throw new Error('Pod not found');
  if (pod.hostId !== hostId) throw new Error('You can only update your own pods');

  /* Only title, imageUrl, and mediaUrls are editable by host */
  const update: Record<string, unknown> = {};
  if (input.title !== undefined) update.title = input.title;
  if (input.imageUrl !== undefined) update.imageUrl = input.imageUrl;
  if (input.mediaUrls !== undefined) update.mediaUrls = input.mediaUrls;

  const updated = await PodModel.findByIdAndUpdate(id, { $set: update }, { returnDocument: 'after' }).lean({
    virtuals: true,
  });
  const result = toPod(updated);
  if (!result) throw new Error('Pod not found');
  return result;
}

export async function deletePod(id: string): Promise<boolean> {
  const pod = await PodModel.findById(id);
  if (!pod) throw new Error('Pod not found');
  if (pod.currentSeats > 0) {
    throw new Error('Cannot delete pod with active participants. Remove all participants first.');
  }
  const result = await PodModel.deleteOne({ _id: id });
  return result.deletedCount > 0;
}

export async function hostDeletePod(id: string, hostId: string): Promise<boolean> {
  const pod = await PodModel.findById(id);
  if (!pod) throw new Error('Pod not found');
  if (pod.hostId !== hostId) throw new Error('You can only delete your own pods');
  if (pod.currentSeats > 0) {
    throw new Error('Cannot delete pod after someone has joined');
  }
  const result = await PodModel.deleteOne({ _id: id });
  return result.deletedCount > 0;
}

export async function joinPod(podId: string, userId: string): Promise<Pod> {
  const pod = await PodModel.findById(podId);
  if (!pod) throw new Error('Pod not found');
  if (pod.currentSeats >= pod.maxSeats) throw new Error('Pod is full');
  if ((pod.attendeeIds as string[]).includes(userId)) throw new Error('Already joined this pod');

  const updated = await PodModel.findByIdAndUpdate(
    podId,
    { $push: { attendeeIds: userId }, $inc: { currentSeats: 1 } },
    { returnDocument: 'after' },
  ).lean({ virtuals: true });
  const result = toPod(updated);
  if (!result) throw new Error('Pod not found');

  /* Notify the host that someone joined their pod */
  const joiner = await findUserById(userId);
  const joinerName = joiner?.name || joiner?.username || 'Someone';
  await createNotification(
    pod.hostId,
    'POD_JOIN',
    'New Pod Member!',
    `${joinerName} joined your pod "${pod.title}"`,
    JSON.stringify({ podId, userId }),
  );

  return result;
}

export async function leavePod(podId: string, userId: string): Promise<Pod> {
  const pod = await PodModel.findById(podId);
  if (!pod) throw new Error('Pod not found');
  if (!(pod.attendeeIds as string[]).includes(userId)) throw new Error('Not a member of this pod');

  const updated = await PodModel.findByIdAndUpdate(
    podId,
    { $pull: { attendeeIds: userId }, $inc: { currentSeats: -1 } },
    { returnDocument: 'after' },
  ).lean({ virtuals: true });
  const result = toPod(updated);
  if (!result) throw new Error('Pod not found');
  return result;
}

export async function getJoinedPods(userId: string): Promise<Pod[]> {
  const docs = await PodModel.find({
    $or: [{ hostId: userId }, { attendeeIds: userId }],
  }).lean({ virtuals: true });
  return docs.map(toPod).filter(Boolean) as Pod[];
}

export async function resolveHost(hostId: string): Promise<User | null> {
  return findUserById(hostId);
}

export async function resolveAttendees(attendeeIds: string[]): Promise<User[]> {
  if (!attendeeIds.length) return [];
  const docs = await UserModel.find({ _id: { $in: attendeeIds } }).lean({ virtuals: true });
  return docs.map(toUser).filter(Boolean) as User[];
}

/* ── Pod Open/Close ── */

export async function closePod(id: string, reason: string): Promise<Pod> {
  const pod = await PodModel.findById(id);
  if (!pod) throw new Error('Pod not found');
  if (pod.status === 'CLOSED') throw new Error('Pod is already closed');

  const updated = await PodModel.findByIdAndUpdate(
    id,
    { $set: { status: 'CLOSED', closeReason: reason } },
    { returnDocument: 'after' },
  ).lean({ virtuals: true });
  const result = toPod(updated);
  if (!result) throw new Error('Pod not found');
  return result;
}

export async function openPod(id: string): Promise<Pod> {
  const pod = await PodModel.findById(id);
  if (!pod) throw new Error('Pod not found');
  if (pod.status !== 'CLOSED') throw new Error('Pod is not closed');

  const updated = await PodModel.findByIdAndUpdate(
    id,
    { $set: { status: 'OPEN', closeReason: '' } },
    { returnDocument: 'after' },
  ).lean({ virtuals: true });
  const result = toPod(updated);
  if (!result) throw new Error('Pod not found');
  return result;
}

/* ── Pod View Count ── */

const podViewTracker = new Map<string, Set<string>>();

export async function trackPodView(podId: string, userId: string): Promise<Pod> {
  const key = podId;
  if (!podViewTracker.has(key)) {
    podViewTracker.set(key, new Set<string>());
  }
  const viewers = podViewTracker.get(key)!;
  if (viewers.has(userId)) {
    const pod = await getPodById(podId);
    if (!pod) throw new Error('Pod not found');
    return pod;
  }

  viewers.add(userId);
  const updated = await PodModel.findByIdAndUpdate(
    podId,
    { $inc: { viewCount: 1 } },
    { returnDocument: 'after' },
  ).lean({ virtuals: true });
  const result = toPod(updated);
  if (!result) throw new Error('Pod not found');
  return result;
}

/* ── Disable all pods for a user (cascade on user disable) ── */

export async function disableUserPods(userId: string): Promise<number> {
  const result = await PodModel.updateMany(
    { hostId: userId, status: { $nin: ['CANCELLED', 'CLOSED'] } },
    { $set: { status: 'CLOSED' as PodStatus, closeReason: 'Host account disabled' } },
  );
  return result.modifiedCount;
}

export async function enableUserPods(userId: string): Promise<number> {
  const result = await PodModel.updateMany(
    { hostId: userId, closeReason: 'Host account disabled' },
    { $set: { status: 'OPEN' as PodStatus, closeReason: '' } },
  );
  return result.modifiedCount;
}
