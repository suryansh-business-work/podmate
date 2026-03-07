import { renderHook, act, waitFor } from '@testing-library/react-native';
import { Alert, Platform } from 'react-native';
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

describe('useImageKitUpload', () => {
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

  it('uploads image successfully and returns file info', async () => {
    mockLaunchImageLibraryAsync.mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file:///photo.jpg' }],
    });
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ url: 'https://cdn.example.com/photo.jpg' }),
    });

    const { result } = renderHook(() => useImageKitUpload());

    let uploaded: unknown;
    await act(async () => {
      uploaded = await result.current.pickAndUploadImage('/test');
    });

    expect(uploaded).toEqual(
      expect.objectContaining({
        url: 'https://cdn.example.com/photo.jpg',
        type: 'image',
      }),
    );
    expect(result.current.uploading).toBe(false);
  });

  it('uploads video successfully and returns file info', async () => {
    mockLaunchImageLibraryAsync.mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file:///clip.mp4' }],
    });
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ url: 'https://cdn.example.com/clip.mp4' }),
    });

    const { result } = renderHook(() => useImageKitUpload());

    let uploaded: unknown;
    await act(async () => {
      uploaded = await result.current.pickAndUploadVideo('/test');
    });

    expect(uploaded).toEqual(
      expect.objectContaining({
        url: 'https://cdn.example.com/clip.mp4',
        type: 'video',
      }),
    );
  });

  it('shows alert on upload server error', async () => {
    mockLaunchImageLibraryAsync.mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file:///photo.jpg' }],
    });
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: 'Server error' }),
    });
    const alertSpy = jest.spyOn(Alert, 'alert');

    const { result } = renderHook(() => useImageKitUpload());

    await act(async () => {
      await result.current.pickAndUploadImage();
    });

    expect(alertSpy).toHaveBeenCalledWith('Upload Error', 'Server error');
    alertSpy.mockRestore();
  });

  it('shows alert when no auth token present', async () => {
    mockGetItem.mockResolvedValue(null);
    mockLaunchImageLibraryAsync.mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file:///photo.jpg' }],
    });
    const alertSpy = jest.spyOn(Alert, 'alert');

    const { result } = renderHook(() => useImageKitUpload());

    await act(async () => {
      await result.current.pickAndUploadImage();
    });

    expect(alertSpy).toHaveBeenCalledWith(
      'Upload Error',
      'Please log in to upload files',
    );
    alertSpy.mockRestore();
  });

  it('resets uploading and progress after completion', async () => {
    mockLaunchImageLibraryAsync.mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file:///photo.png' }],
    });
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ url: 'https://cdn.example.com/photo.png' }),
    });

    const { result } = renderHook(() => useImageKitUpload());

    await act(async () => {
      await result.current.pickAndUploadImage();
    });

    expect(result.current.uploading).toBe(false);
    expect(result.current.progress).toBe(0);
  });
});
