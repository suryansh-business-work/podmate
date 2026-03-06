import * as Yup from 'yup';

export interface Policy {
  id: string;
  type: string;
  title: string;
  content: string;
  isActive: boolean;
}

export interface LoginScreenProps {
  onSendOtp: (phone: string) => Promise<void> | void;
  loading?: boolean;
  error?: string;
}

export interface LoginFormValues {
  phone: string;
}

export const loginSchema = Yup.object().shape({
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number')
    .required('Phone number is required'),
});
