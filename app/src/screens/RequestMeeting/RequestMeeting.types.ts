export interface MeetingFormValues {
  email: string;
  updateProfileEmail: boolean;
  meetingDate: string;
  meetingTime: string;
}

export interface BookedSlot {
  meetingTime: string;
}

export interface MeetingResult {
  id: string;
  userEmail: string;
  meetingDate: string;
  meetingTime: string;
  status: string;
  createdAt: string;
}
