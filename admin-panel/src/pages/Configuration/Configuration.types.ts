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

export interface ImageKitConfig {
  publicKey: string;
  privateKey: string;
  urlEndpoint: string;
}

export interface OpenAiConfig {
  apiKey: string;
  model: string;
  prePrompt: string;
}

export interface SlackConfig {
  webhookUrl: string;
  channel: string;
  enabled: string;
}

export interface AppConfig {
  appName: string;
  appDescription: string;
  appLogo: string;
  splashVideoUrl: string;
}

export interface DevConfig {
  devMode: string;
  dummyCheckout: string;
}

export interface StripeConfig {
  publishableKey: string;
  secretKey: string;
  webhookSecret: string;
  enabled: string;
}

export interface GoogleMapsConfig {
  apiKey: string;
  enabled: string;
}

export const SMTP_KEYS: { key: keyof SmtpConfig; label: string; type?: string }[] = [
  { key: 'host', label: 'SMTP Host' },
  { key: 'port', label: 'SMTP Port' },
  { key: 'user', label: 'SMTP Username' },
  { key: 'password', label: 'SMTP Password', type: 'password' },
  { key: 'fromName', label: 'From Name' },
  { key: 'fromEmail', label: 'From Email', type: 'email' },
];

export const IMAGEKIT_KEYS: { key: keyof ImageKitConfig; label: string; type?: string }[] = [
  { key: 'publicKey', label: 'Public Key' },
  { key: 'privateKey', label: 'Private Key', type: 'password' },
  { key: 'urlEndpoint', label: 'URL Endpoint' },
];

export const OPENAI_KEYS: { key: keyof OpenAiConfig; label: string; type?: string; multiline?: boolean }[] = [
  { key: 'apiKey', label: 'API Key', type: 'password' },
  { key: 'model', label: 'Model' },
  { key: 'prePrompt', label: 'Chatbot Pre-Prompt', multiline: true },
];

export const SLACK_KEYS: { key: keyof SlackConfig; label: string }[] = [
  { key: 'webhookUrl', label: 'Webhook URL' },
  { key: 'channel', label: 'Channel' },
  { key: 'enabled', label: 'Enabled (true/false)' },
];

export const DEFAULT_SMTP: SmtpConfig = {
  host: '',
  port: '587',
  user: '',
  password: '',
  fromName: '',
  fromEmail: '',
};

export const DEFAULT_IMAGEKIT: ImageKitConfig = {
  publicKey: '',
  privateKey: '',
  urlEndpoint: '',
};

export const DEFAULT_OPENAI: OpenAiConfig = {
  apiKey: '',
  model: 'gpt-4o-mini',
  prePrompt: 'You are PartyWings assistant. Help users with questions about events, pods, places, and the PartyWings platform.',
};

export const DEFAULT_SLACK: SlackConfig = {
  webhookUrl: '',
  channel: '#general',
  enabled: 'false',
};

export const DEFAULT_APP_CONFIG: AppConfig = {
  appName: 'PartyWings',
  appDescription: '',
  appLogo: '',
  splashVideoUrl: '',
};

export const DEFAULT_DEV_CONFIG: DevConfig = {
  devMode: 'false',
  dummyCheckout: 'false',
};

export const DEFAULT_STRIPE: StripeConfig = {
  publishableKey: '',
  secretKey: '',
  webhookSecret: '',
  enabled: 'false',
};

export const DEFAULT_GOOGLE_MAPS: GoogleMapsConfig = {
  apiKey: '',
  enabled: 'false',
};

export interface TestConnectionResult {
  success: boolean;
  message: string;
}
