import type { CreatePaymentInput, ProcessRefundInput } from './payment.models';

export function validateCreatePayment(input: CreatePaymentInput): void {
  if (!input.userId || input.userId.trim().length === 0) {
    throw new Error('User ID is required');
  }
  if (!input.podId || input.podId.trim().length === 0) {
    throw new Error('Pod ID is required');
  }
  if (input.amount <= 0) {
    throw new Error('Amount must be positive');
  }
}

export function validateProcessRefund(input: ProcessRefundInput): void {
  if (!input.paymentId || input.paymentId.trim().length === 0) {
    throw new Error('Payment ID is required');
  }
  if (input.amount !== undefined && input.amount <= 0) {
    throw new Error('Refund amount must be positive');
  }
}
