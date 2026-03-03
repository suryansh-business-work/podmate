import React from 'react';
import ReactDOM from 'react-dom/client';
import { ApolloProvider } from '@apollo/client';
import { client } from './graphql/client';
import { AdminThemeProvider } from './contexts/ThemeContext';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <AdminThemeProvider>
        <App />
      </AdminThemeProvider>
    </ApolloProvider>
  </React.StrictMode>,
);
