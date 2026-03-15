import type { UserRole } from '../user/user.models';

export interface AuthPayload {
  userId: string;
  phone: string;
  roles: UserRole[];
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    phone: string;
    name: string;
    avatar: string;
    roles: UserRole[];
    activeRole: UserRole;
  };
  isNewUser: boolean;
}

export interface OtpResponse {
  success: boolean;
  message: string;
}

export interface GraphQLContext {
  user: AuthPayload | null;
}
