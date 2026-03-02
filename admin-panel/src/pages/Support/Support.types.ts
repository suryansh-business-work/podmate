export interface TicketReply {
  id: string;
  senderRole: 'USER' | 'ADMIN';
  content: string;
  createdAt: string;
  sender: { id: string; name: string } | null;
}

export interface SupportTicket {
  id: string;
  userId: string;
  user: { id: string; name: string; phone: string } | null;
  subject: string;
  message: string;
  status: string;
  priority: string;
  adminReply: string;
  replies: TicketReply[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedSupportTickets {
  supportTickets: {
    items: SupportTicket[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface SupportTicketCounts {
  supportTicketCounts: {
    open: number;
    inProgress: number;
    resolved: number;
    closed: number;
    total: number;
  };
}

export type Order = 'ASC' | 'DESC';

export const STATUS_COLORS: Record<string, 'warning' | 'info' | 'success' | 'default'> = {
  OPEN: 'warning',
  IN_PROGRESS: 'info',
  RESOLVED: 'success',
  CLOSED: 'default',
};

export const PRIORITY_COLORS: Record<string, string> = {
  LOW: '#10b981',
  MEDIUM: '#f59e0b',
  HIGH: '#ef4444',
};
