import { v4 as uuidv4 } from 'uuid';
import type { User, CreateUserInput, UpdateUserInput, PaginationInput, PaginatedResponse } from './user.models';
import { UserModel, UserRole, toUser } from './user.models';
import { disableUserPods, enableUserPods } from '../pod/pod.services';

export async function findUserById(id: string): Promise<User | null> {
  const doc = await UserModel.findById(id).lean({ virtuals: true });
  return toUser(doc);
}

export async function findUserByPhone(phone: string): Promise<User | null> {
  const doc = await UserModel.findOne({ phone }).lean({ virtuals: true });
  return toUser(doc);
}

export async function findUserByUsername(username: string): Promise<User | null> {
  const doc = await UserModel.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } }).lean({ virtuals: true });
  return toUser(doc);
}

export async function isUsernameAvailable(username: string, excludeUserId?: string): Promise<boolean> {
  const filter: Record<string, unknown> = { username: { $regex: new RegExp(`^${username}$`, 'i') } };
  if (excludeUserId) filter._id = { $ne: excludeUserId };
  const count = await UserModel.countDocuments(filter);
  return count === 0;
}

export async function createUser(input: CreateUserInput): Promise<User> {
  const doc = await UserModel.create({
    _id: uuidv4(),
    phone: input.phone,
    email: input.email ?? '',
    password: input.password ?? '',
    username: input.username ?? '',
    name: input.name ?? '',
    age: input.age ?? 0,
    dob: input.dob ?? '',
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
  if (input.email !== undefined) update.email = input.email;

  const updated = await UserModel.findByIdAndUpdate(id, { $set: update }, { returnDocument: 'after' }).lean({
    virtuals: true,
  });
  const result = toUser(updated);
  if (!result) throw new Error('User not found');
  return result;
}

export async function completeUserProfile(
  id: string,
  username: string,
  name: string,
  dob: string,
): Promise<User> {
  /* Validate username uniqueness */
  const available = await isUsernameAvailable(username, id);
  if (!available) throw new Error('Username is already taken');

  const updated = await UserModel.findByIdAndUpdate(
    id,
    { $set: { username, name, dob } },
    { returnDocument: 'after' },
  ).lean({ virtuals: true });
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
    { returnDocument: 'after' },
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
      { username: { $regex: q, $options: 'i' } },
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
    { returnDocument: 'after' },
  ).lean({ virtuals: true });
  const result = toUser(updated);
  if (!result) throw new Error('User not found');

  /* Cascade: close/reopen all user's pods */
  if (!isActive) {
    await disableUserPods(id);
  } else {
    await enableUserPods(id);
  }

  return result;
}

export async function deleteUser(id: string): Promise<boolean> {
  /* Cascade: delete all user's pods */
  const { PodModel } = await import('../pod/pod.models');
  await PodModel.deleteMany({ hostId: id });

  /* Remove user from all attended pods */
  await PodModel.updateMany(
    { attendeeIds: id },
    { $pull: { attendeeIds: id }, $inc: { currentSeats: -1 } },
  );

  /* Delete user's support tickets */
  const { SupportTicketModel } = await import('../support/support.models');
  await SupportTicketModel.deleteMany({ userId: id });

  /* Delete user's places */
  const { PlaceModel } = await import('../place/place.models');
  await PlaceModel.deleteMany({ ownerId: id });

  const result = await UserModel.deleteOne({ _id: id });
  return result.deletedCount > 0;
}
