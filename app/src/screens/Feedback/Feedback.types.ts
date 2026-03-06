export interface FeedbackUser {
  id: string;
  name: string;
  avatar: string;
}

export interface Feedback {
  id: string;
  type: 'BUG' | 'FEATURE' | 'GENERAL';
  status: 'PENDING' | 'REVIEWED' | 'RESOLVED';
  title: string;
  description: string;
  adminNotes: string;
  user: FeedbackUser;
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackScreenProps {
  onBack: () => void;
}

export type FeedbackType = 'BUG' | 'FEATURE' | 'GENERAL';

export interface FeedbackFormValues {
  type: FeedbackType;
  title: string;
  description: string;
}
