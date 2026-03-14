import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Linking, Platform } from 'react-native';

/* ── Location Data (matches server ResolvedLocation) ── */

export interface LocationData {
  city: string;
  pincode: string;
  state: string;
  area: string;
  country: string;
  latitude: number;
  longitude: number;
  address: string;
  matchedCityId?: string;
  matchedCityName?: string;
  matchedAreaId?: string;
  matchedAreaName?: string;
  isServiceAvailable: boolean;
}

/* ── GPS Coordinates (expo-location only) ── */

export interface GpsCoordinates {
  latitude: number;
  longitude: number;
}

export async function getGpsCoordinates(): Promise<GpsCoordinates | null> {
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

    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
  } catch {
    return null;
  }
}

/* ── Convert server ResolvedLocation GraphQL response to LocationData ── */

export interface ResolvedLocationResponse {
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

export function toLocationData(resolved: ResolvedLocationResponse): LocationData {
  return {
    city: resolved.city,
    pincode: resolved.pincode,
    state: resolved.state,
    area: resolved.area,
    country: resolved.country,
    latitude: resolved.latitude,
    longitude: resolved.longitude,
    address: resolved.address,
    matchedCityId: resolved.matchedCityId ?? undefined,
    matchedCityName: resolved.matchedCityName ?? undefined,
    matchedAreaId: resolved.matchedAreaId ?? undefined,
    matchedAreaName: resolved.matchedAreaName ?? undefined,
    isServiceAvailable: resolved.isServiceAvailable,
  };
}

/* ── AsyncStorage persistence ── */

const STORAGE_KEY = '@partywings_location';

export async function saveLocation(location: LocationData): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(location));
  } catch {
    // Silent fail
  }
}

export async function getSavedLocation(): Promise<LocationData | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as LocationData;
  } catch {
    return null;
  }
}

export async function clearSavedLocation(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    // Silent fail
  }
}
