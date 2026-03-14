import mongoose, { Schema, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface City {
  id: string;
  name: string;
  state: string;
  country: string;
  imageUrl: string;
  clubCount: number;
  isTopCity: boolean;
  isActive: boolean;
  sortOrder: number;
  pincodes: string[];
  areas: Area[];
  createdAt: string;
  updatedAt: string;
}

export interface Area {
  id: string;
  name: string;
  cityId: string;
  pincodes: string[];
}

export interface CreateCityInput {
  name: string;
  state?: string;
  country?: string;
  imageUrl?: string;
  isTopCity?: boolean;
  isActive?: boolean;
  sortOrder?: number;
  pincodes?: string[];
}

export interface UpdateCityInput {
  name?: string;
  state?: string;
  country?: string;
  imageUrl?: string;
  clubCount?: number;
  isTopCity?: boolean;
  isActive?: boolean;
  sortOrder?: number;
  pincodes?: string[];
}

export interface CreateAreaInput {
  name: string;
  cityId: string;
  pincodes?: string[];
}

export interface PaginatedCities {
  items: City[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/* ── Area Sub-Schema ── */
const AreaSchema = new Schema<Area & { _id: string }>(
  {
    _id: { type: String, default: () => uuidv4() },
    name: { type: String, required: true },
    cityId: { type: String, required: true },
    pincodes: { type: [String], default: [] },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

/* ── City Mongoose Schema ── */
export type CityMongoDoc = Omit<City, 'id' | 'areas'> & {
  _id: string;
  areas: (Area & { _id: string })[];
};

const CitySchema = new Schema<CityMongoDoc>(
  {
    _id: { type: String, default: () => uuidv4() },
    name: { type: String, required: true },
    state: { type: String, default: 'India' },
    country: { type: String, default: 'India' },
    imageUrl: { type: String, default: '' },
    clubCount: { type: Number, default: 0 },
    isTopCity: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    pincodes: { type: [String], default: [] },
    areas: { type: [AreaSchema], default: [] },
    createdAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: { type: String, default: () => new Date().toISOString() },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

export const CityModel =
  (mongoose.models['City'] as mongoose.Model<CityMongoDoc> | undefined) ??
  model<CityMongoDoc>('City', CitySchema);

export function toCity(doc: (CityMongoDoc & { id?: string }) | null): City | null {
  if (!doc) return null;
  return {
    ...doc,
    id: doc.id ?? doc._id,
    pincodes: doc.pincodes ?? [],
    areas: (doc.areas ?? []).map((a) => ({
      id: a._id ?? (a as Area & { id?: string }).id ?? '',
      name: a.name,
      cityId: a.cityId,
      pincodes: a.pincodes ?? [],
    })),
  } as City;
}
