import { useState, useCallback, useEffect } from 'react';
import { useLazyQuery } from '@apollo/client';
import {
  getGpsCoordinates,
  saveLocation,
  getSavedLocation,
  toLocationData,
  type LocationData,
  type ResolvedLocationResponse,
} from '../utils/locationService';
import { RESOLVE_LOCATION, RESOLVE_LOCATION_BY_PINCODE } from '../graphql/queries';

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

  const [resolveByCoords] = useLazyQuery<{
    resolveLocation: ResolvedLocationResponse;
  }>(RESOLVE_LOCATION, { fetchPolicy: 'network-only' });

  const [resolveByPincode] = useLazyQuery<{
    resolveLocationByPincode: ResolvedLocationResponse;
  }>(RESOLVE_LOCATION_BY_PINCODE, { fetchPolicy: 'network-only' });

  // Load cached location on mount
  useEffect(() => {
    getSavedLocation().then((cached) => {
      if (cached) {
        setLocation(cached);
        setIsInServiceArea(cached.isServiceAvailable);
      }
    });
  }, []);

  const requestLocation = useCallback(async (): Promise<LocationData | null> => {
    setLoading(true);
    setError(null);
    try {
      const coords = await getGpsCoordinates();
      if (!coords) {
        setError('Unable to get GPS location');
        return null;
      }

      const { data: resolvedData } = await resolveByCoords({
        variables: { latitude: coords.latitude, longitude: coords.longitude },
      });

      if (!resolvedData?.resolveLocation) {
        setError('Unable to resolve location');
        return null;
      }

      const locationData = toLocationData(resolvedData.resolveLocation);
      setLocation(locationData);
      setIsInServiceArea(locationData.isServiceAvailable);
      await saveLocation(locationData);
      return locationData;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to get location';
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, [resolveByCoords]);

  const requestCachedLocation = useCallback(async (): Promise<LocationData | null> => {
    setLoading(true);
    setError(null);
    try {
      const cached = await getSavedLocation();
      if (cached && cached.latitude !== 0) {
        setLocation(cached);
        setIsInServiceArea(cached.isServiceAvailable);
        setLoading(false);
        return cached;
      }

      // No cache — request fresh
      const coords = await getGpsCoordinates();
      if (!coords) {
        setError('Unable to get GPS location');
        return null;
      }

      const { data: resolvedData } = await resolveByCoords({
        variables: { latitude: coords.latitude, longitude: coords.longitude },
      });

      if (!resolvedData?.resolveLocation) {
        setError('Unable to resolve location');
        return null;
      }

      const locationData = toLocationData(resolvedData.resolveLocation);
      setLocation(locationData);
      setIsInServiceArea(locationData.isServiceAvailable);
      await saveLocation(locationData);
      return locationData;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to get location';
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, [resolveByCoords]);

  const searchByPincode = useCallback(
    async (pincode: string): Promise<LocationData | null> => {
      setLoading(true);
      setError(null);
      try {
        const { data: resolvedData } = await resolveByPincode({
          variables: { pincode },
        });

        if (!resolvedData?.resolveLocationByPincode) {
          setError('Invalid pincode or no data found');
          return null;
        }

        const locationData = toLocationData(resolvedData.resolveLocationByPincode);
        setLocation(locationData);
        setIsInServiceArea(locationData.isServiceAvailable);
        await saveLocation(locationData);
        return locationData;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to search pincode';
        setError(msg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [resolveByPincode],
  );

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
