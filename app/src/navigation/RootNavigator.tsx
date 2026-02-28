import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import OtpScreen from '../screens/OtpScreen';
import PodDetailScreen from '../screens/PodDetailScreen';
import CreatePodScreen from '../screens/CreatePodScreen';
import MainTabs from './MainTabs';

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Otp: { phone: string };
  Main: undefined;
  PodDetail: { podId: string };
  CreatePod: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [otpPhone, setOtpPhone] = useState('');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      setIsAuthenticated(!!token);
    } catch {
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  const handleSendOtp = (phone: string) => {
    setOtpPhone(phone);
  };

  const handleVerifyOtp = async (otp: string) => {
    // In production, call the GraphQL mutation
    if (otp === '123456') {
      // Simulate token storage
      await AsyncStorage.setItem('token', 'dev-token-' + Date.now());
      setIsAuthenticated(true);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    setIsAuthenticated(false);
    setOtpPhone('');
  };

  if (isLoading) {
    return null;
  }

  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            {!otpPhone ? (
              <Stack.Screen name="Login">
                {() => <LoginScreen onSendOtp={handleSendOtp} />}
              </Stack.Screen>
            ) : (
              <Stack.Screen name="Otp">
                {() => (
                  <OtpScreen
                    phone={otpPhone}
                    onVerify={handleVerifyOtp}
                    onBack={() => setOtpPhone('')}
                  />
                )}
              </Stack.Screen>
            )}
          </>
        ) : (
          <>
            <Stack.Screen name="Main">
              {({ navigation }) => (
                <MainTabs
                  onPodPress={(id) => navigation.navigate('PodDetail', { podId: id })}
                  onCreatePress={() => navigation.navigate('CreatePod')}
                  onLogout={handleLogout}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="PodDetail" options={{ presentation: 'card' }}>
              {({ navigation, route }) => (
                <PodDetailScreen
                  podId={(route.params as { podId: string })?.podId}
                  onBack={() => navigation.goBack()}
                  onJoin={(podId) => {
                    // In production, call joinPod mutation
                    console.log('Joining pod:', podId);
                    navigation.goBack();
                  }}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="CreatePod" options={{ presentation: 'modal' }}>
              {({ navigation }) => (
                <CreatePodScreen
                  onClose={() => navigation.goBack()}
                  onCreate={(data) => {
                    // In production, call createPod mutation
                    console.log('Creating pod:', data);
                    navigation.goBack();
                  }}
                />
              )}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
