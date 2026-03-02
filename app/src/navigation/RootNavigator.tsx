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
  BackHandler,
  Alert,
} from 'react-native';
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import OtpScreen from '../screens/OtpScreen';
import CompleteProfileScreen from '../screens/CompleteProfileScreen';
import PodDetailScreen from '../screens/PodDetailScreen';
import CreatePodScreen from '../screens/CreatePodScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import RegisterPlaceScreen from '../screens/RegisterPlaceScreen';
import FaqScreen from '../screens/FaqScreen';
import SupportScreen from '../screens/SupportScreen';
import MainTabs from './MainTabs';
import DrawerMenu from '../components/DrawerMenu';
import { SEND_OTP, VERIFY_OTP, COMPLETE_PROFILE } from '../graphql/mutations';
import { colors } from '../theme';

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Otp: { phone: string };
  CompleteProfile: undefined;
  Main: undefined;
  PodDetail: { podId: string };
  CreatePod: undefined;
  Notifications: undefined;
  RegisterPlace: undefined;
  Faq: undefined;
  Support: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = SCREEN_WIDTH * 0.82;

const RootNavigator: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [otpPhone, setOtpPhone] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState('');
  const drawerAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);
  const apolloClient = useApolloClient();

  const [sendOtpMutation] = useMutation(SEND_OTP);
  const [verifyOtpMutation] = useMutation(VERIFY_OTP);
  const [completeProfileMutation] = useMutation(COMPLETE_PROFILE);

  useEffect(() => {
    checkAuth();
  }, []);

  /* ── Back-press exit confirmation ── */
  useEffect(() => {
    const onBackPress = () => {
      if (drawerOpen) {
        closeDrawer();
        return true;
      }
      const nav = navigationRef.current;
      if (nav && nav.canGoBack()) {
        nav.goBack();
        return true;
      }
      Alert.alert('Exit PartyWings', 'Are you sure you want to exit?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Exit', style: 'destructive', onPress: () => BackHandler.exitApp() },
      ]);
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [drawerOpen]);

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
    setSendingOtp(true);
    setOtpError('');
    try {
      await sendOtpMutation({ variables: { phone } });
      setOtpPhone(phone);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send OTP. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (otp: string) => {
    setVerifyingOtp(true);
    setOtpError('');
    try {
      const { data } = await verifyOtpMutation({
        variables: { phone: otpPhone, otp },
      });
      if (data?.verifyOtp?.token) {
        await AsyncStorage.setItem('token', data.verifyOtp.token);
        if (data.verifyOtp.isNewUser) {
          setIsNewUser(true);
        }
        setIsAuthenticated(true);
        setOtpPhone('');
      } else {
        setOtpError('Verification failed. Please try again.');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Verification failed. Please try again.';
      setOtpError(message);
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    setOtpError('');
    try {
      await sendOtpMutation({ variables: { phone: otpPhone } });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to resend OTP.';
      setOtpError(message);
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

  const handleProfileNavigate = (screen: string, navigation: { navigate: (name: string, params?: Record<string, unknown>) => void }) => {
    switch (screen) {
      case 'EditProfile':
        // Stay on profile (future: open edit modal)
        break;
      case 'MyPods':
        navigation.navigate('Main', { screen: 'Chat' } as never);
        break;
      case 'Notifications':
        navigation.navigate('Notifications');
        break;
      case 'Payments':
      case 'Privacy':
        // Placeholder: screens can be added later
        break;
      case 'Help':
        navigation.navigate('Faq');
        break;
      default:
        break;
    }
  };

  const handleDrawerNavigate = (screen: string) => {
    const nav = navigationRef.current;
    if (!nav) return;

    switch (screen) {
      case 'Home':
        nav.navigate('Main', { screen: 'Home' } as never);
        break;
      case 'Explore':
        nav.navigate('Main', { screen: 'Explore' } as never);
        break;
      case 'Chat':
        nav.navigate('Main', { screen: 'Chat' } as never);
        break;
      case 'Profile':
        nav.navigate('Main', { screen: 'Profile' } as never);
        break;
      case 'CreatePod':
        nav.navigate('CreatePod');
        break;
      case 'Notifications':
        nav.navigate('Notifications');
        break;
      case 'RegisterPlace':
        nav.navigate('RegisterPlace');
        break;
      case 'Tickets':
        nav.navigate('Main', { screen: 'Profile' } as never);
        break;
      case 'Payments':
        nav.navigate('Main', { screen: 'Profile' } as never);
        break;
      case 'Help':
        nav.navigate('Faq');
        break;
      case 'Support':
        nav.navigate('Support');
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
        <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade_from_bottom', animationDuration: 250 }}>
          {!isAuthenticated ? (
            <>
              {!otpPhone ? (
                <Stack.Screen name="Login">
                  {() => <LoginScreen onSendOtp={handleSendOtp} loading={sendingOtp} />}
                </Stack.Screen>
              ) : (
                <Stack.Screen name="Otp">
                  {() => (
                    <OtpScreen
                      phone={otpPhone}
                      onVerify={handleVerifyOtp}
                      onBack={() => { setOtpPhone(''); setOtpError(''); }}
                      onResend={handleResendOtp}
                      loading={verifyingOtp}
                      error={otpError}
                    />
                  )}
                </Stack.Screen>
              )}
            </>
          ) : isNewUser ? (
            <>
              <Stack.Screen name="CompleteProfile">
                {() => (
                  <CompleteProfileScreen
                    onComplete={async (name: string, age: number) => {
                      try {
                        await completeProfileMutation({ variables: { name, age } });
                      } catch {
                        // Profile save failed — continue anyway
                      }
                      setIsNewUser(false);
                    }}
                  />
                )}
              </Stack.Screen>
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
                    onNavigate={(screen) => handleProfileNavigate(screen, navigation)}
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
              <Stack.Screen name="Faq" options={{ presentation: 'card' }}>
                {({ navigation }) => (
                  <FaqScreen onBack={() => navigation.goBack()} />
                )}
              </Stack.Screen>
              <Stack.Screen name="Support" options={{ presentation: 'card' }}>
                {({ navigation }) => (
                  <SupportScreen onBack={() => navigation.goBack()} />
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
