import { renderHook, act } from '@testing-library/react-native';
import { useQuery } from '@apollo/client';
import { useInAppNotifications } from '../useInAppNotifications';

const mockRefetch = jest.fn().mockResolvedValue({ data: { unreadNotificationCount: 3 } });

describe('useInAppNotifications', () => {
  beforeEach(() => {
    (useQuery as jest.Mock).mockReturnValue({
      data: { unreadNotificationCount: 5 },
      loading: false,
      refetch: mockRefetch,
    });
  });

  it('returns unread count when authenticated', () => {
    const { result } = renderHook(() =>
      useInAppNotifications({ isAuthenticated: true }),
    );

    expect(result.current.unreadCount).toBe(5);
    expect(result.current.loading).toBe(false);
  });

  it('skips query when not authenticated', () => {
    renderHook(() =>
      useInAppNotifications({ isAuthenticated: false }),
    );

    expect(useQuery).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ skip: true }),
    );
  });

  it('polls for updates at interval', () => {
    renderHook(() =>
      useInAppNotifications({ isAuthenticated: true }),
    );

    expect(mockRefetch).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(30_000);
    });

    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('stops polling when not authenticated', () => {
    const { rerender } = renderHook(
      ({ isAuth }: { isAuth: boolean }) =>
        useInAppNotifications({ isAuthenticated: isAuth }),
      { initialProps: { isAuth: true } },
    );

    rerender({ isAuth: false });

    act(() => {
      jest.advanceTimersByTime(60_000);
    });

    expect(mockRefetch).not.toHaveBeenCalled();
  });

  it('returns 0 when data is undefined', () => {
    (useQuery as jest.Mock).mockReturnValue({
      data: undefined,
      loading: true,
      refetch: mockRefetch,
    });

    const { result } = renderHook(() =>
      useInAppNotifications({ isAuthenticated: true }),
    );

    expect(result.current.unreadCount).toBe(0);
    expect(result.current.loading).toBe(true);
  });
});
