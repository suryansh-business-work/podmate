import mongoose, { Schema, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type SubscriptionStatus = 'ACTIVE' | 'PAUSED' | 'CANCELLED' | 'EXPIRED';
export type BillingCycle = 'DAILY' | 'WEEKLY' | 'MONTHLY';

export interface Subscription {
  id: string;
  userId: string;
  podId: string;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  amountPerCycle: number;
  totalPaid: number;
  cyclesCompleted: number;
  totalCycles: number;
  nextBillingDate: string;
  startDate: string;
  endDate: string;
  cancelledAt: string;
  lastPaymentId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubscriptionInput {
  userId: string;
  podId: string;
  billingCycle: BillingCycle;
  amountPerCycle: number;
  totalCycles: number;
  startDate: string;
  endDate: string;
}

export interface PaginatedSubscriptions {
  items: Subscription[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/* ── Mongoose ── */

export type SubscriptionMongoDoc = Omit<Subscription, 'id'> & { _id: string };

const SubscriptionSchema = new Schema<SubscriptionMongoDoc>(
  {
    _id: { type: String, default: () => uuidv4() },
    userId: { type: String, required: true, index: true },
    podId: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ['ACTIVE', 'PAUSED', 'CANCELLED', 'EXPIRED'],
      default: 'ACTIVE',
    },
    billingCycle: { type: String, enum: ['DAILY', 'WEEKLY', 'MONTHLY'], required: true },
    amountPerCycle: { type: Number, required: true },
    totalPaid: { type: Number, default: 0 },
    cyclesCompleted: { type: Number, default: 0 },
    totalCycles: { type: Number, required: true },
    nextBillingDate: { type: String, required: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    cancelledAt: { type: String, default: '' },
    lastPaymentId: { type: String, default: '' },
    createdAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: { type: String, default: () => new Date().toISOString() },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

SubscriptionSchema.index({ userId: 1, podId: 1 }, { unique: true });

export const SubscriptionModel =
  (mongoose.models['Subscription'] as mongoose.Model<SubscriptionMongoDoc> | undefined) ??
  model<SubscriptionMongoDoc>('Subscription', SubscriptionSchema);

export function toSubscription(
  doc: (SubscriptionMongoDoc & { id?: string }) | null,
): Subscription | null {
  if (!doc) return null;
  return {
    ...doc,
    id: doc.id ?? doc._id,
    cancelledAt: doc.cancelledAt ?? '',
    lastPaymentId: doc.lastPaymentId ?? '',
  } as Subscription;
}
