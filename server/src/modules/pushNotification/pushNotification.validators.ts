export function validatePushTokenInput(input: {
  token: string;
  platform: string;
  deviceId: string;
}): void {
  if (!input.token || typeof input.token !== 'string' || input.token.trim().length === 0) {
    throw new Error('Push token is required');
  }

  const validPlatforms = ['ANDROID', 'IOS', 'WEB'];
  if (!validPlatforms.includes(input.platform)) {
    throw new Error(`Invalid platform. Must be one of: ${validPlatforms.join(', ')}`);
  }

  if (!input.deviceId || typeof input.deviceId !== 'string' || input.deviceId.trim().length === 0) {
    throw new Error('Device ID is required');
  }

  if (!input.token.startsWith('ExponentPushToken[') && !input.token.startsWith('ExpoPushToken[')) {
    throw new Error('Invalid push token format. Must be a valid Expo push token.');
  }
}
