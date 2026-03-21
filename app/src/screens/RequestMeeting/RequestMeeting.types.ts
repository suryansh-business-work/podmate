import type { MeetingPurpose } from '../../navigation/RootNavigator.types';

export type { MeetingPurpose } from '../../navigation/RootNavigator.types';

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

export interface PurposeConfig {
  headerTitle: string;
  subtitle: string;
  emailHelperText: string;
  successTitle: string;
  successSubtitle: string;
}

export const PURPOSE_CONFIG: Record<MeetingPurpose, PurposeConfig> = {
  POD_OWNER: {
    headerTitle: 'Become a Pod Owner',
    subtitle: 'Schedule a meeting with our team to get started as a Pod Owner',
    emailHelperText:
      'We need your email to send you the onboarding meeting invite for becoming a Pod Owner.',
    successTitle: 'Pod Owner Request Submitted!',
    successSubtitle:
      'Your meeting request to become a Pod Owner has been submitted. You will receive a Google Meet invite at {email} once confirmed by our team.',
  },
  VENUE_OWNER: {
    headerTitle: 'Register a Venue',
    subtitle: 'Schedule a meeting with our team to register your venue',
    emailHelperText:
      'We need your email to send you the onboarding meeting invite for venue registration.',
    successTitle: 'Venue Registration Request Submitted!',
    successSubtitle:
      'Your meeting request to register a venue has been submitted. You will receive a Google Meet invite at {email} once confirmed by our team.',
  },
  GENERAL: {
    headerTitle: 'Request Meeting',
    subtitle: 'Schedule a 1:1 meeting with our team',
    emailHelperText:
      'We need your email to send you the meeting invite. Please verify your email address.',
    successTitle: 'Request Submitted!',
    successSubtitle:
      'Your 1:1 meeting request has been submitted. You will receive a Google Meet invite at {email} once confirmed by our team.',
  },
};
