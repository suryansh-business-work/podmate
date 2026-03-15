import { renderHook, act } from '@testing-library/react-native';
import { useLazyQuery } from '@apollo/client';
import { useLocation } from '../useLocation';

const mockGetGpsCoordinates = jest.fn();
const mockSaveLocation = jest.fn();
const mockGetSavedLocation = jest.fn();
const mockToLocationData = jest.fn();

jest.mock('@apollo/client', () => ({
  ...jest.requireActual('@apollo/client'),
  useQuery: jest.fn(() => ({
    data: null,
    loading: false,
    error: null,
    refetch: jest.fn(),
    fetchMore: jest.fn(),
  })),
  useLazyQuery: jest.fn(),
  useMutation: jest.fn(() => [jest.fn(), { data: null, loading: false, error: null }]),
  gql: jest.fn((query: TemplateStringsArray) => query),
}));

jest.mock('../../utils/locationService', () => ({
  getGpsCoordinates: (...args: unknown[]) => mockGetGpsCoordinates(...args),
  saveLocation: (...args: unknown[]) => mockSaveLocation(...args),
  getSavedLocation: (...args: unknown[]) => mockGetSavedLocation(...args),
  toLocationData: (...args: unknown[]) => mockToLocationData(...args),
}));

const mockResolvedResponse = {
  city: 'New Delhi',
  state: 'Delhi',
  country: 'India',
  pincode: '110001',
  area: 'Connaught Place',
  address: 'New Delhi, India',
  latitude: 28.6139,
  longitude: 77.209,
  matchedCityId: 'c1',
  matchedCityName: 'New Delhi',
  matchedAreaId: null,
  matchedAreaName: null,
  isServiceAvailable: true,
};

const mockLocationData = {
  city: 'New Delhi',
  pincode: '110001',
  state: 'Delhi',
  area: 'Connaught Place',
  country: 'India',
  latitude: 28.6139,
  longitude: 77.209,
  address: 'New Delhi, India',
  matchedCityId: 'c1',
  matchedCityName: 'New Delhi',
  matchedAreaId: undefined,
  matchedAreaName: undefined,
  isServiceAvailable: true,
};

const mockResolveByCoords = jest.fn();
const mockResolveByPincode = jest.fn();

describe('useLocation', () => {
  let lazyQueryCallIndex: number;

  beforeEach(() => {
    jest.clearAllMocks();
    lazyQueryCallIndex = 0;
    mockGetSavedLocation.mockResolvedValue(null);
    mockSaveLocation.mockResolvedValue(undefined);
    mockToLocationData.mockReturnValue(mockLocationData);
    (useLazyQuery as jest.Mock).mockImplementation(() => {
      lazyQueryCallIndex++;
      if (lazyQueryCallIndex % 2 === 1) {
        return [mockResolveByCoords, { data: null, loading: false, error: null }];
      }
      return [mockResolveByPincode, { data: null, loading: false, error: null }];
    });
  });

  it('returns initial state with null location', () => {
    const { result } = renderHook(() => useLocation());
    expect(result.current.location).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.isInServiceArea).toBe(false);
  });

  it('requestLocation sets location on success', async () => {
    mockGetGpsCoordinates.mockResolvedValue({ latitude: 28.6139, longitude: 77.209 });
    mockResolveByCoords.mockResolvedValue({
      data: { resolveLocation: mockResolvedResponse },
    });

    const { result } = renderHook(() => useLocation());

    await act(async () => {
      const loc = await result.current.requestLocation();
      expect(loc).toEqual(mockLocationData);
    });

    expect(result.current.location).toEqual(mockLocationData);
    expect(result.current.loading).toBe(false);
  });

  it('requestLocation sets error when GPS coordinates are null', async () => {
    mockGetGpsCoordinates.mockResolvedValue(null);

    const { result } = renderHook(() => useLocation());

    await act(async () => {
      const loc = await result.current.requestLocation();
      expect(loc).toBeNull();
    });

    expect(result.current.error).toBe('Unable to get GPS location');
  });

  it('requestLocation sets error on exception', async () => {
    mockGetGpsCoordinates.mockRejectedValue(new Error('GPS unavailable'));

    const { result } = renderHook(() => useLocation());

    await act(async () => {
      await result.current.requestLocation();
    });

    expect(result.current.error).toBe('GPS unavailable');
  });

  it('searchByPincode updates location', async () => {
    mockResolveByPincode.mockResolvedValue({
      data: { resolveLocationByPincode: mockResolvedResponse },
    });

    const { result } = renderHook(() => useLocation());

    await act(async () => {
      const loc = await result.current.searchByPincode('110001');
      expect(loc).toEqual(mockLocationData);
    });

    expect(result.current.location).toEqual(mockLocationData);
  });

  it('searchByPincode sets error on null result', async () => {
    mockResolveByPincode.mockResolvedValue({
      data: { resolveLocationByPincode: null },
    });

    const { result } = renderHook(() => useLocation());

    await act(async () => {
      await result.current.searchByPincode('000000');
    });

    expect(result.current.error).toBe('Invalid pincode or no data found');
  });

  it('requestCachedLocation returns cached location', async () => {
    mockGetSavedLocation.mockResolvedValueOnce(null).mockResolvedValueOnce(mockLocationData);

    const { result } = renderHook(() => useLocation());

    await act(async () => {
      const loc = await result.current.requestCachedLocation();
      expect(loc).toEqual(mockLocationData);
    });

    expect(result.current.location).toEqual(mockLocationData);
  });

  it('sets isInServiceArea based on resolved data', async () => {
    mockGetGpsCoordinates.mockResolvedValue({ latitude: 28.6139, longitude: 77.209 });
    mockResolveByCoords.mockResolvedValue({
      data: { resolveLocation: mockResolvedResponse },
    });

    const { result } = renderHook(() => useLocation());

    await act(async () => {
      await result.current.requestLocation();
    });

    expect(result.current.isInServiceArea).toBe(true);
  });

  it('saves location after successful request', async () => {
    mockGetGpsCoordinates.mockResolvedValue({ latitude: 28.6139, longitude: 77.209 });
    mockResolveByCoords.mockResolvedValue({
      data: { resolveLocation: mockResolvedResponse },
    });

    const { result } = renderHook(() => useLocation());

    await act(async () => {
      await result.current.requestLocation();
    });

    expect(mockSaveLocation).toHaveBeenCalledWith(mockLocationData);
  });
});
