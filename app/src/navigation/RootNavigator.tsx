import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  NavigationContainer,
  NavigationContainerRef,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation, useApolloClient } from '@apollo/client';
import {
  View,
  Animated,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  Platform,
} from 'react-native';
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import OtpScreen from '../screens/OtpScreen';
import PodDetailScreen from '../screens/PodDetailScreen';
import CreatePodScreen from '../screens/CreatePodScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import RegisterPlaceScreen from '../screens/RegisterPlaceScreen';
import MainTabs from './MainTabs';
import DrawerMenu from '../components/DrawerMenu';
import { SEND_OTP, VERIFY_OTP } from '../graphql/mutations';
import { colors } from '../theme';

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Otp: { phone: string };
  Main: undefined;
  PodDetail: { podId: string };
  CreatePod: undefined;
  Notifications: undefined;
  RegisterPlace: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = SCREEN_WIDTH * 0.82;

const RootNavigator: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [otpPhone, setOtpPhone] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);
  const apolloClient = useApolloClient();

  const [sendOtpMutation] = useMutation(SEND_OTP);
  const [verifyOtpMutation] = useMutation(VERIFY_OTP);

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

  const handleSendOtp = async (phone: string) => {
    try {
      await sendOtpMutation({ variables: { phone } });
      setOtpPhone(phone);
    } catch {
      // Fallback: still navigate to OTP screen
      setOtpPhone(phone);
    }
  };

  const handleVerifyOtp = async (otp: string) => {
    try {
      const { data } = await verifyOtpMutation({
        variables: { phone: otpPhone, otp },
      });
      if (data?.verifyOtp?.token) {
        await AsyncStorage.setItem('token', data.verifyOtp.token);
        setIsAuthenticated(true);
        setOtpPhone('');
      }
    } catch {
      // Fallback for development
      if (otp === '123456') {
        await AsyncStorage.setItem('token', 'dev-token-' + Date.now());
        setIsAuthenticated(true);
        setOtpPhone('');
      }
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    await apolloClient.clearStore();
    setIsAuthenticated(false);
    setOtpPhone('');
    closeDrawer();
  };

  const openDrawer = useCallback(() => {
    setDrawerOpen(true);
    Animated.parallel([
      Animated.timing(drawerAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(overlayAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, [drawerAnim, overlayAnim]);

  const closeDrawer = useCallback(() => {
    Animated.parallel([
      Animated.timing(drawerAnim, {
        toValue: -DRAWER_WIDTH,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(overlayAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => setDrawerOpen(false));
  }, [drawerAnim, overlayAnim]);

  const handleDrawerNavigate = (screen: string) => {
    const nav = navigationRef.current;
    if (!nav) return;

    switch (screen) {
      case 'CreatePod':
        nav.navigate('CreatePod');
        break;
      case 'Notifications':
        nav.navigate('Notifications');
        break;
      case 'RegisterPlace':
        nav.navigate('RegisterPlace');
        break;
      default:
        break;
    }
  };

  if (isLoading) {
    return null;
  }

  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    <View style={{ flex: 1 }}>
      <NavigationContainer ref={navigationRef}>
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
                    onMenuPress={openDrawer}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen name="PodDetail" options={{ presentation: 'card' }}>
                {({ navigation, route }) => (
                  <PodDetailScreen
                    podId={(route.params as { podId: string })?.podId}
                    onBack={() => navigation.goBack()}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen name="CreatePod" options={{ presentation: 'modal' }}>
                {({ navigation }) => (
                  <CreatePodScreen
                    onClose={() => navigation.goBack()}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen name="Notifications" options={{ presentation: 'card' }}>
                {({ navigation }) => (
                  <NotificationsScreen onBack={() => navigation.goBack()} />
                )}
              </Stack.Screen>
              <Stack.Screen name="RegisterPlace" options={{ presentation: 'modal' }}>
                {({ navigation }) => (
                  <RegisterPlaceScreen onClose={() => navigation.goBack()} />
                )}
              </Stack.Screen>
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>

      {/* Custom Drawer Overlay */}
      {drawerOpen && (
        <>
          <Animated.View
            style={[
              drawerStyles.overlay,
              { opacity: overlayAnim },
            ]}
          >
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={closeDrawer}
            />
          </Animated.View>
          <Animated.View
            style={[
              drawerStyles.drawer,
              {
                transform: [{ translateX: drawerAnim }],
                width: DRAWER_WIDTH,
              },
            ]}
          >
            <DrawerMenu
              onClose={closeDrawer}
              onNavigate={handleDrawerNavigate}
              onLogout={handleLogout}
            />
          </Animated.View>
        </>
      )}
    </View>
  );
};

const drawerStyles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
    zIndex: 100,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 101,
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 20,
    ...Platform.select({
      android: {
        paddingTop: 0,
      },
    }),
  },
});

export default RootNavigator;
