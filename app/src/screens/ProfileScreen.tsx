import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius } from '../theme';

interface ProfileScreenProps {
  onLogout: () => void;
}

const MENU_ITEMS = [
  { icon: '👤', label: 'Edit Profile', subtitle: 'Name, photo, bio' },
  { icon: '🎫', label: 'My Pods', subtitle: 'Joined & hosted pods' },
  { icon: '💳', label: 'Payments', subtitle: 'Transactions & payouts' },
  { icon: '🔔', label: 'Notifications', subtitle: 'Manage preferences' },
  { icon: '🛡️', label: 'Privacy & Security', subtitle: 'Account settings' },
  { icon: '❓', label: 'Help & Support', subtitle: 'FAQs, contact us' },
];

const ProfileScreen: React.FC<ProfileScreenProps> = ({ onLogout }) => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <LinearGradient
            colors={[colors.primaryLight, colors.primary]}
            style={styles.avatarGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Image source={{ uri: 'https://i.pravatar.cc/150?img=8' }} style={styles.avatar} />
          </LinearGradient>
          <Text style={styles.userName}>PartyWings User</Text>
          <Text style={styles.userPhone}>+91 9999999999</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>3</Text>
              <Text style={styles.statLabel}>Pods Joined</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>1</Text>
              <Text style={styles.statLabel}>Pods Hosted</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>4.8</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {MENU_ITEMS.map((item, index) => (
            <TouchableOpacity key={index} style={styles.menuItem} activeOpacity={0.7}>
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <View style={styles.menuContent}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>PartyWings v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  profileHeader: { alignItems: 'center', paddingTop: spacing.xxl, paddingBottom: spacing.xl },
  avatarGradient: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: colors.white },
  userName: { fontSize: 22, fontWeight: '700', color: colors.text },
  userPhone: { fontSize: 14, color: colors.textSecondary, marginTop: 2 },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xl,
    paddingHorizontal: spacing.xxxl,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '700', color: colors.text },
  statLabel: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  statDivider: { width: 1, height: 32, backgroundColor: colors.border },
  menuContainer: { paddingHorizontal: spacing.xl, marginTop: spacing.md },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceVariant,
    gap: spacing.md,
  },
  menuIcon: { fontSize: 22, width: 32, textAlign: 'center' },
  menuContent: { flex: 1 },
  menuLabel: { fontSize: 16, fontWeight: '600', color: colors.text },
  menuSubtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 1 },
  menuArrow: { fontSize: 22, color: colors.textTertiary },
  logoutButton: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.xxl,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.error,
    alignItems: 'center',
  },
  logoutText: { fontSize: 16, fontWeight: '600', color: colors.error },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: spacing.lg,
    marginBottom: spacing.xxxl,
  },
});

export default ProfileScreen;
