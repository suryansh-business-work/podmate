export interface CallbackRequest {
  id: string;
  userId: string;
  user: { id: string; name: string; phone: string } | null;
  phone: string;
  reason: string;
  preferredTime: string;
  status: string;
  adminNote: string;
  scheduledAt: string;
  completedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedCallbackRequests {
  callbackRequests: {
    items: CallbackRequest[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CallbackRequestCounts {
  callbackRequestCounts: {
    pending: number;
    scheduled: number;
    completed: number;
    cancelled: number;
    total: number;
  };
}

export type CallbackOrder = 'ASC' | 'DESC';

export const CALLBACK_STATUS_COLORS: Record<string, 'warning' | 'info' | 'success' | 'default'> = {
  PENDING: 'warning',
  SCHEDULED: 'info',
  COMPLETED: 'success',
  CANCELLED: 'default',
};
