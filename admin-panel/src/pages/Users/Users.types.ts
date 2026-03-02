export interface User {
  id: string;
  phone: string;
  email: string;
  name: string;
  age: number;
  avatar: string;
  role: string;
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

export const roleColor: Record<string, 'primary' | 'warning' | 'error' | 'default'> = {
  USER: 'default',
  PLACE_OWNER: 'warning',
  ADMIN: 'error',
};

export const formatDate = (dateStr: string): string =>
  new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
