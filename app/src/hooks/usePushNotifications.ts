import { useEffect, useRef, useCallback } from 'react';
import { Platform, AppState } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { useMutation } from '@apollo/client';
import { REGISTER_PUSH_TOKEN, UNREGISTER_PUSH_TOKEN } from '../graphql/mutations';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

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
      lightColor: '#5b4cdb',
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

  useEffect(() => {
    if (!isAuthenticated) {
      if (registeredRef.current) {
        unregisterForPush();
      }
      return;
    }

    registerForPush();

    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        onNotificationReceived?.(notification);
      },
    );

    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        onNotificationTapped?.(response);
      },
    );

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
  }, [isAuthenticated, registerForPush, unregisterForPush, onNotificationReceived, onNotificationTapped]);
}
