import * as Yup from 'yup';
import { lightColors } from '../../colors';

export interface TicketReply {
  id: string;
  senderRole: 'USER' | 'ADMIN';
  content: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  replies: TicketReply[];
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
  OPEN: lightColors.warning,
  IN_PROGRESS: lightColors.accent,
  RESOLVED: lightColors.success,
  CLOSED: lightColors.textTertiary,
};
