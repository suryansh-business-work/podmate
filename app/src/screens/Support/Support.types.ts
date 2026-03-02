import * as Yup from 'yup';
import { colors } from '../../theme';

export interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  adminReply: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupportScreenProps {
  onBack: () => void;
}

export const ticketSchema = Yup.object().shape({
  subject: Yup.string().min(3, 'Min 3 characters').max(200).required('Subject is required'),
  message: Yup.string().min(10, 'Min 10 characters').max(5000).required('Message is required'),
});

export const STATUS_COLORS: Record<string, string> = {
  OPEN: colors.warning,
  IN_PROGRESS: colors.accent,
  RESOLVED: colors.success,
  CLOSED: colors.textTertiary,
};
