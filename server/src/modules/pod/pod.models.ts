export interface Pod {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  hostId: string;
  feePerPerson: number;
  maxSeats: number;
  currentSeats: number;
  dateTime: string;
  location: string;
  locationDetail: string;
  rating: number;
  reviewCount: number;
  status: PodStatus;
  refundPolicy: string;
  attendeeIds: string[];
  createdAt: string;
}

export type PodStatus = 'NEW' | 'CONFIRMED' | 'PENDING' | 'COMPLETED' | 'CANCELLED';

export interface CreatePodInput {
  title: string;
  description: string;
  category: string;
  imageUrl?: string;
  feePerPerson: number;
  maxSeats: number;
  dateTime: string;
  location: string;
  locationDetail: string;
  refundPolicy?: string;
}

export interface UpdatePodInput {
  title?: string;
  description?: string;
  category?: string;
  imageUrl?: string;
  feePerPerson?: number;
  maxSeats?: number;
  dateTime?: string;
  location?: string;
  locationDetail?: string;
}

export interface PodPaginationInput {
  page: number;
  limit: number;
  category?: string;
  search?: string;
  sortBy?: string;
  order?: 'ASC' | 'DESC';
}

export interface PaginatedPods {
  items: Pod[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
