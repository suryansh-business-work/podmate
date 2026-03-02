import React, { useState, useCallback } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@apollo/client';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors, spacing, borderRadius } from '../theme';
import { SkeletonProfile } from '../components/Skeleton';
import { GET_ME, GET_MY_PODS } from '../graphql/queries';

interface ProfileScreenProps {
  onLogout: () => void;
  onNavigate?: (screen: string) => void;
}

interface MenuItem {
  icon: string;
  label: string;
  subtitle: string;
  action: string;
}

const MENU_ITEMS: MenuItem[] = [
  { icon: 'person', label: 'Edit Profile', subtitle: 'Name, photo, bio', action: 'EditProfile' },
  { icon: 'confirmation-number', label: 'My Pods', subtitle: 'Joined & hosted pods', action: 'MyPods' },
  { icon: 'credit-card', label: 'Payments', subtitle: 'Transactions & payouts', action: 'Payments' },
  { icon: 'notifications', label: 'Notifications', subtitle: 'Manage preferences', action: 'Notifications' },
  { icon: 'security', label: 'Privacy & Security', subtitle: 'Account settings', action: 'Privacy' },
  { icon: 'help', label: 'Help & Support', subtitle: 'FAQs, contact us', action: 'Help' },
];

const ProfileScreen: React.FC<ProfileScreenProps> = ({ onLogout, onNavigate }) => {
  const { data: meData, loading: meLoading, error: meError, refetch: refetchMe } = useQuery(GET_ME, { fetchPolicy: 'cache-and-network' });
  const { data: podsData, refetch: refetchPods } = useQuery(GET_MY_PODS, { fetchPolicy: 'cache-and-network' });

  const user = meData?.me;
  const podCount = podsData?.myPods?.length ?? 0;

  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchMe(), refetchPods()]);
    setRefreshing(false);
  }, [refetchMe, refetchPods]);

  if (meLoading && !user) {
    return (
      <SafeAreaView style={styles.container}>
        <SkeletonProfile />
      </SafeAreaView>
    );
  }

  if (meError && !user) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <MaterialIcons name="cloud-off" size={48} color={colors.error} />
        <Text style={{ color: colors.error, fontWeight: '600', marginTop: 12 }}>Failed to load profile</Text>
        <Text style={{ color: colors.textSecondary, marginTop: 4 }}>{meError.message}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}
      >
        <View style={styles.profileHeader}>
          <LinearGradient
            colors={[colors.primaryLight, colors.primary]}
            style={styles.avatarGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {user?.avatar
              ? <Image source={{ uri: user.avatar }} style={styles.avatar} />
              : <View style={[styles.avatar, { backgroundColor: colors.primaryLight, justifyContent: 'center', alignItems: 'center' }]}><MaterialIcons name="person" size={48} color={colors.white} /></View>
            }
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
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={() => onNavigate?.(item.action)}
            >
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
