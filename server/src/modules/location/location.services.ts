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
import * as googleMaps from '../../lib/googleMaps';
import type { GeocodedLocation } from '../../lib/googleMaps';

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
    pincodes: input.pincodes ?? [],
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

  if (input.pincodes !== undefined) updateData.pincodes = input.pincodes;

  const doc = await CityModel.findByIdAndUpdate(id, updateData, { new: true }).lean();
  return toCity(doc);
}

export async function deleteCity(id: string): Promise<boolean> {
  const result = await CityModel.findByIdAndDelete(id);
  return !!result;
}

export async function addArea(input: CreateAreaInput): Promise<Area> {
  const area = {
    _id: uuidv4(),
    name: input.name.trim(),
    cityId: input.cityId,
    pincodes: input.pincodes ?? [],
  };
  await CityModel.findByIdAndUpdate(input.cityId, { $push: { areas: area } });
  return { id: area._id, name: area.name, cityId: area.cityId, pincodes: area.pincodes };
}

export async function removeArea(cityId: string, areaId: string): Promise<boolean> {
  const result = await CityModel.findByIdAndUpdate(cityId, {
    $pull: { areas: { _id: areaId } },
  });
  return !!result;
}

/* ── Pincode Management ── */

export async function addPincodeToCity(cityId: string, pincode: string): Promise<City | null> {
  const doc = await CityModel.findByIdAndUpdate(
    cityId,
    { $addToSet: { pincodes: pincode.trim() }, $set: { updatedAt: new Date().toISOString() } },
    { new: true },
  ).lean();
  return toCity(doc);
}

export async function removePincodeFromCity(cityId: string, pincode: string): Promise<City | null> {
  const doc = await CityModel.findByIdAndUpdate(
    cityId,
    { $pull: { pincodes: pincode.trim() }, $set: { updatedAt: new Date().toISOString() } },
    { new: true },
  ).lean();
  return toCity(doc);
}

export async function addPincodeToArea(
  cityId: string,
  areaId: string,
  pincode: string,
): Promise<City | null> {
  const doc = await CityModel.findOneAndUpdate(
    { _id: cityId, 'areas._id': areaId },
    {
      $addToSet: { 'areas.$.pincodes': pincode.trim() },
      $set: { updatedAt: new Date().toISOString() },
    },
    { new: true },
  ).lean();
  return toCity(doc);
}

export async function removePincodeFromArea(
  cityId: string,
  areaId: string,
  pincode: string,
): Promise<City | null> {
  const doc = await CityModel.findOneAndUpdate(
    { _id: cityId, 'areas._id': areaId },
    {
      $pull: { 'areas.$.pincodes': pincode.trim() },
      $set: { updatedAt: new Date().toISOString() },
    },
    { new: true },
  ).lean();
  return toCity(doc);
}

/* ── Location Resolution ── */

export interface ResolvedLocation {
  city: string;
  state: string;
  country: string;
  pincode: string;
  area: string;
  address: string;
  latitude: number;
  longitude: number;
  matchedCityId: string | null;
  matchedCityName: string | null;
  matchedAreaId: string | null;
  matchedAreaName: string | null;
  isServiceAvailable: boolean;
}

async function matchPincodeToCity(pincode: string): Promise<{
  city: City | null;
  area: Area | null;
}> {
  if (!pincode) return { city: null, area: null };

  // First try area-level match
  const areaMatch = await CityModel.findOne({
    isActive: true,
    'areas.pincodes': pincode,
  }).lean();
  if (areaMatch) {
    const city = toCity(areaMatch)!;
    const area = city.areas.find((a) => a.pincodes.includes(pincode)) ?? null;
    return { city, area };
  }

  // Then try city-level match
  const cityMatch = await CityModel.findOne({
    isActive: true,
    pincodes: pincode,
  }).lean();
  if (cityMatch) return { city: toCity(cityMatch)!, area: null };

  return { city: null, area: null };
}

async function matchNameToCity(cityName: string): Promise<City | null> {
  if (!cityName) return null;
  const doc = await CityModel.findOne({
    isActive: true,
    name: { $regex: `^${cityName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' },
  }).lean();
  return toCity(doc);
}

function buildResolvedLocation(
  geo: GeocodedLocation,
  city: City | null,
  area: Area | null,
): ResolvedLocation {
  return {
    city: geo.city,
    state: geo.state,
    country: geo.country,
    pincode: geo.pincode,
    area: geo.area,
    address: geo.address,
    latitude: geo.latitude,
    longitude: geo.longitude,
    matchedCityId: city?.id ?? null,
    matchedCityName: city?.name ?? null,
    matchedAreaId: area?.id ?? null,
    matchedAreaName: area?.name ?? null,
    isServiceAvailable: city !== null,
  };
}

export async function resolveLocationByCoords(
  latitude: number,
  longitude: number,
): Promise<ResolvedLocation | null> {
  const geo = await googleMaps.reverseGeocode(latitude, longitude);
  if (!geo) return null;

  // Try pincode match first, then name match
  let { city, area } = await matchPincodeToCity(geo.pincode);
  if (!city) {
    city = await matchNameToCity(geo.city);
  }

  return buildResolvedLocation(geo, city, area);
}

export async function resolveLocationByPincode(
  pincode: string,
  country?: string,
): Promise<ResolvedLocation | null> {
  const geo = await googleMaps.geocodeByPincode(pincode, country);
  if (!geo) return null;

  let { city, area } = await matchPincodeToCity(geo.pincode || pincode);
  if (!city) {
    city = await matchNameToCity(geo.city);
  }

  // Use the input pincode if geocoding didn't return one
  if (!geo.pincode) geo.pincode = pincode;

  return buildResolvedLocation(geo, city, area);
}

export async function searchGooglePlaces(
  input: string,
  sessionToken?: string,
): Promise<
  Array<{
    placeId: string;
    description: string;
    mainText: string;
    secondaryText: string;
  }>
> {
  const predictions = await googleMaps.placesAutocomplete(input, sessionToken);
  return predictions.map((p) => ({
    placeId: p.place_id,
    description: p.description,
    mainText: p.structured_formatting.main_text,
    secondaryText: p.structured_formatting.secondary_text,
  }));
}

export async function resolveGooglePlaceDetails(placeId: string): Promise<ResolvedLocation | null> {
  const geo = await googleMaps.getPlaceDetails(placeId);
  if (!geo) return null;

  let { city, area } = await matchPincodeToCity(geo.pincode);
  if (!city) {
    city = await matchNameToCity(geo.city);
  }

  return buildResolvedLocation(geo, city, area);
}
