import * as Yup from 'yup';

export interface LoginPageProps {
  onLogin: (token: string) => void;
}

export const loginSchema = Yup.object({
  email: Yup.string().email('Enter a valid email address').required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});
