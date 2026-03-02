import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Dynamically resolve the GraphQL API URL.
 * Priority:
 *  1. EXPO_PUBLIC_API_URL env variable (set in app.json / .env)
 *  2. Expo dev-server host (auto-detected from the debugger connection)
 *  3. Android emulator special alias 10.0.2.2
 *  4. localhost fallback
 */
function resolveApiUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) return envUrl;

  const SERVER_PORT = '4039';

  // Expo Go / dev-client: the manifest tells us the host's LAN IP
  const debuggerHost =
    Constants.expoConfig?.hostUri ?? Constants.manifest2?.extra?.expoGo?.debuggerHost ?? '';
  const lanIp = debuggerHost.split(':')[0];

  if (lanIp) {
    return `http://${lanIp}:${SERVER_PORT}/graphql`;
  }

  // Android emulator → host machine
  if (Platform.OS === 'android') {
    return `http://10.0.2.2:${SERVER_PORT}/graphql`;
  }

  return `http://localhost:${SERVER_PORT}/graphql`;
}

export const API_URL = resolveApiUrl();

/** Derive the WebSocket URL from the HTTP API URL */
export function resolveWsUrl(): string {
  const envWs = process.env.EXPO_PUBLIC_WS_URL;
  if (envWs) return envWs;
  return API_URL.replace(/^http/, 'ws').replace('/graphql', '/ws');
}

const httpLink = createHttpLink({
  uri: API_URL,
});

const authLink = setContext(async (_, { headers }) => {
  const token = await AsyncStorage.getItem('token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const errorLink = onError(({ networkError, graphQLErrors }) => {
  if (networkError) {
    const msg = networkError.message ?? '';
    if (msg.includes('Network request failed') || msg.includes('Failed to fetch')) {
      // Replace with friendly message so Alert in RootNavigator shows it clearly
      (networkError as Error).message =
        `Cannot reach server at ${API_URL}. Make sure the server is running and your phone is on the same Wi-Fi network.`;
    }
  }
  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      // Surface GraphQL errors to the Apollo error chain (already works by default)
      console.warn(`[GraphQL error] ${err.message}`);
    }
  }
});

export const client = new ApolloClient({
  link: from([errorLink, authLink.concat(httpLink)]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          pods: { merge: false },
          myPods: { merge: false },
          chatMessages: { merge: false },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: { fetchPolicy: 'cache-and-network' },
  },
});
