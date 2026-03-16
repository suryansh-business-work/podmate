import React, { useEffect, useRef } from 'react';
import {
  NavigationContainer,
  NavigationContainerRef,
  DefaultTheme,
  DarkTheme,
  LinkingOptions,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Linking from 'expo-linking';
import { View, Animated, TouchableOpacity, StyleSheet, BackHandler, Alert } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import config from '../config';
import SplashScreen from '../screens/SplashScreen';
import { LoginScreen, OtpScreen } from '../screens/Auth';
import CompleteProfileScreen from '../screens/CompleteProfileScreen';
import PodDetailScreen from '../screens/PodDetailScreen';
import CreatePodScreen from '../screens/CreatePod';
import NotificationsScreen from '../screens/NotificationsScreen';
import RegisterPlaceScreen from '../screens/RegisterPlace';
import FaqScreen from '../screens/FaqScreen';
import SupportScreen from '../screens/SupportScreen';
import ChatbotScreen from '../screens/Chatbot';
import EditProfileScreen from '../screens/EditProfile';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import PaymentsScreen from '../screens/Payments';
import MyPodsScreen from '../screens/MyPods';
import PrivacySecurityScreen from '../screens/PrivacySecurity';
import CheckoutScreen from '../screens/Checkout';
import ReviewsScreen from '../screens/Reviews/ReviewsScreen';
import FeedbackScreen from '../screens/Feedback/FeedbackScreen';
import PodIdeasScreen from '../screens/PodIdeas/PodIdeasScreen';
import GoLiveScreen from '../screens/GoLive/GoLiveScreen';
import FollowListScreen from '../screens/FollowList/FollowListScreen';
import UserProfileScreen from '../screens/UserProfile/UserProfileScreen';
import { CreateMomentScreen } from '../screens/Moments';
import YourVenuesScreen from '../screens/YourVenues';
import VenueMenusScreen from '../screens/VenueMenus';
import ManageOrdersScreen from '../screens/ManageOrders';
import VenueMomentsScreen from '../screens/VenueMoments';
import { WithdrawalScreen } from '../screens/Withdrawal';
import DashboardScreen from '../screens/Dashboard';
// ChatbotFab removed — chatbot trigger moved to HomeScreen header
import NetworkBanner from '../components/NetworkBanner';
import MainTabs from './MainTabs';
import DrawerMenu from '../components/DrawerMenu';
import { RootStackParamList } from './RootNavigator.types';
import { createDrawerStyles } from './RootNavigator.styles';
import { useThemedStyles } from '../hooks/useThemedStyles';
import { useAppColors } from '../hooks/useThemedStyles';
import { useThemeMode } from '../contexts/ThemeContext';
import { useAuth } from './hooks/useAuth';
import { useDrawer, DRAWER_WIDTH } from './hooks/useDrawer';
import { useInAppNotifications } from '../hooks/useInAppNotifications';
import { useRoleBasedInitialRoute } from './hooks/useRoleBasedInitialRoute';

export type { RootStackParamList } from './RootNavigator.types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const prefix = Linking.createURL('/');

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [prefix, 'partywings://'],
  config: {
    screens: {
      Login: 'login',
      Otp: 'otp',
      CompleteProfile: 'complete-profile',
      Main: {
        path: '',
        screens: {
          Home: '',
          Explore: 'explore',
          Chat: 'chat',
          Moments: 'moments',
          Profile: 'profile-tab',
        },
      },
      PodDetail: 'pod/:podId',
      Checkout: 'checkout/:podId',
      CreatePod: 'create-pod',
      CreateMoment: 'create-moment',
      Notifications: 'notifications',
      RegisterPlace: 'register-place',
      Faq: 'faq',
      Support: 'support',
      Chatbot: 'chatbot',
      EditProfile: 'edit-profile',
      Payments: 'payments',
      Privacy: 'privacy',
      MyPods: 'my-pods',
      Reviews: 'reviews/:targetType/:targetId',
      Feedback: 'feedback',
      PodIdeas: 'pod-ideas',
      GoLive: 'go-live',
      FollowList: 'follow-list/:userId',
      UserProfile: 'user/:userId',
      YourVenues: 'your-venues',
      Menus: 'menus',
      ManageOrders: 'manage-orders',
      VenueMoments: 'venue-moments',
      Withdrawal: 'withdrawal',
      Dashboard: 'dashboard',
    },
  },
};

const RootNavigator: React.FC = () => {
  const auth = useAuth();
  const drawer = useDrawer();
  const drawerStyles = useThemedStyles(createDrawerStyles);
  const colors = useAppColors();
  const { isDark } = useThemeMode();
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);
  const { initialRoute, isReady: roleReady } = useRoleBasedInitialRoute(auth.isAuthenticated);

  useInAppNotifications({ isAuthenticated: auth.isAuthenticated });

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: config.googleWebClientId || undefined,
    });
  }, []);

  useEffect(() => {
    const onBackPress = () => {
      if (drawer.drawerOpen) {
        drawer.closeDrawer();
        return true;
      }
      const nav = navigationRef.current;
      if (nav && nav.canGoBack()) {
        /* Prevent navigating back to screens from a different role */
        const state = nav.getState();
        const currentRoute = state.routes[state.index];
        if (currentRoute?.name === 'Dashboard' || currentRoute?.name === 'Main') {
          Alert.alert('Exit PartyWings', 'Are you sure you want to exit?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Exit', style: 'destructive', onPress: () => BackHandler.exitApp() },
          ]);
          return true;
        }
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
  }, [drawer.drawerOpen, drawer.closeDrawer]);

  const handleProfileNavigate = (
    screen: string,
    navigation: { navigate: (name: string, params?: Record<string, unknown>) => void },
  ) => {
    const map: Record<string, () => void> = {
      EditProfile: () => navigation.navigate('EditProfile'),
      MyPods: () => navigation.navigate('MyPods'),
      Payments: () => navigation.navigate('Payments'),
      Notifications: () => navigation.navigate('Notifications'),
      Privacy: () => navigation.navigate('Privacy'),
      Help: () => navigation.navigate('Faq'),
      Support: () => navigation.navigate('Support'),
      Feedback: () => navigation.navigate('Feedback'),
      PodIdeas: () => navigation.navigate('PodIdeas'),
      GoLive: () => navigation.navigate('GoLive'),
      RegisterPlace: () => navigation.navigate('RegisterPlace'),
    };
    map[screen]?.();
  };

  const handleRoleSwitch = (role: string) => {
    const nav = navigationRef.current;
    if (!nav) return;
    const targetRoute = role === 'HOST' || role === 'VENUE_OWNER' ? 'Dashboard' : 'Main';
    nav.reset({ index: 0, routes: [{ name: targetRoute }] });
  };

  const handleDrawerNavigate = (screen: string) => {
    const nav = navigationRef.current;
    if (!nav) return;
    drawer.closeDrawer();
    const map: Record<string, () => void> = {
      Home: () => nav.reset({ index: 0, routes: [{ name: 'Main' }] }),
      Explore: () => nav.navigate('Main', { screen: 'Explore' } as never),
      Chat: () => nav.navigate('Main', { screen: 'Chat' } as never),
      Moments: () => nav.navigate('Main', { screen: 'Moments' } as never),
      CreatePod: () => nav.navigate('CreatePod'),
      Notifications: () => nav.navigate('Notifications'),
      RegisterPlace: () => nav.navigate('RegisterPlace'),
      MyPods: () => nav.navigate('MyPods'),
      Profile: () => nav.navigate('Profile'),
      Payments: () => nav.navigate('Payments'),
      Help: () => nav.navigate('Faq'),
      Support: () => nav.navigate('Support'),
      Feedback: () => nav.navigate('Feedback'),
      PodIdeas: () => nav.navigate('PodIdeas'),
      GoLive: () => nav.navigate('GoLive'),
      Dashboard: () => nav.reset({ index: 0, routes: [{ name: 'Dashboard' }] }),
      YourVenues: () => nav.navigate('YourVenues'),
      Menus: () => nav.navigate('Menus'),
      ManageOrders: () => nav.navigate('ManageOrders'),
      VenueMoments: () => nav.navigate('VenueMoments'),
      Withdrawal: () => nav.navigate('Withdrawal'),
    };
    map[screen]?.();
  };

  const handleLogoutAndClose = async () => {
    drawer.closeDrawer();
    await auth.handleLogout();
  };

  if (auth.isLoading) return null;
  if (auth.showSplash) return <SplashScreen onFinish={auth.handleSplashFinish} />;
  if (auth.isAuthenticated && !auth.isNewUser && !roleReady) return null;

  return (
    <View style={{ flex: 1 }}>
      <NetworkBanner />
      <NavigationContainer
        ref={navigationRef}
        linking={linking}
        theme={{
          ...(isDark ? DarkTheme : DefaultTheme),
          colors: {
            ...(isDark ? DarkTheme : DefaultTheme).colors,
            primary: colors.primary,
            background: colors.background,
            card: colors.surface,
            text: colors.text,
            border: colors.border,
            notification: colors.error,
          },
        }}
      >
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            animation: 'fade_from_bottom',
            animationDuration: 250,
          }}
        >
          {!auth.isAuthenticated ? (
            <>
              {!auth.otpPhone ? (
                <Stack.Screen name="Login">
                  {() => (
                    <LoginScreen
                      onSendOtp={auth.handleSendOtp}
                      loading={auth.sendingOtp}
                      onGoogleSignIn={auth.handleGoogleSignIn}
                      googleSignInLoading={auth.googleSignInLoading}
                    />
                  )}
                </Stack.Screen>
              ) : (
                <Stack.Screen name="Otp">
                  {() => (
                    <OtpScreen
                      phone={auth.otpPhone}
                      onVerify={auth.handleVerifyOtp}
                      onBack={auth.clearOtp}
                      onResend={auth.handleResendOtp}
                      loading={auth.verifyingOtp}
                      error={auth.otpError}
                    />
                  )}
                </Stack.Screen>
              )}
            </>
          ) : auth.isNewUser ? (
            <Stack.Screen name="CompleteProfile">
              {() => <CompleteProfileScreen onComplete={auth.handleCompleteProfile} />}
            </Stack.Screen>
          ) : (
            <>
              {initialRoute === 'Main' && (
                <Stack.Screen name="Main">
                  {({ navigation }) => (
                    <MainTabs
                      onPodPress={(id) => navigation.navigate('PodDetail', { podId: id })}
                      onCreatePress={() => navigation.navigate('CreatePod')}
                      onCreateMoment={() => navigation.navigate('CreateMoment')}
                      onMenuPress={() =>
                        navigation.navigate('Main', { screen: 'Profile' } as never)
                      }
                      onNavigate={(screen) => handleProfileNavigate(screen, navigation)}
                      onCheckout={(podId) => navigation.navigate('Checkout', { podId })}
                      onNotificationPress={() => navigation.navigate('Notifications')}
                      onChatbotPress={() => navigation.navigate('Chatbot')}
                      onLogout={async () => {
                        await auth.handleLogout();
                      }}
                      onFollowers={(userId, userName) =>
                        navigation.navigate('FollowList', {
                          userId,
                          userName,
                          initialTab: 'followers',
                        })
                      }
                      onFollowing={(userId, userName) =>
                        navigation.navigate('FollowList', {
                          userId,
                          userName,
                          initialTab: 'following',
                        })
                      }
                      onRoleSwitch={handleRoleSwitch}
                    />
                  )}
                </Stack.Screen>
              )}
              {initialRoute === 'Dashboard' && (
                <Stack.Screen name="Dashboard" options={{ presentation: 'card' }}>
                  {({ navigation }) => (
                    <DashboardScreen
                      onBack={drawer.openDrawer}
                      onProfilePress={() => navigation.navigate('Profile')}
                      onNotificationPress={() => navigation.navigate('Notifications')}
                      onRegisterVenue={() => navigation.navigate('RegisterPlace')}
                    />
                  )}
                </Stack.Screen>
              )}
              {initialRoute !== 'Main' && (
                <Stack.Screen name="Main">
                  {({ navigation }) => (
                    <MainTabs
                      onPodPress={(id) => navigation.navigate('PodDetail', { podId: id })}
                      onCreatePress={() => navigation.navigate('CreatePod')}
                      onCreateMoment={() => navigation.navigate('CreateMoment')}
                      onMenuPress={drawer.openDrawer}
                      onNavigate={(screen) => handleProfileNavigate(screen, navigation)}
                      onCheckout={(podId) => navigation.navigate('Checkout', { podId })}
                      onNotificationPress={() => navigation.navigate('Notifications')}
                      onChatbotPress={() => navigation.navigate('Chatbot')}
                      onLogout={async () => {
                        await auth.handleLogout();
                      }}
                      onFollowers={(userId, userName) =>
                        navigation.navigate('FollowList', {
                          userId,
                          userName,
                          initialTab: 'followers',
                        })
                      }
                      onFollowing={(userId, userName) =>
                        navigation.navigate('FollowList', {
                          userId,
                          userName,
                          initialTab: 'following',
                        })
                      }
                      onRoleSwitch={handleRoleSwitch}
                    />
                  )}
                </Stack.Screen>
              )}
              {initialRoute !== 'Dashboard' && (
                <Stack.Screen name="Dashboard" options={{ presentation: 'card' }}>
                  {({ navigation }) => (
                    <DashboardScreen
                      onBack={drawer.openDrawer}
                      onProfilePress={() => navigation.navigate('Profile')}
                      onNotificationPress={() => navigation.navigate('Notifications')}
                      onRegisterVenue={() => navigation.navigate('RegisterPlace')}
                    />
                  )}
                </Stack.Screen>
              )}
              <Stack.Screen name="PodDetail" options={{ presentation: 'card' }}>
                {({ navigation, route }) => (
                  <PodDetailScreen
                    podId={(route.params as { podId: string })?.podId}
                    onBack={() => navigation.goBack()}
                    onCheckout={(id: string) => navigation.navigate('Checkout', { podId: id })}
                    onReviews={(targetType, targetId, targetTitle) =>
                      navigation.navigate('Reviews', { targetType, targetId, targetTitle })
                    }
                    onGoLive={(goLivePodId: string) =>
                      navigation.navigate('GoLive', { podId: goLivePodId })
                    }
                    onUserProfile={(userId) => navigation.navigate('UserProfile', { userId })}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen name="Checkout" options={{ presentation: 'card' }}>
                {({ navigation, route }) => (
                  <CheckoutScreen
                    podId={(route.params as { podId: string })?.podId}
                    onBack={() => navigation.goBack()}
                    onSuccess={() => navigation.navigate('Main')}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen name="CreatePod" options={{ presentation: 'card' }}>
                {({ navigation }) => (
                  <CreatePodScreen
                    onClose={() => navigation.goBack()}
                    onSuccess={() => navigation.navigate('Main')}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen name="CreateMoment" options={{ presentation: 'modal' }}>
                {({ navigation }) => (
                  <CreateMomentScreen
                    onClose={() => navigation.goBack()}
                    onSuccess={() => navigation.goBack()}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen name="Notifications" options={{ presentation: 'card' }}>
                {({ navigation }) => <NotificationsScreen onBack={() => navigation.goBack()} />}
              </Stack.Screen>
              <Stack.Screen name="RegisterPlace" options={{ presentation: 'card' }}>
                {({ navigation }) => <RegisterPlaceScreen onClose={() => navigation.goBack()} />}
              </Stack.Screen>
              <Stack.Screen name="Faq" options={{ presentation: 'card' }}>
                {({ navigation }) => <FaqScreen onBack={() => navigation.goBack()} />}
              </Stack.Screen>
              <Stack.Screen name="Support" options={{ presentation: 'card' }}>
                {({ navigation }) => <SupportScreen onBack={() => navigation.goBack()} />}
              </Stack.Screen>
              <Stack.Screen name="EditProfile" options={{ presentation: 'card' }}>
                {({ navigation }) => <EditProfileScreen onBack={() => navigation.goBack()} />}
              </Stack.Screen>
              <Stack.Screen name="Profile" options={{ presentation: 'card' }}>
                {({ navigation }) => (
                  <ProfileScreen
                    onLogout={async () => {
                      navigation.goBack();
                      await auth.handleLogout();
                    }}
                    onNavigate={(screen) => handleProfileNavigate(screen, navigation)}
                    onCreateMoment={() => navigation.navigate('CreateMoment')}
                    onFollowers={(userId, userName) =>
                      navigation.navigate('FollowList', {
                        userId,
                        userName,
                        initialTab: 'followers',
                      })
                    }
                    onFollowing={(userId, userName) =>
                      navigation.navigate('FollowList', {
                        userId,
                        userName,
                        initialTab: 'following',
                      })
                    }
                    onRoleSwitch={handleRoleSwitch}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen name="Payments" options={{ presentation: 'card' }}>
                {({ navigation }) => <PaymentsScreen onBack={() => navigation.goBack()} />}
              </Stack.Screen>
              <Stack.Screen name="MyPods" options={{ presentation: 'card' }}>
                {({ navigation }) => (
                  <MyPodsScreen
                    onBack={() => navigation.goBack()}
                    onPodPress={(id) => navigation.navigate('PodDetail', { podId: id })}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen name="Privacy" options={{ presentation: 'card' }}>
                {({ navigation }) => <PrivacySecurityScreen onBack={() => navigation.goBack()} />}
              </Stack.Screen>
              <Stack.Screen name="Chatbot" options={{ presentation: 'modal' }}>
                {({ navigation }) => <ChatbotScreen onBack={() => navigation.goBack()} />}
              </Stack.Screen>
              <Stack.Screen name="Reviews" options={{ presentation: 'card' }}>
                {({ navigation, route }) => {
                  const params = route.params as {
                    targetType: 'POD' | 'PLACE';
                    targetId: string;
                    targetTitle: string;
                  };
                  return (
                    <ReviewsScreen
                      targetType={params.targetType}
                      targetId={params.targetId}
                      targetTitle={params.targetTitle}
                      onBack={() => navigation.goBack()}
                    />
                  );
                }}
              </Stack.Screen>
              <Stack.Screen name="Feedback" options={{ presentation: 'card' }}>
                {({ navigation }) => <FeedbackScreen onBack={() => navigation.goBack()} />}
              </Stack.Screen>
              <Stack.Screen name="PodIdeas" options={{ presentation: 'card' }}>
                {({ navigation }) => <PodIdeasScreen onBack={() => navigation.goBack()} />}
              </Stack.Screen>
              <Stack.Screen name="GoLive" options={{ presentation: 'card' }}>
                {({ navigation, route }) => {
                  const params = (route.params as { podId?: string; podTitle?: string }) ?? {};
                  return (
                    <GoLiveScreen
                      onBack={() => navigation.goBack()}
                      podId={params.podId}
                      podTitle={params.podTitle}
                    />
                  );
                }}
              </Stack.Screen>
              <Stack.Screen name="FollowList" options={{ presentation: 'card' }}>
                {({ navigation, route }) => {
                  const params = route.params as {
                    userId: string;
                    userName: string;
                    initialTab?: 'followers' | 'following';
                  };
                  return (
                    <FollowListScreen
                      userId={params.userId}
                      userName={params.userName}
                      initialTab={params.initialTab}
                      onBack={() => navigation.goBack()}
                      onUserPress={(id) => navigation.navigate('UserProfile', { userId: id })}
                    />
                  );
                }}
              </Stack.Screen>
              <Stack.Screen name="UserProfile" options={{ presentation: 'card' }}>
                {({ navigation, route }) => {
                  const params = route.params as { userId: string };
                  return (
                    <UserProfileScreen
                      userId={params.userId}
                      onBack={() => navigation.goBack()}
                      onPodPress={(id) => navigation.navigate('PodDetail', { podId: id })}
                      onFollowers={(id, name) =>
                        navigation.navigate('FollowList', {
                          userId: id,
                          userName: name,
                          initialTab: 'followers',
                        })
                      }
                      onFollowing={(id, name) =>
                        navigation.navigate('FollowList', {
                          userId: id,
                          userName: name,
                          initialTab: 'following',
                        })
                      }
                    />
                  );
                }}
              </Stack.Screen>
              <Stack.Screen name="YourVenues" options={{ presentation: 'card' }}>
                {({ navigation }) => (
                  <YourVenuesScreen
                    onBack={() => navigation.goBack()}
                    onRegisterVenue={() => navigation.navigate('RegisterPlace')}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen name="Menus" options={{ presentation: 'card' }}>
                {({ navigation }) => <VenueMenusScreen onBack={() => navigation.goBack()} />}
              </Stack.Screen>
              <Stack.Screen name="ManageOrders" options={{ presentation: 'card' }}>
                {({ navigation }) => (
                  <ManageOrdersScreen
                    onBack={() => navigation.goBack()}
                    onPodPress={(id) => navigation.navigate('PodDetail', { podId: id })}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen name="VenueMoments" options={{ presentation: 'card' }}>
                {({ navigation }) => <VenueMomentsScreen onBack={() => navigation.goBack()} />}
              </Stack.Screen>
              <Stack.Screen name="Withdrawal" options={{ presentation: 'card' }}>
                {({ navigation }) => <WithdrawalScreen onBack={() => navigation.goBack()} />}
              </Stack.Screen>
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>

      {drawer.drawerOpen && (
        <>
          <Animated.View style={[drawerStyles.overlay, { opacity: drawer.overlayAnim }]}>
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={drawer.closeDrawer}
            />
          </Animated.View>
          <Animated.View
            style={[
              drawerStyles.drawer,
              { transform: [{ translateX: drawer.drawerAnim }], width: DRAWER_WIDTH },
            ]}
          >
            <DrawerMenu
              onClose={drawer.closeDrawer}
              onNavigate={handleDrawerNavigate}
              onLogout={handleLogoutAndClose}
            />
          </Animated.View>
        </>
      )}
    </View>
  );
};

export default RootNavigator;
