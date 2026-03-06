import React, { useState, useCallback } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@apollo/client';
import { MaterialIcons } from '@expo/vector-icons';

import { SkeletonProfile } from '../../components/Skeleton';
import { GET_ME, GET_MY_PODS } from '../../graphql/queries';
import { ProfileScreenProps, MENU_ITEMS } from './Profile.types';
import { createStyles } from './Profile.styles';
import { useThemedStyles, useAppColors } from '../../hooks/useThemedStyles';

const ProfileScreen: React.FC<ProfileScreenProps> = ({ onLogout, onNavigate }) => {
  const styles = useThemedStyles(createStyles);
  const colors = useAppColors();
  const {
    data: meData,
    loading: meLoading,
    error: meError,
    refetch: refetchMe,
  } = useQuery(GET_ME, { fetchPolicy: 'cache-and-network' });
  const { data: podsData, refetch: refetchPods } = useQuery(GET_MY_PODS, {
    fetchPolicy: 'cache-and-network',
  });

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
        <Text style={{ color: colors.error, fontWeight: '600', marginTop: 12 }}>
          Failed to load profile
        </Text>
        <Text style={{ color: colors.textSecondary, marginTop: 4 }}>{meError.message}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.profileHeader}>
          <LinearGradient
            colors={[colors.primaryLight, colors.primary]}
            style={styles.avatarGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
              <View
                style={[
                  styles.avatar,
                  {
                    backgroundColor: colors.primaryLight,
                    justifyContent: 'center',
                    alignItems: 'center',
                  },
                ]}
              >
                <MaterialIcons name="person" size={48} color={colors.white} />
              </View>
            )}
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
              <Text style={styles.statValue}>
                {user?.role === 'ADMIN' ? 'Admin' : user?.role || 'USER'}
              </Text>
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

export default ProfileScreen;
