import { useEffect, useRef, useCallback } from 'react';
import { Platform, AppState } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { useMutation } from '@apollo/client';
import { REGISTER_PUSH_TOKEN, UNREGISTER_PUSH_TOKEN } from '../graphql/mutations';

// Only set notification handler if not in Expo Go (SDK 53+ doesn't support remote notifications)
if (Constants.executionEnvironment !== ExecutionEnvironment.StoreClient) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

interface PushPlatform {
  platform: 'ANDROID' | 'IOS' | 'WEB';
}

function getDevicePlatform(): PushPlatform['platform'] {
  if (Platform.OS === 'ios') return 'IOS';
  if (Platform.OS === 'android') return 'ANDROID';
  return 'WEB';
}

function getDeviceId(): string {
  return Constants.installationId ?? `${Platform.OS}-${Date.now()}`;
}

async function getExpoPushToken(): Promise<string | null> {
  // Skip push notifications in Expo Go (SDK 53+ removed remote notifications support)
  if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) {
    return null;
  }

  if (!Device.isDevice) {
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#6366F1',
    });
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  const tokenResponse = await Notifications.getExpoPushTokenAsync({
    projectId: projectId as string,
  });

  return tokenResponse.data;
}

interface UsePushNotificationsOptions {
  isAuthenticated: boolean;
  onNotificationReceived?: (notification: Notifications.Notification) => void;
  onNotificationTapped?: (response: Notifications.NotificationResponse) => void;
}

export function usePushNotifications({
  isAuthenticated,
  onNotificationReceived,
  onNotificationTapped,
}: UsePushNotificationsOptions): void {
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);
  const registeredRef = useRef(false);

  const [registerToken] = useMutation(REGISTER_PUSH_TOKEN);
  const [unregisterToken] = useMutation(UNREGISTER_PUSH_TOKEN);

  const registerForPush = useCallback(async () => {
    if (registeredRef.current) return;

    try {
      const token = await getExpoPushToken();
      if (!token) return;

      await registerToken({
        variables: {
          input: {
            token,
            platform: getDevicePlatform(),
            deviceId: getDeviceId(),
          },
        },
      });

      registeredRef.current = true;
    } catch {
      /* silent fail - push is best-effort */
    }
  }, [registerToken]);

  const unregisterForPush = useCallback(async () => {
    if (!registeredRef.current) return;

    try {
      await unregisterToken({
        variables: { deviceId: getDeviceId() },
      });
      registeredRef.current = false;
    } catch {
      /* silent fail */
    }
  }, [unregisterToken]);

  // Check once whether we're in Expo Go — all notification APIs are unsupported there from SDK 53+.
  const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

  useEffect(() => {
    if (!isAuthenticated) {
      if (registeredRef.current) {
        unregisterForPush();
      }
      return;
    }

    registerForPush();

    // Skip notification listeners in Expo Go (SDK 53+ removed remote notification support)
    if (isExpoGo) return;

    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      onNotificationReceived?.(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      onNotificationTapped?.(response);
    });

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active' && isAuthenticated && !registeredRef.current) {
        registerForPush();
      }
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
      subscription.remove();
    };
  }, [
    isAuthenticated,
    isExpoGo,
    registerForPush,
    unregisterForPush,
    onNotificationReceived,
    onNotificationTapped,
  ]);
}
