import React, { ComponentProps } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import ExploreScreen from '../screens/ExploreScreen';
import { MomentsScreen } from '../screens/Moments';
import ChatScreen from '../screens/Chat';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import { useThemedStyles, useAppColors, ThemeUtils } from '../hooks/useThemedStyles';
import { useQuery } from '@apollo/client';
import { GET_ME } from '../graphql/queries';

const Tab = createBottomTabNavigator();

type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];

const TAB_ICONS: Record<string, MaterialIconName> = {
  Home: 'home',
  Explore: 'explore',
  Chat: 'chat',
  Moments: 'auto-awesome',
  Profile: 'person',
};

interface MainTabsProps {
  onPodPress: (id: string) => void;
  onCreatePress: () => void;
  onCreateMoment: () => void;
  onMenuPress: () => void;
  onNavigate?: (screen: string) => void;
  onCheckout?: (podId: string) => void;
  onNotificationPress?: () => void;
  onChatbotPress?: () => void;
  onLogout?: () => Promise<void>;
  onFollowers?: (userId: string, userName: string) => void;
  onFollowing?: (userId: string, userName: string) => void;
  onRoleSwitch?: (role: string) => void;
}

const MainTabs: React.FC<MainTabsProps> = ({
  onPodPress,
  onCreatePress,
  onCreateMoment,
  onMenuPress,
  onNavigate,
  onCheckout,
  onNotificationPress,
  onChatbotPress,
  onLogout,
  onFollowers,
  onFollowing,
  onRoleSwitch,
}) => {
  const styles = useThemedStyles(createStyles);
  const colors = useAppColors();
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === 'android' ? Math.max(insets.bottom, 10) : insets.bottom;

  const { data: meData } = useQuery(GET_ME, { fetchPolicy: 'cache-first' });
  const activeRole = meData?.me?.activeRole ?? 'USER';
  const hideTabBar = activeRole === 'VENUE_OWNER' || activeRole === 'HOST';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: hideTabBar
          ? { display: 'none' as const }
          : {
              ...styles.tabBar,
              paddingBottom: bottomPadding + 8,
              height: 60 + bottomPadding + 8,
            },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabelStyle: styles.tabLabel,
        lazy: false,
        tabBarIcon: ({ focused, color }) => {
          const iconName = TAB_ICONS[route.name] ?? 'circle';
          return (
            <MaterialIcons
              name={iconName}
              size={24}
              color={color}
              style={{ opacity: focused ? 1 : 0.6 }}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Home">
        {() => (
          <HomeScreen
            onPodPress={onPodPress}
            onMenuPress={onMenuPress}
            onNotificationPress={onNotificationPress}
            onChatbotPress={onChatbotPress}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Explore">
        {() => <ExploreScreen onPodPress={onPodPress} onCheckout={onCheckout} />}
      </Tab.Screen>
      <Tab.Screen name="Chat">{() => <ChatScreen />}</Tab.Screen>
      <Tab.Screen name="Moments">
        {() => <MomentsScreen onCreateMoment={onCreateMoment} />}
      </Tab.Screen>
      <Tab.Screen name="Profile">
        {() => (
          <ProfileScreen
            onLogout={onLogout ?? (async () => {})}
            onNavigate={onNavigate}
            onCreateMoment={onCreateMoment}
            onFollowers={onFollowers}
            onFollowing={onFollowing}
            onRoleSwitch={onRoleSwitch}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

const createStyles = ({ colors }: ThemeUtils) =>
  StyleSheet.create({
    tabBar: {
      height: 80,
      paddingBottom: 16,
      paddingTop: 8,
      position: 'relative' as const,
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
      elevation: 8,
    },
    tabLabel: {
      fontSize: 11,
      fontWeight: '500',
    },
  });

export default MainTabs;
