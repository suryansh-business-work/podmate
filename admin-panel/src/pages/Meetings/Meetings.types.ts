export type MeetingPurpose = 'POD_OWNER' | 'VENUE_OWNER' | 'GENERAL';

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
  googleEventId: string;
  status: string;
  purpose: MeetingPurpose;
  adminNote: string;
  cancelReason: string;
  rescheduledFrom: string;
  rescheduledBy: string;
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

export const PURPOSE_LABELS: Record<MeetingPurpose, string> = {
  POD_OWNER: 'Pod Owner',
  VENUE_OWNER: 'Venue Owner',
  GENERAL: 'General',
};

export const PURPOSE_COLORS: Record<MeetingPurpose, 'primary' | 'secondary' | 'default'> = {
  POD_OWNER: 'primary',
  VENUE_OWNER: 'secondary',
  GENERAL: 'default',
};
