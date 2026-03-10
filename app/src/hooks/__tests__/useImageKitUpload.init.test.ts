import { renderHook, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { useImageKitUpload } from '../useImageKitUpload';

// --- Mocks ---
const mockLaunchImageLibraryAsync = jest.fn();
const mockRequestMediaPerms = jest.fn().mockResolvedValue({ status: 'granted' });

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: (...args: unknown[]) => mockLaunchImageLibraryAsync(...args),
  requestMediaLibraryPermissionsAsync: () => mockRequestMediaPerms(),
}));

const mockGetItem = jest.fn().mockResolvedValue('mock-jwt-token');
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: (key: string) => mockGetItem(key),
}));

const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

describe('useImageKitUpload — init & picker', () => {
  beforeEach(() => {
    jest.useRealTimers();
    mockFetch.mockReset();
    mockLaunchImageLibraryAsync.mockReset();
    mockGetItem.mockResolvedValue('mock-jwt-token');
  });

  it('initializes with uploading=false and progress=0', () => {
    const { result } = renderHook(() => useImageKitUpload());

    expect(result.current.uploading).toBe(false);
    expect(result.current.progress).toBe(0);
  });

  it('exposes pickAndUploadImage and pickAndUploadVideo functions', () => {
    const { result } = renderHook(() => useImageKitUpload());

    expect(typeof result.current.pickAndUploadImage).toBe('function');
    expect(typeof result.current.pickAndUploadVideo).toBe('function');
  });

  it('returns null when image picker is cancelled', async () => {
    mockLaunchImageLibraryAsync.mockResolvedValue({ canceled: true, assets: [] });

    const { result } = renderHook(() => useImageKitUpload());

    let uploaded: unknown;
    await act(async () => {
      uploaded = await result.current.pickAndUploadImage();
    });

    expect(uploaded).toBeNull();
    expect(result.current.uploading).toBe(false);
  });

  it('returns null when video picker is cancelled', async () => {
    mockLaunchImageLibraryAsync.mockResolvedValue({ canceled: true, assets: [] });

    const { result } = renderHook(() => useImageKitUpload());

    let uploaded: unknown;
    await act(async () => {
      uploaded = await result.current.pickAndUploadVideo();
    });

    expect(uploaded).toBeNull();
    expect(result.current.uploading).toBe(false);
  });

  it('returns null when permissions are denied', async () => {
    mockRequestMediaPerms.mockResolvedValueOnce({ status: 'denied' });
    const alertSpy = jest.spyOn(Alert, 'alert');

    const { result } = renderHook(() => useImageKitUpload());

    let uploaded: unknown;
    await act(async () => {
      uploaded = await result.current.pickAndUploadImage();
    });

    expect(uploaded).toBeNull();
    expect(alertSpy).toHaveBeenCalledWith('Permission Required', expect.any(String));
    alertSpy.mockRestore();
  });
});
