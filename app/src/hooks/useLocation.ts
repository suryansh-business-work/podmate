import { useState, useCallback } from 'react';
import * as Location from 'expo-location';
import { Alert, Linking, Platform } from 'react-native';

interface LocationResult {
  latitude: number;
  longitude: number;
  address: string;
}

interface UseLocationReturn {
  location: LocationResult | null;
  loading: boolean;
  error: string | null;
  requestLocation: () => Promise<LocationResult | null>;
}

export function useLocation(): UseLocationReturn {
  const [location, setLocation] = useState<LocationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = useCallback(async (): Promise<LocationResult | null> => {
    setLoading(true);
    setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied');
        Alert.alert(
          'Permission Required',
          'Please enable location services to find pods near you.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ],
        );
        return null;
      }

      const coords = await Location.getCurrentPositionAsync({
        accuracy: Platform.OS === 'android'
          ? Location.Accuracy.Balanced
          : Location.Accuracy.Balanced,
      });

      let address = '';
      try {
        const [geo] = await Location.reverseGeocodeAsync({
          latitude: coords.coords.latitude,
          longitude: coords.coords.longitude,
        });
        if (geo) {
          const parts = [geo.name, geo.city, geo.region].filter(Boolean);
          address = parts.join(', ');
        }
      } catch {
        address = `${coords.coords.latitude.toFixed(4)}, ${coords.coords.longitude.toFixed(4)}`;
      }

      const result: LocationResult = {
        latitude: coords.coords.latitude,
        longitude: coords.coords.longitude,
        address,
      };
      setLocation(result);
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to get location';
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { location, loading, error, requestLocation };
}
