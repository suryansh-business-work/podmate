import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Linking, Platform } from 'react-native';

/* ── Service-Available Pincodes ── */
export const SERVICE_AVAILABLE_PINCODES = [
  '201017', // Ghaziabad - Raj Nagar Extension
];

export interface LocationData {
  city: string;
  pincode: string;
  state: string;
  area: string;
  latitude: number;
  longitude: number;
  address: string;
}

/* ── Check if pincode is in service area ── */
export function isServiceAvailable(pincode: string): boolean {
  return SERVICE_AVAILABLE_PINCODES.includes(pincode);
}

/* ── Request permission & get current GPS location ── */
export async function getCurrentLocation(): Promise<LocationData | null> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Location Permission Required',
        'Please enable location services to find pods near you.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ],
      );
      return null;
    }

    const position = await Location.getCurrentPositionAsync({
      accuracy: Platform.OS === 'android' ? Location.Accuracy.Balanced : Location.Accuracy.Balanced,
    });

    const { latitude, longitude } = position.coords;

    let locationData: LocationData = {
      city: '',
      pincode: '',
      state: '',
      area: '',
      latitude,
      longitude,
      address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
    };

    try {
      const [geocode] = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (geocode) {
        const parts = [geocode.name, geocode.street, geocode.city, geocode.region].filter(Boolean);
        locationData = {
          city: geocode.city ?? geocode.subregion ?? '',
          pincode: geocode.postalCode ?? '',
          state: geocode.region ?? '',
          area: geocode.district ?? geocode.subregion ?? geocode.name ?? '',
          latitude,
          longitude,
          address: parts.join(', '),
        };
      }
    } catch {
      // Reverse geocode failed — coords-only fallback already set
    }

    return locationData;
  } catch {
    return null;
  }
}

/* ── Get location from pincode (India Postal API) ── */
export async function getLocationFromPincode(pincode: string): Promise<LocationData | null> {
  try {
    const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
    if (!response.ok) return null;

    const data = (await response.json()) as Array<{
      Status: string;
      PostOffice?: Array<{
        District: string;
        Division: string;
        Pincode: string;
        State: string;
        Name: string;
      }>;
    }>;
    if (!data || data.length === 0 || data[0].Status !== 'Success') return null;

    const postOffice = data[0].PostOffice?.[0];
    if (!postOffice) return null;

    return {
      city: postOffice.District || postOffice.Division || '',
      pincode: postOffice.Pincode || pincode,
      state: postOffice.State || '',
      area: postOffice.Name || '',
      latitude: 0,
      longitude: 0,
      address: `${postOffice.Name}, ${postOffice.District}, ${postOffice.State}`,
    };
  } catch {
    return null;
  }
}

/* ── AsyncStorage persistence ── */
const STORAGE_KEYS = {
  LOCATION: '@partywings_location',
  SERVICE_AVAILABLE: '@partywings_service_available',
} as const;

export async function saveLocation(
  location: LocationData,
  serviceAvailable: boolean,
): Promise<void> {
  try {
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.LOCATION, JSON.stringify(location)],
      [STORAGE_KEYS.SERVICE_AVAILABLE, String(serviceAvailable)],
    ]);
  } catch {
    // Silent fail
  }
}

export async function getSavedLocation(): Promise<{
  location: LocationData | null;
  isServiceAvailable: boolean;
}> {
  try {
    const results = await AsyncStorage.multiGet([
      STORAGE_KEYS.LOCATION,
      STORAGE_KEYS.SERVICE_AVAILABLE,
    ]);
    const locationStr = results[0][1];
    const serviceStr = results[1][1];

    if (!locationStr) return { location: null, isServiceAvailable: false };

    const location = JSON.parse(locationStr) as LocationData;
    return { location, isServiceAvailable: serviceStr === 'true' };
  } catch {
    return { location: null, isServiceAvailable: false };
  }
}

export async function clearSavedLocation(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([STORAGE_KEYS.LOCATION, STORAGE_KEYS.SERVICE_AVAILABLE]);
  } catch {
    // Silent fail
  }
}

/* ── Convenience: get location with caching ── */
export async function getOrRequestLocation(): Promise<LocationData | null> {
  // Try cached first
  const { location: cached } = await getSavedLocation();
  if (cached && cached.latitude !== 0) return cached;

  // Request fresh
  const fresh = await getCurrentLocation();
  if (fresh) {
    const available = isServiceAvailable(fresh.pincode);
    await saveLocation(fresh, available);
  }
  return fresh;
}
