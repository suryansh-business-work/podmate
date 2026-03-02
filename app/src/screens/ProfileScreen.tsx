import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@apollo/client';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors, spacing, borderRadius } from '../theme';
import { GET_ME, GET_MY_PODS } from '../graphql/queries';

interface ProfileScreenProps {
  onLogout: () => void;
}

interface MenuItem {
  icon: string;
  label: string;
  subtitle: string;
}

const MENU_ITEMS: MenuItem[] = [
  { icon: 'person', label: 'Edit Profile', subtitle: 'Name, photo, bio' },
  { icon: 'confirmation-number', label: 'My Pods', subtitle: 'Joined & hosted pods' },
  { icon: 'credit-card', label: 'Payments', subtitle: 'Transactions & payouts' },
  { icon: 'notifications', label: 'Notifications', subtitle: 'Manage preferences' },
  { icon: 'security', label: 'Privacy & Security', subtitle: 'Account settings' },
  { icon: 'help', label: 'Help & Support', subtitle: 'FAQs, contact us' },
];

const ProfileScreen: React.FC<ProfileScreenProps> = ({ onLogout }) => {
  const { data: meData, loading: meLoading } = useQuery(GET_ME, { fetchPolicy: 'cache-and-network' });
  const { data: podsData } = useQuery(GET_MY_PODS, { fetchPolicy: 'cache-and-network' });

  const user = meData?.me;
  const podCount = podsData?.myPods?.length ?? 0;

  if (meLoading && !user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.profileHeader}>
          <LinearGradient
            colors={[colors.primaryLight, colors.primary]}
            style={styles.avatarGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Image
              source={{ uri: user?.avatar || 'https://i.pravatar.cc/150?img=8' }}
              style={styles.avatar}
            />
          </LinearGradient>
          <Text style={styles.userName}>{user?.name || 'PartyWings User'}</Text>
          <Text style={styles.userPhone}>{user?.phone || ''}</Text>
          {user?.isVerifiedHost && (
            <View style={styles.verifiedBadge}>
              <MaterialIcons name="check-circle" size={14} color={colors.success} />
              <Text style={styles.verifiedBadgeText}>Verified Host</Text>
            </View>
          )}

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{podCount}</Text>
              <Text style={styles.statLabel}>My Pods</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user?.role === 'ADMIN' ? 'Admin' : user?.role || 'USER'}</Text>
              <Text style={styles.statLabel}>Role</Text>
            </View>
          </View>
        </View>

        <View style={styles.menuContainer}>
          {MENU_ITEMS.map((item, index) => (
            <TouchableOpacity key={index} style={styles.menuItem} activeOpacity={0.7}>
              <MaterialIcons name={item.icon} size={22} color={colors.textSecondary} />
              <View style={styles.menuContent}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={22} color={colors.textTertiary} />
            </TouchableOpacity>
          ))}
        </View>

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
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  profileHeader: { alignItems: 'center', paddingTop: spacing.xxl, paddingBottom: spacing.xl },
  avatarGradient: {
    width: 88, height: 88, borderRadius: 44, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md,
  },
  avatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: colors.white },
  userName: { fontSize: 22, fontWeight: '700', color: colors.text },
  userPhone: { fontSize: 14, color: colors.textSecondary, marginTop: 2 },
  verifiedBadge: {
    marginTop: spacing.sm, flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs, backgroundColor: colors.success + '20', borderRadius: borderRadius.full,
  },
  verifiedBadgeText: { fontSize: 12, fontWeight: '600', color: colors.success },
  statsRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xl, paddingHorizontal: spacing.xxxl },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '700', color: colors.text },
  statLabel: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  statDivider: { width: 1, height: 32, backgroundColor: colors.border },
  menuContainer: { paddingHorizontal: spacing.xl, marginTop: spacing.md },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.surfaceVariant, gap: spacing.md,
  },
  menuContent: { flex: 1 },
  menuLabel: { fontSize: 16, fontWeight: '600', color: colors.text },
  menuSubtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 1 },
  logoutButton: {
    marginHorizontal: spacing.xl, marginTop: spacing.xxl, paddingVertical: spacing.lg,
    borderRadius: borderRadius.md, borderWidth: 1.5, borderColor: colors.error, alignItems: 'center',
  },
  logoutText: { fontSize: 16, fontWeight: '600', color: colors.error },
  version: { textAlign: 'center', fontSize: 12, color: colors.textTertiary, marginTop: spacing.lg, marginBottom: spacing.xxxl },
});

export default ProfileScreen;
