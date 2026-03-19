import { Platform, TurboModuleRegistry } from 'react-native';

type GoogleSigninType = typeof import('@react-native-google-signin/google-signin').GoogleSignin;

let _GoogleSignin: GoogleSigninType | null = null;

function isNativeModuleAvailable(): boolean {
  try {
    return TurboModuleRegistry.get('RNGoogleSignin') != null;
  } catch {
    return false;
  }
}

function getGoogleSignin(): GoogleSigninType {
  if (!_GoogleSignin) {
    if (!isNativeModuleAvailable()) {
      throw new Error(
        Platform.select({
          web: 'Google Sign-In is not supported on web.',
          default:
            'Google Sign-In native module not found. Run a custom dev client or production build.',
        }),
      );
    }
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('@react-native-google-signin/google-signin');
    _GoogleSignin = mod.GoogleSignin as GoogleSigninType;
  }
  return _GoogleSignin;
}

export { getGoogleSignin, isNativeModuleAvailable as isGoogleSignInAvailable };
