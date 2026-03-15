import { registerRootComponent } from 'expo';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { PaperProvider } from 'react-native-paper';
import { ApolloProvider } from '@apollo/client';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, ActivityIndicator } from 'react-native';

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
  const [fontsLoaded] = useFonts({
    ...MaterialIcons.font,
    ...MaterialCommunityIcons.font,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

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
