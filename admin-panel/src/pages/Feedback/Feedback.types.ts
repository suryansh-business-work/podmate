export interface FeedbackUser {
  id: string;
  name: string;
  phone: string;
}

export interface FeedbackItem {
  id: string;
  userId: string;
  user: FeedbackUser | null;
  type: string;
  title: string;
  description: string;
  status: string;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedFeedback {
  allFeedback: {
    items: FeedbackItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const FEEDBACK_STATUS_COLORS: Record<string, 'warning' | 'info' | 'success' | 'default'> = {
  PENDING: 'warning',
  REVIEWED: 'info',
  RESOLVED: 'success',
};

export const FEEDBACK_TYPE_COLORS: Record<string, 'error' | 'primary' | 'default'> = {
  BUG: 'error',
  FEATURE: 'primary',
  GENERAL: 'default',
};
