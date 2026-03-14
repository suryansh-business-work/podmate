import React, { ComponentProps } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import ExploreScreen from '../screens/ExploreScreen';
import { MomentsScreen } from '../screens/Moments';
import ChatScreen from '../screens/Chat';
import { useThemedStyles, useAppColors, ThemeUtils } from '../hooks/useThemedStyles';

const Tab = createBottomTabNavigator();

type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];

const TAB_ICONS: Record<string, MaterialIconName> = {
  Home: 'home',
  Explore: 'explore',
  Create: 'add',
  Chat: 'chat',
  Moments: 'auto-awesome',
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
}) => {
  const styles = useThemedStyles(createStyles);
  const colors = useAppColors();
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === 'android' ? Math.max(insets.bottom, 10) : insets.bottom;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          ...styles.tabBar,
          paddingBottom: bottomPadding + 8,
          height: 60 + bottomPadding + 8,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabelStyle: styles.tabLabel,
        lazy: false,
        tabBarIcon: ({ focused, color }) => {
          if (route.name === 'Create') {
            return (
              <View style={styles.createButtonOuter}>
                <LinearGradient
                  colors={[colors.primaryLight, colors.primary]}
                  style={styles.createButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <MaterialIcons name="add" size={28} color={colors.white} />
                </LinearGradient>
              </View>
            );
          }
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
      <Tab.Screen
        name="Create"
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            onCreatePress();
          },
        }}
      >
        {() => <View />}
      </Tab.Screen>
      <Tab.Screen name="Chat">
        {() => <ChatScreen />}
      </Tab.Screen>
      <Tab.Screen name="Moments">
        {() => <MomentsScreen onCreateMoment={onCreateMoment} />}
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
    createButtonOuter: {
      marginTop: -20,
    },
    createButton: {
      width: 52,
      height: 52,
      borderRadius: 26,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
  });

export default MainTabs;
