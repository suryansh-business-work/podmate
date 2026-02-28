export enum UserRole {
  USER = 'USER',
  PLACE_OWNER = 'PLACE_OWNER',
  ADMIN = 'ADMIN',
}

export interface User {
  id: string;
  phone: string;
  name: string;
  avatar: string;
  role: UserRole;
  isVerifiedHost: boolean;
  createdAt: string;
}

export interface CreateUserInput {
  phone: string;
  role?: UserRole;
}

export interface UpdateUserInput {
  name?: string;
  avatar?: string;
}

export interface PaginationInput {
  page: number;
  limit: number;
  search?: string;
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
