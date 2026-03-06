import { useState, useCallback } from 'react';
import {
  getCurrentLocation,
  getOrRequestLocation,
  getLocationFromPincode,
  saveLocation,
  isServiceAvailable,
  type LocationData,
} from '../utils/locationService';

interface UseLocationReturn {
  location: LocationData | null;
  loading: boolean;
  error: string | null;
  isInServiceArea: boolean;
  requestLocation: () => Promise<LocationData | null>;
  requestCachedLocation: () => Promise<LocationData | null>;
  searchByPincode: (pincode: string) => Promise<LocationData | null>;
}

export function useLocation(): UseLocationReturn {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInServiceArea, setIsInServiceArea] = useState(false);

  const requestLocation = useCallback(async (): Promise<LocationData | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await getCurrentLocation();
      if (!result) {
        setError('Unable to get location');
        return null;
      }
      setLocation(result);
      const serviceAvailable = isServiceAvailable(result.pincode);
      setIsInServiceArea(serviceAvailable);
      await saveLocation(result, serviceAvailable);
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to get location';
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const requestCachedLocation = useCallback(async (): Promise<LocationData | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await getOrRequestLocation();
      if (!result) {
        setError('Unable to get location');
        return null;
      }
      setLocation(result);
      const serviceAvailable = isServiceAvailable(result.pincode);
      setIsInServiceArea(serviceAvailable);
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to get location';
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const searchByPincode = useCallback(async (pincode: string): Promise<LocationData | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await getLocationFromPincode(pincode);
      if (!result) {
        setError('Invalid pincode or no data found');
        return null;
      }
      setLocation(result);
      const serviceAvailable = isServiceAvailable(result.pincode);
      setIsInServiceArea(serviceAvailable);
      await saveLocation(result, serviceAvailable);
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to search pincode';
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    location,
    loading,
    error,
    isInServiceArea,
    requestLocation,
    requestCachedLocation,
    searchByPincode,
  };
}
