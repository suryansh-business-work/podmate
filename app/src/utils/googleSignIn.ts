import { Platform } from 'react-native';

type GoogleSigninType = typeof import('@react-native-google-signin/google-signin').GoogleSignin;

let _GoogleSignin: GoogleSigninType | null = null;

function getGoogleSignin(): GoogleSigninType {
  if (!_GoogleSignin) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const mod = require('@react-native-google-signin/google-signin');
      _GoogleSignin = mod.GoogleSignin as GoogleSigninType;
    } catch {
      throw new Error(
        Platform.select({
          web: 'Google Sign-In is not supported on web.',
          default:
            'Google Sign-In native module not found. Run a custom dev client or production build.',
        }),
      );
    }
  }
  return _GoogleSignin;
}

export { getGoogleSignin };
