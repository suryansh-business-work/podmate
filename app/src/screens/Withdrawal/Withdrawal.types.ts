import { ComponentProps } from 'react';
import { MaterialIcons } from '@expo/vector-icons';

export type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];

export interface WithdrawalScreenProps {
  onBack: () => void;
}

export type TransactionFilter = 'ALL' | 'EARNINGS' | 'WITHDRAWALS' | 'PENDING';

export const TRANSACTION_FILTERS: { key: TransactionFilter; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'EARNINGS', label: 'Earnings' },
  { key: 'WITHDRAWALS', label: 'Withdrawals' },
  { key: 'PENDING', label: 'Pending' },
];

export type TxnType = 'EARNING' | 'WITHDRAWAL';
export type TxnStatus = 'COMPLETED' | 'PROCESSING' | 'FAILED' | 'PENDING';

export interface TransactionItem {
  id: string;
  type: TxnType;
  amount: number;
  status: TxnStatus;
  description: string;
  referenceId: string;
  createdAt: string;
}

export const TXN_STATUS_COLORS: Record<TxnStatus, string> = {
  COMPLETED: '#10B981',
  PROCESSING: '#F59E0B',
  FAILED: '#EF4444',
  PENDING: '#6B7280',
};
