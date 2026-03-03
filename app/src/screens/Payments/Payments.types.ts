export interface PaymentItem {
  id: string;
  amount: number;
  type: 'PAYMENT' | 'REFUND' | 'PARTIAL_REFUND';
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  transactionId: string;
  gateway: string;
  notes: string;
  refundAmount: number;
  createdAt: string;
}

export interface PaymentsScreenProps {
  onBack: () => void;
}
