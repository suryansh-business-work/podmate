import { v4 as uuidv4 } from 'uuid';
import type { Pod, CreatePodInput, UpdatePodInput, PodPaginationInput, PaginatedPods } from './pod.models';
import { PodModel, toPod } from './pod.models';
import type { User } from '../user/user.models';
import { UserModel, toUser } from '../user/user.models';
import { findUserById } from '../user/user.services';

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

  const update: Record<string, unknown> = {};
  if (input.title !== undefined) update.title = input.title;
  if (input.description !== undefined) update.description = input.description;
  if (input.category !== undefined) update.category = input.category;
  if (input.imageUrl !== undefined) update.imageUrl = input.imageUrl;
  if (input.feePerPerson !== undefined) update.feePerPerson = input.feePerPerson;
  if (input.maxSeats !== undefined) update.maxSeats = input.maxSeats;
  if (input.dateTime !== undefined) update.dateTime = input.dateTime;
  if (input.location !== undefined) update.location = input.location;
  if (input.locationDetail !== undefined) update.locationDetail = input.locationDetail;

  const updated = await PodModel.findByIdAndUpdate(id, { $set: update }, { new: true }).lean({
    virtuals: true,
  });
  const result = toPod(updated);
  if (!result) throw new Error('Pod not found');
  return result;
}

export async function deletePod(id: string): Promise<boolean> {
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
    { new: true },
  ).lean({ virtuals: true });
  const result = toPod(updated);
  if (!result) throw new Error('Pod not found');
  return result;
}

export async function leavePod(podId: string, userId: string): Promise<Pod> {
  const pod = await PodModel.findById(podId);
  if (!pod) throw new Error('Pod not found');
  if (!(pod.attendeeIds as string[]).includes(userId)) throw new Error('Not a member of this pod');

  const updated = await PodModel.findByIdAndUpdate(
    podId,
    { $pull: { attendeeIds: userId }, $inc: { currentSeats: -1 } },
    { new: true },
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
