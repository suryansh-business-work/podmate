import { renderHook, act } from '@testing-library/react-native';
import { useLocation } from '../useLocation';

const mockGetCurrentLocation = jest.fn();
const mockGetOrRequestLocation = jest.fn();
const mockGetLocationFromPincode = jest.fn();
const mockSaveLocation = jest.fn();
const mockIsServiceAvailable = jest.fn();

jest.mock('../../utils/locationService', () => ({
  getCurrentLocation: (...args: unknown[]) => mockGetCurrentLocation(...args),
  getOrRequestLocation: (...args: unknown[]) => mockGetOrRequestLocation(...args),
  getLocationFromPincode: (...args: unknown[]) => mockGetLocationFromPincode(...args),
  saveLocation: (...args: unknown[]) => mockSaveLocation(...args),
  isServiceAvailable: (...args: unknown[]) => mockIsServiceAvailable(...args),
}));

const mockLocation = {
  latitude: 28.6139,
  longitude: 77.209,
  address: 'New Delhi, India',
  pincode: '110001',
};

describe('useLocation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsServiceAvailable.mockReturnValue(true);
    mockSaveLocation.mockResolvedValue(undefined);
  });

  it('returns initial state with null location', () => {
    const { result } = renderHook(() => useLocation());
    expect(result.current.location).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.isInServiceArea).toBe(false);
  });

  it('requestLocation sets location on success', async () => {
    mockGetCurrentLocation.mockResolvedValue(mockLocation);
    const { result } = renderHook(() => useLocation());

    await act(async () => {
      const loc = await result.current.requestLocation();
      expect(loc).toEqual(mockLocation);
    });

    expect(result.current.location).toEqual(mockLocation);
    expect(result.current.loading).toBe(false);
  });

  it('requestLocation sets error when location is null', async () => {
    mockGetCurrentLocation.mockResolvedValue(null);
    const { result } = renderHook(() => useLocation());

    await act(async () => {
      const loc = await result.current.requestLocation();
      expect(loc).toBeNull();
    });

    expect(result.current.error).toBe('Unable to get location');
  });

  it('requestLocation sets error on exception', async () => {
    mockGetCurrentLocation.mockRejectedValue(new Error('GPS unavailable'));
    const { result } = renderHook(() => useLocation());

    await act(async () => {
      await result.current.requestLocation();
    });

    expect(result.current.error).toBe('GPS unavailable');
  });

  it('searchByPincode updates location', async () => {
    mockGetLocationFromPincode.mockResolvedValue(mockLocation);
    const { result } = renderHook(() => useLocation());

    await act(async () => {
      const loc = await result.current.searchByPincode('110001');
      expect(loc).toEqual(mockLocation);
    });

    expect(result.current.location).toEqual(mockLocation);
  });

  it('searchByPincode sets error on null result', async () => {
    mockGetLocationFromPincode.mockResolvedValue(null);
    const { result } = renderHook(() => useLocation());

    await act(async () => {
      await result.current.searchByPincode('000000');
    });

    expect(result.current.error).toBe('Invalid pincode or no data found');
  });

  it('requestCachedLocation returns cached location', async () => {
    mockGetOrRequestLocation.mockResolvedValue(mockLocation);
    const { result } = renderHook(() => useLocation());

    await act(async () => {
      const loc = await result.current.requestCachedLocation();
      expect(loc).toEqual(mockLocation);
    });

    expect(result.current.location).toEqual(mockLocation);
  });

  it('sets isInServiceArea based on service availability', async () => {
    mockGetCurrentLocation.mockResolvedValue(mockLocation);
    mockIsServiceAvailable.mockReturnValue(true);
    const { result } = renderHook(() => useLocation());

    await act(async () => {
      await result.current.requestLocation();
    });

    expect(result.current.isInServiceArea).toBe(true);
  });

  it('saves location after successful request', async () => {
    mockGetCurrentLocation.mockResolvedValue(mockLocation);
    const { result } = renderHook(() => useLocation());

    await act(async () => {
      await result.current.requestLocation();
    });

    expect(mockSaveLocation).toHaveBeenCalledWith(mockLocation, true);
  });
});
