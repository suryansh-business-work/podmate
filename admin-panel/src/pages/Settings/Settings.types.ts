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

export interface MaintenanceData {
  maintenanceMode: boolean;
}

export interface MaintenanceStatusData {
  maintenanceStatus: {
    app: boolean;
    website: boolean;
  };
}

export const CATEGORIES = [
  'general',
  'app',
  'website',
  'notifications',
  'smtp',
  'imagekit',
  'openai',
  'slack',
  'dev',
];

export const formatDate = (dateStr: string): string =>
  new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
