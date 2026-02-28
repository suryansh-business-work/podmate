import { v4 as uuidv4 } from 'uuid';
import type { User, CreateUserInput, UpdateUserInput, PaginationInput, PaginatedResponse } from './user.models';
import { UserRole } from './user.models';

const users: Map<string, User> = new Map();

const seedUsers: User[] = [
  {
    id: 'user-1',
    phone: '+919999999999',
    name: 'Sarah L.',
    avatar: 'https://i.pravatar.cc/150?img=1',
    role: UserRole.PLACE_OWNER,
    isVerifiedHost: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-2',
    phone: '+919888888888',
    name: 'Alex D.',
    avatar: 'https://i.pravatar.cc/150?img=2',
    role: UserRole.PLACE_OWNER,
    isVerifiedHost: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-3',
    phone: '+919777777777',
    name: 'Vineet K.',
    avatar: 'https://i.pravatar.cc/150?img=3',
    role: UserRole.USER,
    isVerifiedHost: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-4',
    phone: '+919666666666',
    name: 'Chef Kenji',
    avatar: 'https://i.pravatar.cc/150?img=4',
    role: UserRole.PLACE_OWNER,
    isVerifiedHost: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'admin-1',
    phone: '+919000000000',
    name: 'Admin',
    avatar: 'https://i.pravatar.cc/150?img=10',
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
    name: '',
    avatar: `https://i.pravatar.cc/150?u=${input.phone}`,
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
  users.set(user.id, user);
  return user;
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
      (u) => u.name.toLowerCase().includes(q) || u.phone.includes(q),
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
