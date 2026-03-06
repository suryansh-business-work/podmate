export interface OtpScreenProps {
  phone: string;
  onVerify: (otp: string) => Promise<void> | void;
  onBack: () => void;
  onResend: () => Promise<void> | void;
  loading?: boolean;
  error?: string;
}

export interface OtpFormValues {
  otp: string[];
}
