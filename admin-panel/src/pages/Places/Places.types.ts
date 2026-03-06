export type Order = 'ASC' | 'DESC';

export interface Owner {
  id: string;
  name: string;
  phone: string;
}

export interface Place {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  imageUrl: string;
  owner: Owner;
  category: string;
  phone: string;
  email: string;
  status: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PlacesData {
  places: {
    items: Place[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const statusColor: Record<string, 'warning' | 'success' | 'error' | 'default'> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'error',
};

export const STATUS_TABS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED'];

export const formatDate = (dateStr: string): string =>
  new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
