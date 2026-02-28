import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme';
import HomeScreen from '../screens/HomeScreen';
import ExploreScreen from '../screens/ExploreScreen';
import ChatScreen from '../screens/ChatScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const TAB_ICONS: Record<string, { active: string; inactive: string }> = {
  Home: { active: '🏠', inactive: '🏠' },
  Explore: { active: '🧭', inactive: '🧭' },
  Create: { active: '+', inactive: '+' },
  Chat: { active: '💬', inactive: '💬' },
  Profile: { active: '👤', inactive: '👤' },
};

interface MainTabsProps {
  onPodPress: (id: string) => void;
  onCreatePress: () => void;
  onLogout: () => void;
}

const MainTabs: React.FC<MainTabsProps> = ({ onPodPress, onCreatePress, onLogout }) => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused }) => {
          if (route.name === 'Create') {
            return (
              <View style={styles.createButtonOuter}>
                <LinearGradient
                  colors={[colors.primaryLight, colors.primary]}
                  style={styles.createButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.createIcon}>+</Text>
                </LinearGradient>
              </View>
            );
          }
          const icons = TAB_ICONS[route.name];
          return (
            <Text style={[styles.tabIcon, focused && styles.tabIconActive]}>
              {focused ? icons.active : icons.inactive}
            </Text>
          );
        },
      })}
    >
      <Tab.Screen name="Home">{() => <HomeScreen onPodPress={onPodPress} />}</Tab.Screen>
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen
        name="Create"
        component={View}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            onCreatePress();
          },
        }}
      />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Profile">{() => <ProfileScreen onLogout={onLogout} />}</Tab.Screen>
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    height: 70,
    paddingBottom: 8,
    paddingTop: 8,
    backgroundColor: colors.white,
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
  tabIcon: {
    fontSize: 22,
    opacity: 0.5,
  },
  tabIconActive: {
    opacity: 1,
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
  createIcon: {
    fontSize: 28,
    color: colors.white,
    fontWeight: '300',
  },
});

export default MainTabs;
