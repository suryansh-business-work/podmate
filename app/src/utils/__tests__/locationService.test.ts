import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  saveLocation,
  getSavedLocation,
  clearSavedLocation,
  toLocationData,
} from '../locationService';
import type { LocationData, ResolvedLocationResponse } from '../locationService';

const mockLocation: LocationData = {
  city: 'Ghaziabad',
  pincode: '201017',
  state: 'Uttar Pradesh',
  area: 'Raj Nagar Extension',
  country: 'India',
  latitude: 28.6,
  longitude: 77.4,
  address: 'Raj Nagar Extension, Ghaziabad, UP',
  isServiceAvailable: true,
};

describe('toLocationData', () => {
  it('converts ResolvedLocationResponse to LocationData', () => {
    const response: ResolvedLocationResponse = {
      city: 'Ghaziabad',
      state: 'Uttar Pradesh',
      country: 'India',
      pincode: '201017',
      area: 'Raj Nagar Extension',
      address: 'Raj Nagar Extension, Ghaziabad, UP',
      latitude: 28.6,
      longitude: 77.4,
      matchedCityId: 'city123',
      matchedCityName: 'Ghaziabad',
      matchedAreaId: 'area456',
      matchedAreaName: 'Raj Nagar Extension',
      isServiceAvailable: true,
    };

    const result = toLocationData(response);

    expect(result.city).toBe('Ghaziabad');
    expect(result.pincode).toBe('201017');
    expect(result.state).toBe('Uttar Pradesh');
    expect(result.country).toBe('India');
    expect(result.matchedCityId).toBe('city123');
    expect(result.matchedAreaName).toBe('Raj Nagar Extension');
    expect(result.isServiceAvailable).toBe(true);
  });

  it('converts null matched fields to undefined', () => {
    const response: ResolvedLocationResponse = {
      city: 'Delhi',
      state: 'Delhi',
      country: 'India',
      pincode: '110001',
      area: 'CP',
      address: 'CP, Delhi',
      latitude: 28.6,
      longitude: 77.2,
      matchedCityId: null,
      matchedCityName: null,
      matchedAreaId: null,
      matchedAreaName: null,
      isServiceAvailable: false,
    };

    const result = toLocationData(response);

    expect(result.matchedCityId).toBeUndefined();
    expect(result.matchedCityName).toBeUndefined();
    expect(result.matchedAreaId).toBeUndefined();
    expect(result.matchedAreaName).toBeUndefined();
    expect(result.isServiceAvailable).toBe(false);
  });
});

describe('saveLocation', () => {
  it('stores location in AsyncStorage', async () => {
    await saveLocation(mockLocation);

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      '@partywings_location',
      JSON.stringify(mockLocation),
    );
  });

  it('handles storage failure silently', async () => {
    (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(new Error('Storage full'));

    await expect(saveLocation(mockLocation)).resolves.toBeUndefined();
  });
});

describe('getSavedLocation', () => {
  it('returns stored location', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockLocation));

    const result = await getSavedLocation();

    expect(result).toEqual(mockLocation);
  });

  it('returns null when nothing is stored', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    const result = await getSavedLocation();

    expect(result).toBeNull();
  });

  it('handles storage read failure gracefully', async () => {
    (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Read error'));

    const result = await getSavedLocation();

    expect(result).toBeNull();
  });
});

describe('clearSavedLocation', () => {
  it('removes location key from AsyncStorage', async () => {
    await clearSavedLocation();

    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@partywings_location');
  });

  it('handles removal failure silently', async () => {
    (AsyncStorage.removeItem as jest.Mock).mockRejectedValueOnce(new Error('fail'));

    await expect(clearSavedLocation()).resolves.toBeUndefined();
  });
});
