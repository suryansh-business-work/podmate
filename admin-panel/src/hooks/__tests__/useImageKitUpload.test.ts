import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useImageKitUpload } from '../useImageKitUpload';

describe('useImageKitUpload', () => {
  beforeEach(() => {
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('test-jwt-token');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns initial state', () => {
    const { result } = renderHook(() => useImageKitUpload());
    expect(result.current.uploading).toBe(false);
    expect(result.current.progress).toBe(0);
    expect(result.current.error).toBe('');
    expect(typeof result.current.uploadFile).toBe('function');
  });

  it('returns error when not authenticated', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
    const { result } = renderHook(() => useImageKitUpload());
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    let uploadResult: { url: string } | null = null;
    await act(async () => {
      uploadResult = await result.current.uploadFile(file, '/test-folder');
    });

    expect(uploadResult).toBeNull();
    expect(result.current.error).toBe('Not authenticated');
  });

  it('resets state after upload attempt', async () => {
    const { result } = renderHook(() => useImageKitUpload());
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    await act(async () => {
      try {
        await result.current.uploadFile(file, '/test-folder');
      } catch {
        // XHR not fully available in jsdom
      }
    });

    expect(result.current.uploading).toBe(false);
  });

  it('uploadFile is a stable callback', () => {
    const { result, rerender } = renderHook(() => useImageKitUpload());
    const firstRef = result.current.uploadFile;
    rerender();
    expect(result.current.uploadFile).toBe(firstRef);
  });
});
