export interface AppSetting {
  id: string;
  key: string;
  value: string;
  category: string;
  updatedAt: string;
}

export interface SettingsData {
  appSettings: AppSetting[];
}

export interface SmtpConfig {
  host: string;
  port: string;
  user: string;
  password: string;
  fromName: string;
  fromEmail: string;
}

export const SMTP_KEYS: { key: keyof SmtpConfig; label: string; type?: string }[] = [
  { key: 'host', label: 'SMTP Host' },
  { key: 'port', label: 'SMTP Port' },
  { key: 'user', label: 'SMTP Username' },
  { key: 'password', label: 'SMTP Password', type: 'password' },
  { key: 'fromName', label: 'From Name' },
  { key: 'fromEmail', label: 'From Email', type: 'email' },
];

export const DEFAULT_SMTP: SmtpConfig = {
  host: '',
  port: '587',
  user: '',
  password: '',
  fromName: '',
  fromEmail: '',
};
