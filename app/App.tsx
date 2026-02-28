import { registerRootComponent } from 'expo';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { ApolloProvider } from '@apollo/client';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { theme } from './src/theme';
import { client } from './src/graphql/client';
import RootNavigator from './src/navigation/RootNavigator';

function App() {
  return (
    <SafeAreaProvider>
      <ApolloProvider client={client}>
        <PaperProvider theme={theme}>
          <StatusBar style="dark" />
          <RootNavigator />
        </PaperProvider>
      </ApolloProvider>
    </SafeAreaProvider>
  );
}

registerRootComponent(App);
