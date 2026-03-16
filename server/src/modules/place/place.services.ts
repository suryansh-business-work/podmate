import { v4 as uuidv4 } from 'uuid';
import type {
  Place,
  CreatePlaceInput,
  UpdatePlaceInput,
  PlacePaginationInput,
  PaginatedResponse,
} from './place.models';
import { PlaceModel, PlaceStatus, toPlace } from './place.models';
import type { User } from '../user/user.models';
import { findUserById } from '../user/user.services';

export async function createPlace(input: CreatePlaceInput, ownerId: string): Promise<Place> {
  const now = new Date().toISOString();
  const doc = await PlaceModel.create({
    _id: uuidv4(),
    name: input.name,
    description: input.description,
    address: input.address,
    city: input.city,
    state: input.state ?? '',
    country: input.country ?? '',
    pincode: input.pincode ?? '',
    imageUrl: input.imageUrl ?? '',
    mediaUrls: input.mediaUrls ?? [],
    ownerId,
    category: input.category,
    phone: input.phone ?? '',
    email: input.email ?? '',
    latitude: input.latitude ?? 0,
    longitude: input.longitude ?? 0,
    status: PlaceStatus.PENDING,
    isVerified: false,
    createdAt: now,
    updatedAt: now,
  });
  return toPlace(doc.toObject({ virtuals: true })) as Place;
}

export async function adminCreatePlace(input: CreatePlaceInput, ownerId: string): Promise<Place> {
  const now = new Date().toISOString();
  const doc = await PlaceModel.create({
    _id: uuidv4(),
    name: input.name,
    description: input.description,
    address: input.address,
    city: input.city,
    state: input.state ?? '',
    country: input.country ?? '',
    pincode: input.pincode ?? '',
    imageUrl: input.imageUrl ?? '',
    ownerId,
    category: input.category,
    phone: input.phone ?? '',
    email: input.email ?? '',
    latitude: input.latitude ?? 0,
    longitude: input.longitude ?? 0,
    status: PlaceStatus.APPROVED,
    isVerified: true,
    createdAt: now,
    updatedAt: now,
  });
  return toPlace(doc.toObject({ virtuals: true })) as Place;
}

export async function updatePlace(id: string, input: UpdatePlaceInput): Promise<Place> {
  const update: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  if (input.name !== undefined) update.name = input.name;
  if (input.description !== undefined) update.description = input.description;
  if (input.address !== undefined) update.address = input.address;
  if (input.city !== undefined) update.city = input.city;
  if (input.state !== undefined) update.state = input.state;
  if (input.country !== undefined) update.country = input.country;
  if (input.pincode !== undefined) update.pincode = input.pincode;
  if (input.imageUrl !== undefined) update.imageUrl = input.imageUrl;
  if (input.category !== undefined) update.category = input.category;
  if (input.phone !== undefined) update.phone = input.phone;
  if (input.email !== undefined) update.email = input.email;
  if (input.latitude !== undefined) update.latitude = input.latitude;
  if (input.longitude !== undefined) update.longitude = input.longitude;

  const updated = await PlaceModel.findByIdAndUpdate(
    id,
    { $set: update },
    { returnDocument: 'after' },
  ).lean({
    virtuals: true,
  });
  const result = toPlace(updated);
  if (!result) throw new Error('Place not found');
  return result;
}

export async function approvePlace(id: string): Promise<Place> {
  const updated = await PlaceModel.findByIdAndUpdate(
    id,
    {
      $set: { status: PlaceStatus.APPROVED, isVerified: true, updatedAt: new Date().toISOString() },
    },
    { returnDocument: 'after' },
  ).lean({ virtuals: true });
  const result = toPlace(updated);
  if (!result) throw new Error('Place not found');
  return result;
}

export async function rejectPlace(id: string): Promise<Place> {
  const updated = await PlaceModel.findByIdAndUpdate(
    id,
    {
      $set: {
        status: PlaceStatus.REJECTED,
        isVerified: false,
        updatedAt: new Date().toISOString(),
      },
    },
    { returnDocument: 'after' },
  ).lean({ virtuals: true });
  const result = toPlace(updated);
  if (!result) throw new Error('Place not found');
  return result;
}

export async function deletePlace(id: string): Promise<boolean> {
  const result = await PlaceModel.deleteOne({ _id: id });
  return result.deletedCount > 0;
}

export async function bulkDeletePlaces(ids: string[]): Promise<number> {
  const result = await PlaceModel.deleteMany({ _id: { $in: ids } });
  return result.deletedCount;
}

export async function getPlaceById(id: string): Promise<Place | null> {
  const doc = await PlaceModel.findById(id).lean({ virtuals: true });
  return toPlace(doc);
}

export async function getPlacesByOwner(ownerId: string): Promise<Place[]> {
  const docs = await PlaceModel.find({ ownerId }).lean({ virtuals: true });
  return docs.map(toPlace).filter(Boolean) as Place[];
}

export async function getApprovedPlaces(search?: string, city?: string): Promise<Place[]> {
  const filter: Record<string, unknown> = { status: PlaceStatus.APPROVED };
  if (city) {
    filter.city = { $regex: `^${city}$`, $options: 'i' };
  }
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { address: { $regex: search, $options: 'i' } },
      { city: { $regex: search, $options: 'i' } },
    ];
  }
  const docs = await PlaceModel.find(filter).sort({ name: 1 }).lean({ virtuals: true });
  return docs.map(toPlace).filter(Boolean) as Place[];
}

export async function resolveOwner(ownerId: string): Promise<User | null> {
  return findUserById(ownerId);
}

export async function getPaginatedPlaces(
  input: PlacePaginationInput,
): Promise<PaginatedResponse<Place>> {
  const filter: Record<string, unknown> = {};

  if (input.status) filter.status = input.status;
  if (input.search) {
    const q = input.search;
    filter.$or = [
      { name: { $regex: q, $options: 'i' } },
      { address: { $regex: q, $options: 'i' } },
      { city: { $regex: q, $options: 'i' } },
      { category: { $regex: q, $options: 'i' } },
    ];
  }

  const sortBy = input.sortBy ?? 'createdAt';
  const sortOrder = input.order === 'ASC' ? 1 : -1;
  const total = await PlaceModel.countDocuments(filter);
  const totalPages = Math.ceil(total / input.limit);
  const skip = (input.page - 1) * input.limit;

  const docs = await PlaceModel.find(filter)
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(input.limit)
    .lean({ virtuals: true });

  return {
    items: docs.map(toPlace).filter(Boolean) as Place[],
    total,
    page: input.page,
    limit: input.limit,
    totalPages,
  };
}
