export interface CreateUserFormValues {
  phone: string;
  name: string;
  roles: string[];
  email: string;
}

export const USER_ROLES = ['USER', 'VENUE_OWNER', 'HOST', 'ADMIN'] as const;

export const CREATE_USER_STEPS = ['Account Info', 'Profile Details'] as const;
