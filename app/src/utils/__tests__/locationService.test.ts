import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  isServiceAvailable,
  SERVICE_AVAILABLE_PINCODES,
  saveLocation,
  getSavedLocation,
  clearSavedLocation,
} from '../locationService';
import type { LocationData } from '../locationService';

describe('isServiceAvailable', () => {
  it('returns true for pincodes in the service list', () => {
    SERVICE_AVAILABLE_PINCODES.forEach((pincode) => {
      expect(isServiceAvailable(pincode)).toBe(true);
    });
  });

  it('returns false for pincodes NOT in the service list', () => {
    expect(isServiceAvailable('999999')).toBe(false);
    expect(isServiceAvailable('110001')).toBe(false);
    expect(isServiceAvailable('')).toBe(false);
  });

  it('does exact match, not partial', () => {
    const partial = SERVICE_AVAILABLE_PINCODES[0].slice(0, 3);
    expect(isServiceAvailable(partial)).toBe(false);
  });
});

describe('saveLocation', () => {
  const mockLocation: LocationData = {
    city: 'Ghaziabad',
    pincode: '201017',
    state: 'Uttar Pradesh',
    area: 'Raj Nagar Extension',
    latitude: 28.6,
    longitude: 77.4,
    address: 'Raj Nagar Extension, Ghaziabad, UP',
  };

  it('stores location and serviceAvailable in AsyncStorage', async () => {
    await saveLocation(mockLocation, true);

    expect(AsyncStorage.multiSet).toHaveBeenCalledWith([
      ['@partywings_location', JSON.stringify(mockLocation)],
      ['@partywings_service_available', 'true'],
    ]);
  });

  it('stores serviceAvailable=false correctly', async () => {
    await saveLocation(mockLocation, false);

    expect(AsyncStorage.multiSet).toHaveBeenCalledWith([
      ['@partywings_location', JSON.stringify(mockLocation)],
      ['@partywings_service_available', 'false'],
    ]);
  });

  it('handles storage failure silently', async () => {
    (AsyncStorage.multiSet as jest.Mock).mockRejectedValueOnce(new Error('Storage full'));

    await expect(saveLocation(mockLocation, true)).resolves.toBeUndefined();
  });
});

describe('getSavedLocation', () => {
  it('returns stored location and isServiceAvailable=true', async () => {
    const loc: LocationData = {
      city: 'Ghaziabad',
      pincode: '201017',
      state: 'UP',
      area: 'RNE',
      latitude: 28.6,
      longitude: 77.4,
      address: 'Test Address',
    };
    (AsyncStorage.multiGet as jest.Mock).mockResolvedValue([
      ['@partywings_location', JSON.stringify(loc)],
      ['@partywings_service_available', 'true'],
    ]);

    const result = await getSavedLocation();

    expect(result.location).toEqual(loc);
    expect(result.isServiceAvailable).toBe(true);
  });

  it('returns isServiceAvailable=false when stored as false', async () => {
    const loc: LocationData = {
      city: 'Delhi',
      pincode: '110001',
      state: 'Delhi',
      area: 'CP',
      latitude: 28.6,
      longitude: 77.2,
      address: 'CP, Delhi',
    };
    (AsyncStorage.multiGet as jest.Mock).mockResolvedValue([
      ['@partywings_location', JSON.stringify(loc)],
      ['@partywings_service_available', 'false'],
    ]);

    const result = await getSavedLocation();

    expect(result.location).toEqual(loc);
    expect(result.isServiceAvailable).toBe(false);
  });

  it('returns null location when nothing is stored', async () => {
    (AsyncStorage.multiGet as jest.Mock).mockResolvedValue([
      ['@partywings_location', null],
      ['@partywings_service_available', null],
    ]);

    const result = await getSavedLocation();

    expect(result.location).toBeNull();
    expect(result.isServiceAvailable).toBe(false);
  });

  it('handles storage read failure gracefully', async () => {
    (AsyncStorage.multiGet as jest.Mock).mockRejectedValue(new Error('Read error'));

    const result = await getSavedLocation();

    expect(result.location).toBeNull();
    expect(result.isServiceAvailable).toBe(false);
  });
});

describe('clearSavedLocation', () => {
  it('removes location keys from AsyncStorage', async () => {
    await clearSavedLocation();

    expect(AsyncStorage.multiRemove).toHaveBeenCalledWith([
      '@partywings_location',
      '@partywings_service_available',
    ]);
  });

  it('handles removal failure silently', async () => {
    (AsyncStorage.multiRemove as jest.Mock).mockRejectedValueOnce(new Error('fail'));

    await expect(clearSavedLocation()).resolves.toBeUndefined();
  });
});
