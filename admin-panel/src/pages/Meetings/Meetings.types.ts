export interface MeetingUser {
  id: string;
  name: string;
  phone: string;
}

export interface Meeting {
  id: string;
  userId: string;
  user: MeetingUser | null;
  userEmail: string;
  meetingDate: string;
  meetingTime: string;
  meetingLink: string;
  status: string;
  adminNote: string;
  cancelReason: string;
  completedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedMeetings {
  meetings: {
    items: Meeting[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface MeetingCountsData {
  meetingCounts: {
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
    total: number;
  };
}

export type MeetingOrder = 'ASC' | 'DESC';

export const MEETING_STATUS_COLORS: Record<
  string,
  'warning' | 'info' | 'success' | 'default' | 'error'
> = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  COMPLETED: 'success',
  CANCELLED: 'error',
};
