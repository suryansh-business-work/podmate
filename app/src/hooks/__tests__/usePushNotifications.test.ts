import { renderHook, act } from '@testing-library/react-native';
import { AppState } from 'react-native';
import { useMutation } from '@apollo/client';
import { usePushNotifications } from '../usePushNotifications';

// --- Module mocks ---
const mockGetPermissions = jest.fn().mockResolvedValue({ status: 'granted' });
const mockRequestPermissions = jest.fn().mockResolvedValue({ status: 'granted' });
const mockGetExpoPushToken = jest
  .fn()
  .mockResolvedValue({ data: 'ExponentPushToken[mock-token]' });
const mockSetNotificationChannel = jest.fn().mockResolvedValue(undefined);
const mockAddReceivedListener = jest.fn().mockReturnValue({ remove: jest.fn() });
const mockAddResponseListener = jest.fn().mockReturnValue({ remove: jest.fn() });

jest.mock('expo-notifications', () => ({
  getPermissionsAsync: () => mockGetPermissions(),
  requestPermissionsAsync: () => mockRequestPermissions(),
  getExpoPushTokenAsync: (opts: unknown) => mockGetExpoPushToken(opts),
  setNotificationChannelAsync: (...args: unknown[]) => mockSetNotificationChannel(...args),
  addNotificationReceivedListener: (cb: unknown) => mockAddReceivedListener(cb),
  addNotificationResponseReceivedListener: (cb: unknown) => mockAddResponseListener(cb),
  setNotificationHandler: jest.fn(),
  AndroidImportance: { MAX: 5 },
}));

jest.mock('expo-device', () => ({
  isDevice: true,
}));

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    executionEnvironment: 'standalone',
    installationId: 'mock-install-id',
    expoConfig: { extra: { eas: { projectId: 'mock-project-id' } } },
  },
  ExecutionEnvironment: {
    StoreClient: 'storeClient',
    Standalone: 'standalone',
  },
}));

describe('usePushNotifications', () => {
  const mockRegister = jest.fn().mockResolvedValue({});
  const mockUnregister = jest.fn().mockResolvedValue({});

  beforeEach(() => {
    (useMutation as jest.Mock)
      .mockReturnValueOnce([mockRegister, { loading: false }])
      .mockReturnValueOnce([mockUnregister, { loading: false }]);
  });

  it('registers push token when user is authenticated', async () => {
    renderHook(() =>
      usePushNotifications({ isAuthenticated: true }),
    );

    await act(async () => {
      jest.runAllTimers();
    });

    expect(mockRegister).toHaveBeenCalledWith({
      variables: {
        input: {
          token: 'ExponentPushToken[mock-token]',
          platform: expect.stringMatching(/^(ANDROID|IOS|WEB)$/),
          deviceId: 'mock-install-id',
        },
      },
    });
  });

  it('does not register when user is not authenticated', async () => {
    renderHook(() =>
      usePushNotifications({ isAuthenticated: false }),
    );

    await act(async () => {
      jest.runAllTimers();
    });

    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('sets up notification listeners when authenticated', () => {
    renderHook(() =>
      usePushNotifications({
        isAuthenticated: true,
        onNotificationReceived: jest.fn(),
        onNotificationTapped: jest.fn(),
      }),
    );

    expect(mockAddReceivedListener).toHaveBeenCalled();
    expect(mockAddResponseListener).toHaveBeenCalled();
  });

  it('cleans up listeners on unmount', () => {
    const removeReceived = jest.fn();
    const removeResponse = jest.fn();
    mockAddReceivedListener.mockReturnValue({ remove: removeReceived });
    mockAddResponseListener.mockReturnValue({ remove: removeResponse });

    const { unmount } = renderHook(() =>
      usePushNotifications({ isAuthenticated: true }),
    );

    unmount();

    expect(removeReceived).toHaveBeenCalled();
    expect(removeResponse).toHaveBeenCalled();
  });

  it('does not register if permissions are denied', async () => {
    mockGetPermissions.mockResolvedValueOnce({ status: 'denied' });
    mockRequestPermissions.mockResolvedValueOnce({ status: 'denied' });

    renderHook(() =>
      usePushNotifications({ isAuthenticated: true }),
    );

    await act(async () => {
      jest.runAllTimers();
    });

    expect(mockRegister).not.toHaveBeenCalled();
  });
});
