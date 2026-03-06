export type Order = 'ASC' | 'DESC';

export interface Host {
  id: string;
  name: string;
  avatar: string;
  isVerifiedHost: boolean;
}

export interface Attendee {
  id: string;
  name: string;
  avatar: string;
}

export interface Pod {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  feePerPerson: number;
  maxSeats: number;
  currentSeats: number;
  dateTime: string;
  location: string;
  locationDetail: string;
  rating: number;
  reviewCount: number;
  status: string;
  refundPolicy: string;
  createdAt: string;
  host: Host;
  attendees: Attendee[];
}

export interface PodsData {
  pods: {
    items: Pod[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const statusColor: Record<string, 'success' | 'warning' | 'info' | 'default' | 'error'> = {
  NEW: 'info',
  CONFIRMED: 'success',
  PENDING: 'warning',
  COMPLETED: 'default',
  CANCELLED: 'error',
};

export const formatDate = (dateStr: string): string =>
  new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

export const formatTime = (dateStr: string): string =>
  new Date(dateStr).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
