import * as Yup from 'yup';

export interface Policy {
  id: string;
  type: string;
  title: string;
  content: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const policySchema = Yup.object({
  type: Yup.string().oneOf(['VENUE', 'USER', 'HOST']).required('Type is required'),
  title: Yup.string().min(3, 'Minimum 3 characters').required('Title is required'),
  content: Yup.string().min(10, 'Minimum 10 characters').required('Content is required'),
});

export const POLICY_COLORS: Record<string, string> = {
  VENUE: '#f97316',
  USER: '#5b4cdb',
  HOST: '#10b981',
};
