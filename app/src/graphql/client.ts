import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../config';

/**
 * Suppress noisy Apollo Client 3.x internal deprecation warnings about
 * `canonizeResults` that fire even when we never set the option ourselves.
 */
if (__DEV__) {
  const origWarn = console.warn;
  console.warn = (...args: unknown[]) => {
    const msg = typeof args[0] === 'string' ? args[0] : '';
    if (msg.includes('canonizeResults')) return;
    origWarn.apply(console, args);
  };
}

export const API_URL = config.apiUrl;

/** Derive the WebSocket URL from config (always stable \u2014 derived from apiUrl) */
export function resolveWsUrl(): string {
  return config.wsUrl;
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
      // "Authentication required" is expected before login — skip logging it
      if (err.message === 'Authentication required') continue;
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
