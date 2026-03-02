import { v4 as uuidv4 } from 'uuid';
import type {
  Place,
  CreatePlaceInput,
  UpdatePlaceInput,
  PlacePaginationInput,
  PaginatedResponse,
} from './place.models';
import { PlaceStatus } from './place.models';
import { findUserById } from '../user/user.services';

const places: Map<string, Place> = new Map();

export function createPlace(input: CreatePlaceInput, ownerId: string): Place {
  const now = new Date().toISOString();
  const place: Place = {
    id: uuidv4(),
    name: input.name,
    description: input.description,
    address: input.address,
    city: input.city,
    imageUrl: input.imageUrl ?? '',
    ownerId,
    category: input.category,
    phone: input.phone ?? '',
    email: input.email ?? '',
    status: PlaceStatus.PENDING,
    isVerified: false,
    createdAt: now,
    updatedAt: now,
  };
  places.set(place.id, place);
  return place;
}

export function adminCreatePlace(input: CreatePlaceInput, ownerId: string): Place {
  const now = new Date().toISOString();
  const place: Place = {
    id: uuidv4(),
    name: input.name,
    description: input.description,
    address: input.address,
    city: input.city,
    imageUrl: input.imageUrl ?? '',
    ownerId,
    category: input.category,
    phone: input.phone ?? '',
    email: input.email ?? '',
    status: PlaceStatus.APPROVED,
    isVerified: true,
    createdAt: now,
    updatedAt: now,
  };
  places.set(place.id, place);
  return place;
}

export function updatePlace(id: string, input: UpdatePlaceInput): Place {
  const place = places.get(id);
  if (!place) throw new Error('Place not found');
  if (input.name !== undefined) place.name = input.name;
  if (input.description !== undefined) place.description = input.description;
  if (input.address !== undefined) place.address = input.address;
  if (input.city !== undefined) place.city = input.city;
  if (input.imageUrl !== undefined) place.imageUrl = input.imageUrl;
  if (input.category !== undefined) place.category = input.category;
  if (input.phone !== undefined) place.phone = input.phone;
  if (input.email !== undefined) place.email = input.email;
  place.updatedAt = new Date().toISOString();
  places.set(place.id, place);
  return place;
}

export function approvePlace(id: string): Place {
  const place = places.get(id);
  if (!place) throw new Error('Place not found');
  place.status = PlaceStatus.APPROVED;
  place.isVerified = true;
  place.updatedAt = new Date().toISOString();
  places.set(place.id, place);
  return place;
}

export function rejectPlace(id: string): Place {
  const place = places.get(id);
  if (!place) throw new Error('Place not found');
  place.status = PlaceStatus.REJECTED;
  place.isVerified = false;
  place.updatedAt = new Date().toISOString();
  places.set(place.id, place);
  return place;
}

export function deletePlace(id: string): boolean {
  return places.delete(id);
}

export function getPlaceById(id: string): Place | undefined {
  return places.get(id);
}

export function getPlacesByOwner(ownerId: string): Place[] {
  return [...places.values()].filter((p) => p.ownerId === ownerId);
}

export function resolveOwner(ownerId: string): unknown {
  return findUserById(ownerId) ?? null;
}

export function getPaginatedPlaces(input: PlacePaginationInput): PaginatedResponse<Place> {
  let items = [...places.values()];

  if (input.status) {
    items = items.filter((p) => p.status === input.status);
  }

  if (input.search) {
    const q = input.search.toLowerCase();
    items = items.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q),
    );
  }

  const sortBy = input.sortBy ?? 'createdAt';
  const order = input.order ?? 'DESC';
  items.sort((a, b) => {
    const aVal = String(a[sortBy as keyof Place] ?? '');
    const bVal = String(b[sortBy as keyof Place] ?? '');
    return order === 'ASC' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
  });

  const total = items.length;
  const totalPages = Math.ceil(total / input.limit);
  const start = (input.page - 1) * input.limit;
  items = items.slice(start, start + input.limit);

  return { items, total, page: input.page, limit: input.limit, totalPages };
}
