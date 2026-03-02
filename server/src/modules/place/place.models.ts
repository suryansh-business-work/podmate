export enum PlaceStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface Place {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  imageUrl: string;
  ownerId: string;
  category: string;
  phone: string;
  email: string;
  status: PlaceStatus;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlaceInput {
  name: string;
  description: string;
  address: string;
  city: string;
  imageUrl?: string;
  category: string;
  phone?: string;
  email?: string;
}

export interface UpdatePlaceInput {
  name?: string;
  description?: string;
  address?: string;
  city?: string;
  imageUrl?: string;
  category?: string;
  phone?: string;
  email?: string;
}

export interface PlacePaginationInput {
  page: number;
  limit: number;
  search?: string;
  status?: PlaceStatus;
  sortBy?: string;
  order?: 'ASC' | 'DESC';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
