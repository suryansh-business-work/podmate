import mongoose, { Schema, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type PaymentType = 'PAYMENT' | 'REFUND' | 'PARTIAL_REFUND';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export interface Payment {
  id: string;
  userId: string;
  podId: string;
  amount: number;
  type: PaymentType;
  status: PaymentStatus;
  transactionId: string;
  gateway: string;
  notes: string;
  refundAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentInput {
  userId: string;
  podId: string;
  amount: number;
  type?: PaymentType;
  transactionId?: string;
  gateway?: string;
  notes?: string;
}

export interface ProcessRefundInput {
  paymentId: string;
  amount?: number;
  notes?: string;
}

export interface PaginatedPayments {
  items: Payment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaymentStats {
  totalRevenue: number;
  totalRefunds: number;
  netRevenue: number;
  totalTransactions: number;
  pendingPayments: number;
}

/* ── Mongoose ── */

export type PaymentMongoDoc = Omit<Payment, 'id'> & { _id: string };

const PaymentSchema = new Schema<PaymentMongoDoc>(
  {
    _id: { type: String, default: () => uuidv4() },
    userId: { type: String, required: true },
    podId: { type: String, required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['PAYMENT', 'REFUND', 'PARTIAL_REFUND'], default: 'PAYMENT' },
    status: { type: String, enum: ['PENDING', 'COMPLETED', 'FAILED'], default: 'PENDING' },
    transactionId: { type: String, default: '' },
    gateway: { type: String, default: '' },
    notes: { type: String, default: '' },
    refundAmount: { type: Number, default: 0 },
    createdAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: { type: String, default: () => new Date().toISOString() },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

export const PaymentModel =
  (mongoose.models['Payment'] as mongoose.Model<PaymentMongoDoc> | undefined) ??
  model<PaymentMongoDoc>('Payment', PaymentSchema);

export function toPayment(doc: (PaymentMongoDoc & { id?: string }) | null): Payment | null {
  if (!doc) return null;
  return {
    ...doc,
    id: doc.id ?? doc._id,
    transactionId: doc.transactionId ?? '',
    gateway: doc.gateway ?? '',
    notes: doc.notes ?? '',
    refundAmount: doc.refundAmount ?? 0,
  } as Payment;
}
