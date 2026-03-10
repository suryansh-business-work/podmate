export interface CreateUserFormValues {
  phone: string;
  name: string;
  role: 'USER' | 'PLACE_OWNER' | 'ADMIN';
  email: string;
}

export const USER_ROLES = ['USER', 'PLACE_OWNER', 'ADMIN'] as const;

export const CREATE_USER_STEPS = ['Account Info', 'Profile Details'] as const;
