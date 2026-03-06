import * as Yup from 'yup';

export const POLICY_TYPES = [
  'VENUE',
  'USER',
  'HOST',
  'TERMS_OF_SERVICE',
  'PRIVACY_POLICY',
] as const;

export type PolicyType = (typeof POLICY_TYPES)[number];

export interface Policy {
  id: string;
  type: PolicyType;
  title: string;
  content: string;
  version: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PolicyFormValues {
  type: string;
  title: string;
  content: string;
}

export interface NotifyConfirmState {
  open: boolean;
  policyId: string;
  policyTitle: string;
  notifyUsers: boolean;
  notificationMethod: string;
}

export const INITIAL_NOTIFY_STATE: NotifyConfirmState = {
  open: false,
  policyId: '',
  policyTitle: '',
  notifyUsers: false,
  notificationMethod: 'IN_APP',
};

export const NOTIFICATION_METHODS = [
  { value: 'IN_APP', label: 'In-App Notification' },
  { value: 'EMAIL', label: 'Email' },
  { value: 'PUSH', label: 'Push Notification' },
] as const;

export const policySchema = Yup.object({
  type: Yup.string()
    .oneOf([...POLICY_TYPES])
    .required('Type is required'),
  title: Yup.string().min(3, 'Minimum 3 characters').required('Title is required'),
  content: Yup.string().min(10, 'Minimum 10 characters').required('Content is required'),
});

export const POLICY_COLORS: Record<string, string> = {
  VENUE: '#f97316',
  USER: '#5b4cdb',
  HOST: '#10b981',
  TERMS_OF_SERVICE: '#2563eb',
  PRIVACY_POLICY: '#7c3aed',
};

export const POLICY_TYPE_LABELS: Record<string, string> = {
  VENUE: 'Venue',
  USER: 'User',
  HOST: 'Host',
  TERMS_OF_SERVICE: 'Terms of Service',
  PRIVACY_POLICY: 'Privacy Policy',
};
