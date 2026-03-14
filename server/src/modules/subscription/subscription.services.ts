import { v4 as uuidv4 } from 'uuid';
import type { Subscription, PaginatedSubscriptions, BillingCycle } from './subscription.models';
import { SubscriptionModel, toSubscription } from './subscription.models';
import { PodModel, toPod } from '../pod/pod.models';
import type { Pod } from '../pod/pod.models';
import { createPayment, completePayment } from '../payment/payment.services';
import { getConfigValue } from '../settings/settings.services';
import { findUserById } from '../user/user.services';
import { createNotification } from '../notification/notification.services';
import type { User } from '../user/user.models';

function computeNextBillingDate(fromDate: string, cycle: BillingCycle): string {
  const d = new Date(fromDate);
  switch (cycle) {
    case 'DAILY':
      d.setDate(d.getDate() + 1);
      break;
    case 'WEEKLY':
      d.setDate(d.getDate() + 7);
      break;
    case 'MONTHLY':
      d.setMonth(d.getMonth() + 1);
      break;
  }
  return d.toISOString();
}

export interface CheckoutOccurrenceResult {
  success: boolean;
  pod: Pod;
  subscription: Subscription;
  paymentId: string;
  isDummy: boolean;
}

export async function checkoutOccurrencePod(
  podId: string,
  userId: string,
): Promise<CheckoutOccurrenceResult> {
  const pod = await PodModel.findById(podId);
  if (!pod) throw new Error('Pod not found');
  if (pod.podType !== 'OCCURRENCE') throw new Error('Pod is not an occurrence type');
  if (pod.currentSeats >= pod.maxSeats) throw new Error('Pod is full');
  if ((pod.attendeeIds as string[]).includes(userId)) throw new Error('Already joined this pod');

  const existingSub = await SubscriptionModel.findOne({
    userId,
    podId,
    status: { $in: ['ACTIVE', 'PAUSED'] },
  });
  if (existingSub) throw new Error('Already subscribed to this pod');

  const billingCycle = (pod.recurrence || 'MONTHLY') as BillingCycle;
  const totalCycles = pod.occurrenceCount || 1;
  const amountPerCycle = pod.feePerPerson;

  const dummyCheckout = await getConfigValue('dummy_checkout', 'DUMMY_CHECKOUT');
  const isDummy = dummyCheckout === 'true';

  /* Create first payment */
  const payment = await createPayment({
    userId,
    podId,
    amount: amountPerCycle,
    type: 'PAYMENT',
    gateway: isDummy ? 'DUMMY' : 'PENDING',
    notes: isDummy
      ? 'Subscription first cycle – payment simulated'
      : `Subscription cycle 1/${totalCycles}`,
  });

  if (isDummy) {
    await completePayment(payment.id, `DUMMY-SUB-${uuidv4().slice(0, 8).toUpperCase()}`);
  }

  /* Create subscription */
  const now = new Date().toISOString();
  const nextBilling = computeNextBillingDate(now, billingCycle);

  const subDoc = await SubscriptionModel.create({
    _id: uuidv4(),
    userId,
    podId,
    status: 'ACTIVE',
    billingCycle,
    amountPerCycle,
    totalPaid: amountPerCycle,
    cyclesCompleted: 1,
    totalCycles,
    nextBillingDate: nextBilling,
    startDate: pod.startDate || now,
    endDate: pod.endDate || '',
    cancelledAt: '',
    lastPaymentId: payment.id,
    createdAt: now,
    updatedAt: now,
  });

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
    'New Subscriber!',
    `${joinerName} subscribed to your pod "${pod.title}"`,
    JSON.stringify({ podId, userId }),
  );

  const subscription = toSubscription(subDoc.toObject({ virtuals: true }));
  if (!subscription) throw new Error('Failed to create subscription');

  return { success: true, pod: result, subscription, paymentId: payment.id, isDummy };
}

export async function renewSubscription(subscriptionId: string): Promise<Subscription> {
  const sub = await SubscriptionModel.findById(subscriptionId);
  if (!sub) throw new Error('Subscription not found');
  if (sub.status !== 'ACTIVE') throw new Error('Subscription is not active');
  if (sub.cyclesCompleted >= sub.totalCycles) {
    await SubscriptionModel.findByIdAndUpdate(subscriptionId, {
      $set: { status: 'EXPIRED', updatedAt: new Date().toISOString() },
    });
    throw new Error('All cycles completed');
  }

  const dummyCheckout = await getConfigValue('dummy_checkout', 'DUMMY_CHECKOUT');
  const isDummy = dummyCheckout === 'true';

  const payment = await createPayment({
    userId: sub.userId,
    podId: sub.podId,
    amount: sub.amountPerCycle,
    type: 'PAYMENT',
    gateway: isDummy ? 'DUMMY' : 'PENDING',
    notes: isDummy
      ? 'Subscription renewal – payment simulated'
      : `Subscription cycle ${sub.cyclesCompleted + 1}/${sub.totalCycles}`,
  });

  if (isDummy) {
    await completePayment(payment.id, `DUMMY-REN-${uuidv4().slice(0, 8).toUpperCase()}`);
  }

  const nextBilling = computeNextBillingDate(
    new Date().toISOString(),
    sub.billingCycle as BillingCycle,
  );

  const updated = await SubscriptionModel.findByIdAndUpdate(
    subscriptionId,
    {
      $set: {
        lastPaymentId: payment.id,
        nextBillingDate: nextBilling,
        updatedAt: new Date().toISOString(),
      },
      $inc: { cyclesCompleted: 1, totalPaid: sub.amountPerCycle },
    },
    { returnDocument: 'after' },
  ).lean({ virtuals: true });

  const result = toSubscription(updated);
  if (!result) throw new Error('Subscription not found');

  /* Auto-expire if all cycles done */
  if (result.cyclesCompleted >= result.totalCycles) {
    await SubscriptionModel.findByIdAndUpdate(subscriptionId, {
      $set: { status: 'EXPIRED', updatedAt: new Date().toISOString() },
    });
    result.status = 'EXPIRED';
  }

  return result;
}

export async function cancelSubscription(
  subscriptionId: string,
  userId: string,
): Promise<Subscription> {
  const sub = await SubscriptionModel.findById(subscriptionId);
  if (!sub) throw new Error('Subscription not found');
  if (sub.userId !== userId) throw new Error('Not authorized');
  if (sub.status === 'CANCELLED') throw new Error('Already cancelled');

  const now = new Date().toISOString();
  const updated = await SubscriptionModel.findByIdAndUpdate(
    subscriptionId,
    { $set: { status: 'CANCELLED', cancelledAt: now, updatedAt: now } },
    { returnDocument: 'after' },
  ).lean({ virtuals: true });

  const result = toSubscription(updated);
  if (!result) throw new Error('Subscription not found');
  return result;
}

export async function getMySubscriptions(
  userId: string,
  page = 1,
  limit = 20,
): Promise<PaginatedSubscriptions> {
  const filter = { userId };
  const total = await SubscriptionModel.countDocuments(filter);
  const totalPages = Math.ceil(total / limit);
  const skip = (page - 1) * limit;

  const docs = await SubscriptionModel.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean({ virtuals: true });

  return {
    items: docs.map(toSubscription).filter(Boolean) as Subscription[],
    total,
    page,
    limit,
    totalPages,
  };
}

export async function getSubscriptionForPod(
  podId: string,
  userId: string,
): Promise<Subscription | null> {
  const doc = await SubscriptionModel.findOne({ podId, userId })
    .sort({ createdAt: -1 })
    .lean({ virtuals: true });
  return toSubscription(doc);
}

export async function getPaginatedSubscriptions(input: {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  userId?: string;
  podId?: string;
  sortBy?: string;
  order?: 'ASC' | 'DESC';
}): Promise<PaginatedSubscriptions> {
  const filter: Record<string, unknown> = {};
  if (input.status) filter.status = input.status;
  if (input.userId) filter.userId = input.userId;
  if (input.podId) filter.podId = input.podId;

  const sortBy = input.sortBy ?? 'createdAt';
  const sortOrder = input.order === 'ASC' ? 1 : -1;
  const total = await SubscriptionModel.countDocuments(filter);
  const totalPages = Math.ceil(total / input.limit);
  const skip = (input.page - 1) * input.limit;

  const docs = await SubscriptionModel.find(filter)
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(input.limit)
    .lean({ virtuals: true });

  return {
    items: docs.map(toSubscription).filter(Boolean) as Subscription[],
    total,
    page: input.page,
    limit: input.limit,
    totalPages,
  };
}

export async function resolveSubscriptionUser(userId: string): Promise<User | null> {
  return findUserById(userId);
}

export async function resolveSubscriptionPod(podId: string): Promise<Pod | null> {
  const doc = await PodModel.findById(podId).lean({ virtuals: true });
  return toPod(doc);
}
