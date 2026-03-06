export interface UserDetail {
  id: string;
  phone: string;
  email: string;
  name: string;
  username: string;
  dob: string;
  avatar: string;
  role: string;
  isVerifiedHost: boolean;
  isActive: boolean;
  disableReason: string;
  podCount: number;
  themePreference: string;
  savedPodIds: string[];
  createdAt: string;
}

export interface AdminUpdateUserInput {
  name?: string;
  email?: string;
  phone?: string;
  username?: string;
  dob?: string;
  avatar?: string;
  role?: string;
  isVerifiedHost?: boolean;
  isActive?: boolean;
  disableReason?: string;
}

export interface PodSummary {
  id: string;
  title: string;
  category: string;
  status: string;
  dateTime: string;
  currentSeats: number;
  maxSeats: number;
  feePerPerson: number;
  location: string;
  host?: { id: string; name: string };
}

export const ROLE_OPTIONS = ['USER', 'PLACE_OWNER', 'ADMIN'] as const;

export const STATUS_COLORS: Record<string, 'success' | 'warning' | 'info' | 'default' | 'error'> = {
  NEW: 'info',
  CONFIRMED: 'success',
  PENDING: 'warning',
  COMPLETED: 'default',
  CANCELLED: 'error',
  OPEN: 'success',
  CLOSED: 'error',
};
