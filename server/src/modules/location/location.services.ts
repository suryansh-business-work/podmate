import { v4 as uuidv4 } from 'uuid';
import {
  CityModel,
  toCity,
  City,
  PaginatedCities,
  CreateCityInput,
  UpdateCityInput,
  CreateAreaInput,
  Area,
} from './location.models';

export async function getCities(
  page: number,
  limit: number,
  search?: string,
): Promise<PaginatedCities> {
  const filter: Record<string, unknown> = {};
  if (search) {
    filter.name = { $regex: search, $options: 'i' };
  }
  const total = await CityModel.countDocuments(filter);
  const totalPages = Math.ceil(total / limit) || 1;
  const docs = await CityModel.find(filter)
    .sort({ isTopCity: -1, sortOrder: 1, name: 1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();
  return {
    items: docs.map((d) => toCity(d)!),
    total,
    page,
    limit,
    totalPages,
  };
}

export async function getActiveCities(): Promise<City[]> {
  const docs = await CityModel.find({ isActive: true })
    .sort({ isTopCity: -1, sortOrder: 1, name: 1 })
    .lean();
  return docs.map((d) => toCity(d)!);
}

export async function getTopCities(): Promise<City[]> {
  const docs = await CityModel.find({ isActive: true, isTopCity: true })
    .sort({ sortOrder: 1, name: 1 })
    .lean();
  return docs.map((d) => toCity(d)!);
}

export async function getCityById(id: string): Promise<City | null> {
  const doc = await CityModel.findById(id).lean();
  return toCity(doc);
}

export async function createCity(input: CreateCityInput): Promise<City> {
  const doc = await CityModel.create({
    name: input.name.trim(),
    state: input.state?.trim() ?? 'India',
    country: input.country?.trim() ?? 'India',
    imageUrl: input.imageUrl?.trim() ?? '',
    isTopCity: input.isTopCity ?? false,
    isActive: input.isActive ?? true,
    sortOrder: input.sortOrder ?? 0,
  });
  return toCity(doc.toObject())!;
}

export async function updateCity(id: string, input: UpdateCityInput): Promise<City | null> {
  const updateData: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  if (input.name !== undefined) updateData.name = input.name.trim();
  if (input.state !== undefined) updateData.state = input.state.trim();
  if (input.country !== undefined) updateData.country = input.country.trim();
  if (input.imageUrl !== undefined) updateData.imageUrl = input.imageUrl.trim();
  if (input.clubCount !== undefined) updateData.clubCount = input.clubCount;
  if (input.isTopCity !== undefined) updateData.isTopCity = input.isTopCity;
  if (input.isActive !== undefined) updateData.isActive = input.isActive;
  if (input.sortOrder !== undefined) updateData.sortOrder = input.sortOrder;

  const doc = await CityModel.findByIdAndUpdate(id, updateData, { new: true }).lean();
  return toCity(doc);
}

export async function deleteCity(id: string): Promise<boolean> {
  const result = await CityModel.findByIdAndDelete(id);
  return !!result;
}

export async function addArea(input: CreateAreaInput): Promise<Area> {
  const area = { _id: uuidv4(), name: input.name.trim(), cityId: input.cityId };
  await CityModel.findByIdAndUpdate(input.cityId, { $push: { areas: area } });
  return { id: area._id, name: area.name, cityId: area.cityId };
}

export async function removeArea(cityId: string, areaId: string): Promise<boolean> {
  const result = await CityModel.findByIdAndUpdate(cityId, {
    $pull: { areas: { _id: areaId } },
  });
  return !!result;
}
