import React, { useEffect, useRef } from 'react';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Animated, TouchableOpacity, StyleSheet, BackHandler, Alert } from 'react-native';
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
import ChatbotFab from '../components/ChatbotFab';
import NetworkBanner from '../components/NetworkBanner';
import MainTabs from './MainTabs';
import DrawerMenu from '../components/DrawerMenu';
import { RootStackParamList } from './RootNavigator.types';
import { createDrawerStyles } from './RootNavigator.styles';
import { useThemedStyles } from '../hooks/useThemedStyles';
import { useAuth } from './hooks/useAuth';
import { useDrawer, DRAWER_WIDTH } from './hooks/useDrawer';

export type { RootStackParamList } from './RootNavigator.types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator: React.FC = () => {
  const auth = useAuth();
  const drawer = useDrawer();
  const drawerStyles = useThemedStyles(createDrawerStyles);
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);

  useEffect(() => {
    const onBackPress = () => {
      if (drawer.drawerOpen) {
        drawer.closeDrawer();
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
      Feedback: () => navigation.navigate('Feedback'),
      PodIdeas: () => navigation.navigate('PodIdeas'),
    };
    map[screen]?.();
  };

  const handleDrawerNavigate = (screen: string) => {
    const nav = navigationRef.current;
    if (!nav) return;
    drawer.closeDrawer();
    const map: Record<string, () => void> = {
      Home: () => nav.navigate('Main', { screen: 'Home' } as never),
      Explore: () => nav.navigate('Main', { screen: 'Explore' } as never),
      Chat: () => nav.navigate('Main', { screen: 'Chat' } as never),
      Profile: () => nav.navigate('Main', { screen: 'Profile' } as never),
      CreatePod: () => nav.navigate('CreatePod'),
      Notifications: () => nav.navigate('Notifications'),
      RegisterPlace: () => nav.navigate('RegisterPlace'),
      MyPods: () => nav.navigate('MyPods'),
      Payments: () => nav.navigate('Payments'),
      Help: () => nav.navigate('Faq'),
      Support: () => nav.navigate('Support'),
      Feedback: () => nav.navigate('Feedback'),
      PodIdeas: () => nav.navigate('PodIdeas'),
      GoLive: () => nav.navigate('GoLive'),
    };
    map[screen]?.();
  };

  const handleLogoutAndClose = async () => {
    drawer.closeDrawer();
    await auth.handleLogout();
  };

  if (auth.isLoading) return null;
  if (auth.showSplash) return <SplashScreen onFinish={auth.handleSplashFinish} />;

  return (
    <View style={{ flex: 1 }}>
      <NetworkBanner />
      <NavigationContainer ref={navigationRef}>
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
                  {() => <LoginScreen onSendOtp={auth.handleSendOtp} loading={auth.sendingOtp} />}
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
              <Stack.Screen name="Main">
                {({ navigation }) => (
                  <MainTabs
                    onPodPress={(id) => navigation.navigate('PodDetail', { podId: id })}
                    onCreatePress={() => navigation.navigate('CreatePod')}
                    onLogout={auth.handleLogout}
                    onMenuPress={drawer.openDrawer}
                    onNavigate={(screen) => handleProfileNavigate(screen, navigation)}
                    onCheckout={(podId) => navigation.navigate('Checkout', { podId })}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen name="PodDetail" options={{ presentation: 'card' }}>
                {({ navigation, route }) => (
                  <PodDetailScreen
                    podId={(route.params as { podId: string })?.podId}
                    onBack={() => navigation.goBack()}
                    onCheckout={(id: string) => navigation.navigate('Checkout', { podId: id })}
                    onReviews={(targetType, targetId, targetTitle) =>
                      navigation.navigate('Reviews', { targetType, targetId, targetTitle })
                    }
                    onGoLive={() => navigation.navigate('GoLive')}
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
              <Stack.Screen name="CreatePod" options={{ presentation: 'modal' }}>
                {({ navigation }) => <CreatePodScreen onClose={() => navigation.goBack()} />}
              </Stack.Screen>
              <Stack.Screen name="Notifications" options={{ presentation: 'card' }}>
                {({ navigation }) => <NotificationsScreen onBack={() => navigation.goBack()} />}
              </Stack.Screen>
              <Stack.Screen name="RegisterPlace" options={{ presentation: 'modal' }}>
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
                {({ navigation }) => <GoLiveScreen onBack={() => navigation.goBack()} />}
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
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>

      {auth.isAuthenticated && !auth.isNewUser && (
        <ChatbotFab onPress={() => navigationRef.current?.navigate('Chatbot')} />
      )}

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
