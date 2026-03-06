import Constants from 'expo-constants';
import { Platform } from 'react-native';

interface AppConfig {
  /** Full GraphQL endpoint URL */
  apiUrl: string;
  /** Full WebSocket endpoint URL */
  wsUrl: string;
  /** Whether the app is running in production mode */
  isProduction: boolean;
}

const PRODUCTION_API = 'https://podify-api.exyconn.com/graphql';
const PRODUCTION_WS = 'wss://podify-api.exyconn.com/ws';

const SERVER_PORT = '4039';

/**
 * Resolve the local development server URL.
 *
 * In dev mode the Expo Go debugger host (auto-detected LAN IP) is always
 * preferred so the URL stays stable across restarts. Env variables are only
 * consulted in production or as an absolute last-resort fallback.
 *
 * Priority (dev):
 *  1. Expo Go debugger host (auto-detected LAN IP)
 *  2. app.json extra.apiUrl override
 *  3. EXPO_PUBLIC_API_URL env variable (fallback only)
 *  4. Android emulator alias 10.0.2.2
 *  5. localhost
 *
 * Priority (prod): env var → extra → debuggerHost → emulator → localhost
 */
function resolveLocalApiUrl(): string {
  const debuggerHost =
    Constants.expoConfig?.hostUri ?? Constants.manifest2?.extra?.expoGo?.debuggerHost ?? '';
  const lanIp = debuggerHost.split(':')[0];

  // In dev mode, always prefer the auto-detected LAN IP so URLs don't change
  if (lanIp) {
    return `http://${lanIp}:${SERVER_PORT}/graphql`;
  }

  const extraApiUrl = Constants.expoConfig?.extra?.apiUrl;
  if (extraApiUrl) return extraApiUrl;

  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) return envUrl;

  if (Platform.OS === 'android') {
    return `http://10.0.2.2:${SERVER_PORT}/graphql`;
  }

  return `http://localhost:${SERVER_PORT}/graphql`;
}

function deriveWsUrl(httpUrl: string): string {
  return httpUrl.replace(/^http/, 'ws').replace('/graphql', '/ws');
}

function buildConfig(): AppConfig {
  const isProduction = !__DEV__;

  if (isProduction) {
    return {
      apiUrl: PRODUCTION_API,
      wsUrl: PRODUCTION_WS,
      isProduction: true,
    };
  }

  const apiUrl = resolveLocalApiUrl();
  return {
    apiUrl,
    wsUrl: deriveWsUrl(apiUrl),
    isProduction: false,
  };
}

const config: AppConfig = buildConfig();

export default config;
