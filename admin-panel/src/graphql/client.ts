import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4039/graphql';

const httpLink = createHttpLink({
  uri: API_URL,
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('admin-token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache({
    canonizeResults: false,
    typePolicies: {
      Query: {
        fields: {
          users: { merge: false },
          pods: { merge: false },
          policies: { merge: false },
          places: { merge: false },
        },
      },
    },
  }),
});
