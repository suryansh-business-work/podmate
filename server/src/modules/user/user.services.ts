import { v4 as uuidv4 } from 'uuid';
import type { User, CreateUserInput, UpdateUserInput, PaginationInput, PaginatedResponse } from './user.models';
import { UserModel, UserRole, toUser } from './user.models';

export async function findUserById(id: string): Promise<User | null> {
  const doc = await UserModel.findById(id).lean({ virtuals: true });
  return toUser(doc);
}

export async function findUserByPhone(phone: string): Promise<User | null> {
  const doc = await UserModel.findOne({ phone }).lean({ virtuals: true });
  return toUser(doc);
}

export async function createUser(input: CreateUserInput): Promise<User> {
  const doc = await UserModel.create({
    _id: uuidv4(),
    phone: input.phone,
    email: input.email ?? '',
    password: input.password ?? '',
    name: input.name ?? '',
    age: input.age ?? 0,
    avatar: input.avatar ?? '',
    role: input.role ?? UserRole.USER,
    isVerifiedHost: false,
    createdAt: new Date().toISOString(),
  });
  return toUser(doc.toObject({ virtuals: true })) as User;
}

export async function updateUser(id: string, input: UpdateUserInput): Promise<User> {
  const update: Record<string, unknown> = {};
  if (input.name !== undefined) update.name = input.name;
  if (input.avatar !== undefined) update.avatar = input.avatar;
  if (input.age !== undefined) update.age = input.age;

  const updated = await UserModel.findByIdAndUpdate(id, { $set: update }, { new: true }).lean({
    virtuals: true,
  });
  const result = toUser(updated);
  if (!result) throw new Error('User not found');
  return result;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const doc = await UserModel.findOne({ email }).lean({ virtuals: true });
  return toUser(doc);
}

export async function updateUserRole(id: string, role: UserRole): Promise<User> {
  const updated = await UserModel.findByIdAndUpdate(
    id,
    { $set: { role } },
    { new: true },
  ).lean({ virtuals: true });
  const result = toUser(updated);
  if (!result) throw new Error('User not found');
  return result;
}

export async function getAllUsers(): Promise<User[]> {
  const docs = await UserModel.find().lean({ virtuals: true });
  return docs.map(toUser).filter(Boolean) as User[];
}

export async function getPaginatedUsers(input: PaginationInput): Promise<PaginatedResponse<User>> {
  const filter: Record<string, unknown> = {};
  if (input.search) {
    const q = input.search;
    filter.$or = [
      { name: { $regex: q, $options: 'i' } },
      { phone: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } },
    ];
  }

  const sortBy = input.sortBy ?? 'createdAt';
  const sortOrder = input.order === 'ASC' ? 1 : -1;
  const total = await UserModel.countDocuments(filter);
  const totalPages = Math.ceil(total / input.limit);
  const skip = (input.page - 1) * input.limit;

  const docs = await UserModel.find(filter)
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(input.limit)
    .lean({ virtuals: true });

  return {
    items: docs.map(toUser).filter(Boolean) as User[],
    total,
    page: input.page,
    limit: input.limit,
    totalPages,
  };
}

export async function toggleUserActive(id: string, isActive: boolean, reason: string): Promise<User> {
  const updated = await UserModel.findByIdAndUpdate(
    id,
    { $set: { isActive, disableReason: isActive ? '' : reason } },
    { new: true },
  ).lean({ virtuals: true });
  const result = toUser(updated);
  if (!result) throw new Error('User not found');
  return result;
}
