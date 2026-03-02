import { v4 as uuidv4 } from 'uuid';
import type { User, CreateUserInput, UpdateUserInput, PaginationInput, PaginatedResponse } from './user.models';
import { UserRole } from './user.models';

const users: Map<string, User> = new Map();

const seedUsers: User[] = [
  {
    id: 'user-1',
    phone: '+919999999999',
    email: '',
    password: '',
    name: 'Sarah L.',
    age: 0,
    avatar: '',
    role: UserRole.PLACE_OWNER,
    isVerifiedHost: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-2',
    phone: '+919888888888',
    email: '',
    password: '',
    name: 'Alex D.',
    age: 0,
    avatar: '',
    role: UserRole.PLACE_OWNER,
    isVerifiedHost: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-3',
    phone: '+919777777777',
    email: '',
    password: '',
    name: 'Vineet K.',
    age: 0,
    avatar: '',
    role: UserRole.USER,
    isVerifiedHost: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-4',
    phone: '+919666666666',
    email: '',
    password: '',
    name: 'Chef Kenji',
    age: 0,
    avatar: '',
    role: UserRole.PLACE_OWNER,
    isVerifiedHost: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'admin-1',
    phone: '+919000000000',
    email: 'suryansh@exyconn.com',
    password: '12345678',
    name: 'Admin',
    age: 0,
    avatar: '',
    role: UserRole.ADMIN,
    isVerifiedHost: false,
    createdAt: new Date().toISOString(),
  },
];

seedUsers.forEach((u) => users.set(u.id, u));

export function findUserById(id: string): User | undefined {
  return users.get(id);
}

export function findUserByPhone(phone: string): User | undefined {
  return [...users.values()].find((u) => u.phone === phone);
}

export function createUser(input: CreateUserInput): User {
  const user: User = {
    id: uuidv4(),
    phone: input.phone,
    email: input.email ?? '',
    password: input.password ?? '',
    name: input.name ?? '',
    age: input.age ?? 0,
    avatar: input.avatar ?? '',
    role: input.role ?? UserRole.USER,
    isVerifiedHost: false,
    createdAt: new Date().toISOString(),
  };
  users.set(user.id, user);
  return user;
}

export function updateUser(id: string, input: UpdateUserInput): User {
  const user = users.get(id);
  if (!user) throw new Error('User not found');
  if (input.name !== undefined) user.name = input.name;
  if (input.avatar !== undefined) user.avatar = input.avatar;
  if (input.age !== undefined) user.age = input.age;
  users.set(user.id, user);
  return user;
}

export function findUserByEmail(email: string): User | undefined {
  return [...users.values()].find((u) => u.email === email);
}

export function updateUserRole(id: string, role: UserRole): User {
  const user = users.get(id);
  if (!user) throw new Error('User not found');
  user.role = role;
  users.set(user.id, user);
  return user;
}

export function getAllUsers(): User[] {
  return [...users.values()];
}

export function getPaginatedUsers(input: PaginationInput): PaginatedResponse<User> {
  let items = [...users.values()];

  if (input.search) {
    const q = input.search.toLowerCase();
    items = items.filter(
      (u) => u.name.toLowerCase().includes(q) || u.phone.includes(q) || u.email.toLowerCase().includes(q),
    );
  }

  const sortBy = input.sortBy ?? 'createdAt';
  const order = input.order ?? 'DESC';
  items.sort((a, b) => {
    const aVal = String(a[sortBy as keyof User] ?? '');
    const bVal = String(b[sortBy as keyof User] ?? '');
    return order === 'ASC' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
  });

  const total = items.length;
  const totalPages = Math.ceil(total / input.limit);
  const start = (input.page - 1) * input.limit;
  items = items.slice(start, start + input.limit);

  return { items, total, page: input.page, limit: input.limit, totalPages };
}
