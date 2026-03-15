export interface User {
  id: string;
  phone: string;
  email: string;
  name: string;
  username: string;
  dob: string;
  avatar: string;
  roles: string[];
  activeRole: string;
  isVerifiedHost: boolean;
  isActive: boolean;
  disableReason: string;
  podCount: number;
  createdAt: string;
}

export interface UsersData {
  users: {
    items: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export type Order = 'ASC' | 'DESC';

export const roleColor: Record<string, 'primary' | 'warning' | 'error' | 'default' | 'info'> = {
  USER: 'default',
  VENUE_OWNER: 'warning',
  HOST: 'info',
  ADMIN: 'error',
};

export const ROLE_LABELS: Record<string, string> = {
  USER: 'User',
  VENUE_OWNER: 'Venue Owner',
  HOST: 'Host',
  ADMIN: 'Admin',
};

export const formatDate = (dateStr: string): string =>
  new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
