import { registerRootComponent } from 'expo';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { ApolloProvider } from '@apollo/client';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { client } from './src/graphql/client';
import RootNavigator from './src/navigation/RootNavigator';
import { ThemeProvider, useThemeMode } from './src/contexts/ThemeContext';
import ErrorBoundary from './src/components/ErrorBoundary';

function AppContent() {
  const { paperTheme, isDark } = useThemeMode();
  return (
    <PaperProvider theme={paperTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <RootNavigator />
    </PaperProvider>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <ApolloProvider client={client}>
          <ThemeProvider>
            <AppContent />
          </ThemeProvider>
        </ApolloProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

registerRootComponent(App);
