import type { UserRole } from '../user/user.models';

export interface AuthPayload {
  userId: string;
  phone: string;
  role: UserRole;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    phone: string;
    name: string;
    avatar: string;
    role: UserRole;
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
