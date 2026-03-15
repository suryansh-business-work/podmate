import { getConfigValue } from '../modules/settings/settings.services';
import logger from './logger';

/* ── Types ── */

export interface GeocodedLocation {
  city: string;
  state: string;
  country: string;
  pincode: string;
  area: string;
  address: string;
  latitude: number;
  longitude: number;
}

interface GeocodeAddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

interface GeocodeResult {
  formatted_address: string;
  geometry: { location: { lat: number; lng: number } };
  address_components: GeocodeAddressComponent[];
}

interface GeocodeResponse {
  status: string;
  results: GeocodeResult[];
  error_message?: string;
}

export interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

interface AutocompleteResponse {
  status: string;
  predictions: PlacePrediction[];
}

export interface PlaceDetailResult {
  formatted_address: string;
  geometry: { location: { lat: number; lng: number } };
  address_components: GeocodeAddressComponent[];
  place_id: string;
  name: string;
}

interface PlaceDetailsResponse {
  status: string;
  result: PlaceDetailResult;
}

/* ── Helpers ── */

async function getApiKey(): Promise<string> {
  return getConfigValue('google_maps_api_key', 'GOOGLE_MAPS_API_KEY');
}

function extractComponent(components: GeocodeAddressComponent[], type: string): string {
  return components.find((c) => c.types.includes(type))?.long_name ?? '';
}

function parseAddressComponents(
  components: GeocodeAddressComponent[],
  formattedAddress: string,
  lat: number,
  lng: number,
): GeocodedLocation {
  return {
    city:
      extractComponent(components, 'locality') ||
      extractComponent(components, 'administrative_area_level_2') ||
      extractComponent(components, 'sublocality_level_1'),
    state: extractComponent(components, 'administrative_area_level_1'),
    country: extractComponent(components, 'country'),
    pincode: extractComponent(components, 'postal_code'),
    area:
      extractComponent(components, 'sublocality_level_1') ||
      extractComponent(components, 'sublocality') ||
      extractComponent(components, 'neighborhood'),
    address: formattedAddress,
    latitude: lat,
    longitude: lng,
  };
}

/* ── Reverse Geocode (lat/lng → location) ── */

export async function reverseGeocode(
  latitude: number,
  longitude: number,
): Promise<GeocodedLocation | null> {
  const apiKey = await getApiKey();
  if (!apiKey) {
    logger.warn('Google Maps API key not configured');
    return null;
  }

  const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
  url.searchParams.set('latlng', `${latitude},${longitude}`);
  url.searchParams.set('key', apiKey);

  const res = await fetch(url.toString());
  if (!res.ok) {
    logger.error(`Google Geocoding HTTP error: ${res.status}`);
    return null;
  }

  const json = (await res.json()) as GeocodeResponse;
  if (json.status !== 'OK' || json.results.length === 0) {
    logger.warn(`Google Geocoding status: ${json.status} - ${json.error_message ?? ''}`);
    return null;
  }

  const result = json.results[0];
  return parseAddressComponents(
    result.address_components,
    result.formatted_address,
    latitude,
    longitude,
  );
}

/* ── Geocode by Pincode ── */

export async function geocodeByPincode(
  pincode: string,
  country?: string,
): Promise<GeocodedLocation | null> {
  const apiKey = await getApiKey();
  if (!apiKey) {
    logger.warn('Google Maps API key not configured');
    return null;
  }

  const address = country ? `${pincode}, ${country}` : pincode;
  const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
  url.searchParams.set('address', address);
  url.searchParams.set('key', apiKey);

  const res = await fetch(url.toString());
  if (!res.ok) {
    logger.error(`Google Geocoding HTTP error: ${res.status}`);
    return null;
  }

  const json = (await res.json()) as GeocodeResponse;
  if (json.status !== 'OK' || json.results.length === 0) {
    logger.warn(`Google Geocoding status: ${json.status} - ${json.error_message ?? ''}`);
    return null;
  }

  const result = json.results[0];
  const { lat, lng } = result.geometry.location;
  return parseAddressComponents(result.address_components, result.formatted_address, lat, lng);
}

/* ── Places Autocomplete ── */

export async function placesAutocomplete(
  input: string,
  sessionToken?: string,
): Promise<PlacePrediction[]> {
  const apiKey = await getApiKey();
  if (!apiKey || input.trim().length < 2) return [];

  const url = new URL('https://maps.googleapis.com/maps/api/place/autocomplete/json');
  url.searchParams.set('input', input);
  url.searchParams.set('types', 'establishment|geocode');
  url.searchParams.set('key', apiKey);
  if (sessionToken) url.searchParams.set('sessiontoken', sessionToken);

  const res = await fetch(url.toString());
  if (!res.ok) return [];

  const json = (await res.json()) as AutocompleteResponse;
  return json.status === 'OK' ? json.predictions : [];
}

/* ── Place Details ── */

export async function getPlaceDetails(placeId: string): Promise<GeocodedLocation | null> {
  const apiKey = await getApiKey();
  if (!apiKey) return null;

  const url = new URL('https://maps.googleapis.com/maps/api/place/details/json');
  url.searchParams.set('place_id', placeId);
  url.searchParams.set('fields', 'geometry,formatted_address,address_components,place_id,name');
  url.searchParams.set('key', apiKey);

  const res = await fetch(url.toString());
  if (!res.ok) return null;

  const json = (await res.json()) as PlaceDetailsResponse;
  if (json.status !== 'OK') return null;

  const { geometry, formatted_address, address_components } = json.result;
  return parseAddressComponents(
    address_components,
    formatted_address,
    geometry.location.lat,
    geometry.location.lng,
  );
}
