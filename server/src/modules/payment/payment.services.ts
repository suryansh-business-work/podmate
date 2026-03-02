import { v4 as uuidv4 } from 'uuid';
import type {
  Payment,
  CreatePaymentInput,
  ProcessRefundInput,
  PaginatedPayments,
  PaymentStats,
} from './payment.models';
import { PaymentModel, toPayment } from './payment.models';
import type { User } from '../user/user.models';
import { findUserById } from '../user/user.services';

interface PaymentPaginationInput {
  page: number;
  limit: number;
  search?: string;
  type?: string;
  status?: string;
  userId?: string;
  podId?: string;
  sortBy?: string;
  order?: 'ASC' | 'DESC';
}

export async function getPaginatedPayments(input: PaymentPaginationInput): Promise<PaginatedPayments> {
  const filter: Record<string, unknown> = {};

  if (input.type) filter.type = input.type;
  if (input.status) filter.status = input.status;
  if (input.userId) filter.userId = input.userId;
  if (input.podId) filter.podId = input.podId;
  if (input.search) {
    filter.$or = [
      { transactionId: { $regex: input.search, $options: 'i' } },
      { notes: { $regex: input.search, $options: 'i' } },
      { userId: { $regex: input.search, $options: 'i' } },
    ];
  }

  const sortBy = input.sortBy ?? 'createdAt';
  const sortOrder = input.order === 'ASC' ? 1 : -1;
  const total = await PaymentModel.countDocuments(filter);
  const totalPages = Math.ceil(total / input.limit);
  const skip = (input.page - 1) * input.limit;

  const docs = await PaymentModel.find(filter)
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(input.limit)
    .lean({ virtuals: true });

  return {
    items: docs.map(toPayment).filter(Boolean) as Payment[],
    total,
    page: input.page,
    limit: input.limit,
    totalPages,
  };
}

export async function getPaymentById(id: string): Promise<Payment | null> {
  const doc = await PaymentModel.findById(id).lean({ virtuals: true });
  return toPayment(doc);
}

export async function createPayment(input: CreatePaymentInput): Promise<Payment> {
  const doc = await PaymentModel.create({
    _id: uuidv4(),
    userId: input.userId,
    podId: input.podId,
    amount: input.amount,
    type: input.type ?? 'PAYMENT',
    status: 'PENDING',
    transactionId: input.transactionId ?? '',
    gateway: input.gateway ?? '',
    notes: input.notes ?? '',
    refundAmount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return toPayment(doc.toObject({ virtuals: true })) as Payment;
}

export async function processRefund(input: ProcessRefundInput): Promise<Payment> {
  const payment = await PaymentModel.findById(input.paymentId);
  if (!payment) throw new Error('Payment not found');
  if (payment.status !== 'COMPLETED') throw new Error('Only completed payments can be refunded');

  const refundAmount = input.amount ?? payment.amount;
  if (refundAmount <= 0) throw new Error('Refund amount must be positive');
  if (refundAmount > payment.amount - payment.refundAmount) {
    throw new Error('Refund amount exceeds remaining refundable amount');
  }

  const isPartial = refundAmount < (payment.amount - payment.refundAmount);

  /* Create refund record */
  await PaymentModel.create({
    _id: uuidv4(),
    userId: payment.userId,
    podId: payment.podId,
    amount: refundAmount,
    type: isPartial ? 'PARTIAL_REFUND' : 'REFUND',
    status: 'COMPLETED',
    transactionId: `REF-${payment.transactionId || payment._id}`,
    gateway: payment.gateway,
    notes: input.notes ?? '',
    refundAmount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  /* Update original payment */
  const updated = await PaymentModel.findByIdAndUpdate(
    input.paymentId,
    { $inc: { refundAmount }, $set: { updatedAt: new Date().toISOString() } },
    { returnDocument: 'after' },
  ).lean({ virtuals: true });

  const result = toPayment(updated);
  if (!result) throw new Error('Payment not found');
  return result;
}

export async function completePayment(id: string, transactionId?: string): Promise<Payment> {
  const update: Record<string, unknown> = {
    status: 'COMPLETED',
    updatedAt: new Date().toISOString(),
  };
  if (transactionId) update.transactionId = transactionId;

  const updated = await PaymentModel.findByIdAndUpdate(
    id,
    { $set: update },
    { returnDocument: 'after' },
  ).lean({ virtuals: true });
  const result = toPayment(updated);
  if (!result) throw new Error('Payment not found');
  return result;
}

export async function getPaymentStats(): Promise<PaymentStats> {
  const payments = await PaymentModel.find({ type: 'PAYMENT', status: 'COMPLETED' }).lean();
  const refunds = await PaymentModel.find({ type: { $in: ['REFUND', 'PARTIAL_REFUND'] }, status: 'COMPLETED' }).lean();
  const pending = await PaymentModel.countDocuments({ status: 'PENDING' });

  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalRefunds = refunds.reduce((sum, p) => sum + p.amount, 0);

  return {
    totalRevenue,
    totalRefunds,
    netRevenue: totalRevenue - totalRefunds,
    totalTransactions: payments.length + refunds.length,
    pendingPayments: pending,
  };
}

export async function resolvePaymentUser(userId: string): Promise<User | null> {
  return findUserById(userId);
}
