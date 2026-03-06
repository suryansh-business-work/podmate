import { v4 as uuidv4 } from 'uuid';
import type {
  Pod,
  CreatePodInput,
  UpdatePodInput,
  PodPaginationInput,
  PaginatedPods,
  PodStatus,
} from './pod.models';
import { PodModel, toPod } from './pod.models';
import type { User } from '../user/user.models';
import { UserModel, toUser } from '../user/user.models';
import { findUserById } from '../user/user.services';
import { createNotification } from '../notification/notification.services';
import { createPayment, completePayment } from '../payment/payment.services';
import { getConfigValue } from '../settings/settings.services';

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

  const updated = await PodModel.findByIdAndUpdate(
    id,
    { $set: update },
    { returnDocument: 'after' },
  ).lean({
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

export async function bulkDeletePods(ids: string[], issueRefunds: boolean): Promise<number> {
  let deleted = 0;
  for (const id of ids) {
    const pod = await PodModel.findById(id);
    if (!pod) continue;
    if (pod.currentSeats > 0) {
      await forceDeletePod(id, issueRefunds);
    } else {
      await PodModel.deleteOne({ _id: id });
    }
    deleted += 1;
  }
  return deleted;
}

export interface RemoveAttendeeResult {
  pod: Pod;
  refunded: boolean;
  refundAmount: number;
}

export async function removeAttendee(
  podId: string,
  userId: string,
  issueRefund: boolean,
): Promise<RemoveAttendeeResult> {
  const pod = await PodModel.findById(podId);
  if (!pod) throw new Error('Pod not found');
  if (!(pod.attendeeIds as string[]).includes(userId))
    throw new Error('User is not an attendee of this pod');

  /* Remove attendee */
  const updated = await PodModel.findByIdAndUpdate(
    podId,
    { $pull: { attendeeIds: userId }, $inc: { currentSeats: -1 } },
    { returnDocument: 'after' },
  ).lean({ virtuals: true });
  const result = toPod(updated);
  if (!result) throw new Error('Pod not found');

  let refunded = false;
  let refundAmt = 0;

  /* Issue refund if requested */
  if (issueRefund) {
    const { PaymentModel } = await import('../payment/payment.models');
    const payment = await PaymentModel.findOne({
      userId,
      podId,
      type: 'PAYMENT',
      status: 'COMPLETED',
    }).lean();

    if (payment) {
      const { processRefund } = await import('../payment/payment.services');
      refundAmt = (payment.amount as number) - ((payment.refundAmount as number) || 0);
      if (refundAmt > 0) {
        await processRefund({
          paymentId: (payment._id as string).toString(),
          amount: refundAmt,
          notes: 'Admin removed attendee – automatic refund',
        });
        refunded = true;
      }
    }
  }

  /* Notify user */
  await createNotification(
    userId,
    'POD_UPDATE',
    'Removed from Pod',
    `You have been removed from "${pod.title}"${refunded ? ` and refunded ₹${refundAmt}` : ''}`,
    JSON.stringify({ podId }),
  );

  return { pod: result, refunded, refundAmount: refundAmt };
}

export interface ForceDeletePodResult {
  success: boolean;
  removedAttendees: number;
  totalRefunded: number;
}

export async function forceDeletePod(
  podId: string,
  issueRefunds: boolean,
): Promise<ForceDeletePodResult> {
  const pod = await PodModel.findById(podId);
  if (!pod) throw new Error('Pod not found');

  const attendeeIds = pod.attendeeIds as string[];
  let totalRefunded = 0;

  /* Remove each attendee and optionally refund */
  for (const userId of attendeeIds) {
    try {
      const result = await removeAttendee(podId, userId, issueRefunds);
      totalRefunded += result.refundAmount;
    } catch {
      /* Continue even if one fails */
    }
  }

  /* Now delete the pod */
  await PodModel.deleteOne({ _id: podId });

  return { success: true, removedAttendees: attendeeIds.length, totalRefunded };
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

export interface CheckoutResult {
  success: boolean;
  pod: Pod;
  paymentId: string;
  isDummy: boolean;
}

export async function checkoutPod(podId: string, userId: string): Promise<CheckoutResult> {
  const pod = await PodModel.findById(podId);
  if (!pod) throw new Error('Pod not found');
  if (pod.currentSeats >= pod.maxSeats) throw new Error('Pod is full');
  if ((pod.attendeeIds as string[]).includes(userId)) throw new Error('Already joined this pod');

  const dummyCheckout = await getConfigValue('dummy_checkout', 'DUMMY_CHECKOUT');
  const isDummy = dummyCheckout === 'true';

  /* Create payment record */
  const payment = await createPayment({
    userId,
    podId,
    amount: pod.feePerPerson,
    type: 'PAYMENT',
    gateway: isDummy ? 'DUMMY' : 'PENDING',
    notes: isDummy ? 'Dummy checkout – payment simulated' : '',
  });

  /* If dummy checkout, auto-complete the payment */
  if (isDummy) {
    await completePayment(payment.id, `DUMMY-${uuidv4().slice(0, 8).toUpperCase()}`);
  }

  /* Join the pod */
  const updated = await PodModel.findByIdAndUpdate(
    podId,
    { $push: { attendeeIds: userId }, $inc: { currentSeats: 1 } },
    { returnDocument: 'after' },
  ).lean({ virtuals: true });
  const result = toPod(updated);
  if (!result) throw new Error('Pod not found');

  /* Notify the host */
  const joiner = await findUserById(userId);
  const joinerName = joiner?.name || joiner?.username || 'Someone';
  await createNotification(
    pod.hostId,
    'POD_JOIN',
    'New Pod Member!',
    `${joinerName} joined your pod "${pod.title}"`,
    JSON.stringify({ podId, userId }),
  );

  return { success: true, pod: result, paymentId: payment.id, isDummy };
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

/* ── Admin Update Pod (full fields + chat notification) ── */

export interface AdminUpdatePodInput {
  title?: string;
  description?: string;
  category?: string;
  imageUrl?: string;
  mediaUrls?: string[];
  feePerPerson?: number;
  maxSeats?: number;
  dateTime?: string;
  location?: string;
  locationDetail?: string;
  latitude?: number;
  longitude?: number;
  status?: PodStatus;
  closeReason?: string;
  refundPolicy?: string;
}

export async function adminUpdatePod(
  podId: string,
  input: AdminUpdatePodInput,
): Promise<Pod> {
  const pod = await PodModel.findById(podId);
  if (!pod) throw new Error('Pod not found');

  const update: Record<string, unknown> = {};
  if (input.title !== undefined) update.title = input.title;
  if (input.description !== undefined) update.description = input.description;
  if (input.category !== undefined) update.category = input.category;
  if (input.imageUrl !== undefined) update.imageUrl = input.imageUrl;
  if (input.mediaUrls !== undefined) update.mediaUrls = input.mediaUrls;
  if (input.feePerPerson !== undefined) update.feePerPerson = input.feePerPerson;
  if (input.maxSeats !== undefined) update.maxSeats = input.maxSeats;
  if (input.dateTime !== undefined) update.dateTime = input.dateTime;
  if (input.location !== undefined) update.location = input.location;
  if (input.locationDetail !== undefined) update.locationDetail = input.locationDetail;
  if (input.latitude !== undefined) update.latitude = input.latitude;
  if (input.longitude !== undefined) update.longitude = input.longitude;
  if (input.status !== undefined) update.status = input.status;
  if (input.closeReason !== undefined) update.closeReason = input.closeReason;
  if (input.refundPolicy !== undefined) update.refundPolicy = input.refundPolicy;

  const updated = await PodModel.findByIdAndUpdate(
    podId,
    { $set: update },
    { returnDocument: 'after' },
  ).lean({ virtuals: true });
  const result = toPod(updated);
  if (!result) throw new Error('Pod not found');

  /* Build a summary of what changed for chat notification */
  const changedFields: string[] = [];
  if (input.title !== undefined && input.title !== pod.title) changedFields.push('title');
  if (input.description !== undefined && input.description !== pod.description) changedFields.push('description');
  if (input.dateTime !== undefined && input.dateTime !== pod.dateTime) changedFields.push('date/time');
  if (input.location !== undefined && input.location !== pod.location) changedFields.push('location');
  if (input.feePerPerson !== undefined && input.feePerPerson !== pod.feePerPerson) changedFields.push('fee');
  if (input.maxSeats !== undefined && input.maxSeats !== pod.maxSeats) changedFields.push('max seats');
  if (input.status !== undefined && input.status !== pod.status) changedFields.push('status');

  /* Send chat message to pod's group if fields changed */
  if (changedFields.length > 0) {
    const { addMessage, broadcast } = await import('../chat/chat.services');
    const summaryMsg = `[Admin Update] Pod "${result.title}" has been updated: ${changedFields.join(', ')}`;
    const chatMsg = await addMessage(podId, pod.hostId, summaryMsg, 'SYSTEM');
    broadcast(podId, { type: 'NEW_MESSAGE', message: chatMsg });

    /* Notify all attendees */
    const attendeeIds = pod.attendeeIds as string[];
    for (const userId of attendeeIds) {
      await createNotification(
        userId,
        'POD_UPDATE',
        'Pod Updated',
        `"${result.title}" was updated by an admin: ${changedFields.join(', ')}`,
        JSON.stringify({ podId }),
      );
    }
  }

  return result;
}
