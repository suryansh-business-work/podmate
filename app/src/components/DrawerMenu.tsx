import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius } from '../theme';

interface DrawerMenuProps {
  onClose: () => void;
  onNavigate: (screen: string) => void;
  onLogout: () => void;
}

const MENU_SECTIONS = [
  {
    title: 'MAIN',
    items: [
      { icon: '🏠', label: 'Home', screen: 'HomeTab' },
      { icon: '🧭', label: 'Explore', screen: 'ExploreTab' },
      { icon: '💬', label: 'Messages', screen: 'ChatTab' },
      { icon: '🔔', label: 'Notifications', screen: 'Notifications' },
    ],
  },
  {
    title: 'HOST',
    items: [
      { icon: '📍', label: 'Register Place', screen: 'RegisterPlace' },
      { icon: '➕', label: 'Create Pod', screen: 'CreatePod' },
      { icon: '🎫', label: 'My Pods', screen: 'MyPods' },
    ],
  },
  {
    title: 'ACCOUNT',
    items: [
      { icon: '👤', label: 'Profile', screen: 'ProfileTab' },
      { icon: '💳', label: 'Payments', screen: 'Payments' },
      { icon: '⚙️', label: 'Settings', screen: 'Settings' },
      { icon: '❓', label: 'Help & Support', screen: 'Help' },
    ],
  },
];

const DrawerMenu: React.FC<DrawerMenuProps> = ({ onClose, onNavigate, onLogout }) => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <TouchableOpacity
          style={styles.profileHeader}
          onPress={() => {
            onNavigate('ProfileTab');
            onClose();
          }}
        >
          <Image
            source={{ uri: 'https://i.pravatar.cc/150?img=8' }}
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>PartyWings User</Text>
            <Text style={styles.profilePhone}>+91 9999999999</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* Menu Sections */}
        {MENU_SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((item) => (
              <TouchableOpacity
                key={item.screen}
                style={styles.menuItem}
                onPress={() => {
                  onNavigate(item.screen);
                  onClose();
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.menuIcon}>{item.icon}</Text>
                <Text style={styles.menuLabel}>{item.label}</Text>
                {item.screen === 'Notifications' && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>3</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}

        <View style={styles.divider} />

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.logoutIcon}>🚪</Text>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>PartyWings v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  profilePhone: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  arrow: {
    fontSize: 22,
    color: colors.textTertiary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.surfaceVariant,
    marginHorizontal: spacing.xl,
  },
  section: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textTertiary,
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  menuIcon: {
    fontSize: 20,
    width: 28,
    textAlign: 'center',
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
  badge: {
    backgroundColor: colors.error,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  logoutIcon: {
    fontSize: 20,
    width: 28,
    textAlign: 'center',
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.error,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.textTertiary,
    paddingVertical: spacing.lg,
  },
});

export default DrawerMenu;
