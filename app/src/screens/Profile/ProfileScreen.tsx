import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery, useMutation } from '@apollo/client';
import { MaterialIcons } from '@expo/vector-icons';

import { SkeletonProfile } from '../../components/Skeleton';
import { RoleSwitcher } from '../../components/RoleSwitcher';
import { ROLE_LABELS } from '../../components/RoleSwitcher/RoleSwitcher.types';
import { GET_ME, GET_MY_PODS, GET_FOLLOW_STATS, GET_USER_MOMENTS } from '../../graphql/queries';
import { SWITCH_ACTIVE_ROLE } from '../../graphql/mutations';
import { useThemeMode } from '../../contexts/ThemeContext';
import { ProfileScreenProps, ProfileTab, MENU_ITEMS } from './Profile.types';
import { createStyles } from './Profile.styles';
import { useThemedStyles, useAppColors } from '../../hooks/useThemedStyles';

interface MomentGridItem {
  id: string;
  mediaUrls: string[];
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onLogout,
  onNavigate,
  onCreateMoment,
  onFollowers,
  onFollowing,
}) => {
  const styles = useThemedStyles(createStyles);
  const colors = useAppColors();
  const { isDark, toggleTheme } = useThemeMode();
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

  const { data: followData, refetch: refetchFollow } = useQuery(GET_FOLLOW_STATS, {
    variables: { userId: user?.id },
    skip: !user?.id,
    fetchPolicy: 'cache-and-network',
  });

  const { data: momentsData, refetch: refetchMoments } = useQuery(GET_USER_MOMENTS, {
    variables: { userId: user?.id, page: 1, limit: 30 },
    skip: !user?.id,
    fetchPolicy: 'cache-and-network',
  });

  const followStats = followData?.followStats;
  const moments: MomentGridItem[] = momentsData?.userMoments?.items ?? [];
  const momentsTotal = momentsData?.userMoments?.total ?? 0;

  const [refreshing, setRefreshing] = useState(false);
  const [roleSwitcherVisible, setRoleSwitcherVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<ProfileTab>('grid');

  const [switchActiveRole] = useMutation(SWITCH_ACTIVE_ROLE, {
    refetchQueries: [{ query: GET_ME }],
  });

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    const refetches = [refetchMe(), refetchPods()];
    if (user?.id) {
      refetches.push(refetchFollow(), refetchMoments());
    }
    await Promise.all(refetches);
    setRefreshing(false);
  }, [refetchMe, refetchPods, refetchFollow, refetchMoments, user?.id]);

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
        {/* ── Instagram-style header: Avatar + Stats row ── */}
        <View style={styles.profileHeader}>
          <View style={styles.headerRow}>
            <View style={styles.avatarSection}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  if (user?.roles?.length > 1) setRoleSwitcherVisible(true);
                }}
              >
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
              </TouchableOpacity>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{momentsTotal}</Text>
                <Text style={styles.statLabel}>Posts</Text>
              </View>
              <TouchableOpacity
                style={styles.statItem}
                onPress={() => user?.id && onFollowers?.(user.id, user.name || 'User')}
              >
                <Text style={styles.statValue}>{followStats?.followersCount ?? 0}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.statItem}
                onPress={() => user?.id && onFollowing?.(user.id, user.name || 'User')}
              >
                <Text style={styles.statValue}>{followStats?.followingCount ?? 0}</Text>
                <Text style={styles.statLabel}>Following</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ── Name, username, bio ── */}
        <View style={styles.nameSection}>
          <Text style={styles.userName}>{user?.name || 'PartyWings User'}</Text>
          {user?.username ? <Text style={styles.usernameText}>@{user.username}</Text> : null}
          {user?.phone ? <Text style={styles.userPhone}>{user.phone}</Text> : null}
          {user?.isVerifiedHost && (
            <View style={styles.verifiedBadge}>
              <MaterialIcons name="check-circle" size={14} color={colors.success} />
              <Text style={styles.verifiedBadgeText}>Verified Host</Text>
            </View>
          )}
        </View>

        {/* ── Action buttons ── */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.editProfileBtn}
            onPress={() => onNavigate?.('EditProfile')}
          >
            <Text style={styles.editProfileBtnText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.shareProfileBtn}
            onPress={() => {
              if (user?.roles?.length > 1) setRoleSwitcherVisible(true);
            }}
          >
            <MaterialIcons name="swap-horiz" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* ── Tab bar (Grid / Menu) ── */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'grid' && styles.tabActive]}
            onPress={() => setActiveTab('grid')}
          >
            <MaterialIcons
              name="grid-on"
              size={24}
              color={activeTab === 'grid' ? colors.text : colors.textTertiary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'menu' && styles.tabActive]}
            onPress={() => setActiveTab('menu')}
          >
            <MaterialIcons
              name="menu"
              size={24}
              color={activeTab === 'menu' ? colors.text : colors.textTertiary}
            />
          </TouchableOpacity>
        </View>

        {/* ── Grid tab content ── */}
        {activeTab === 'grid' &&
          (moments.length > 0 ? (
            <View style={styles.gridContainer}>
              {moments.map((moment) => {
                const imageUrl = moment.mediaUrls?.[0];
                if (!imageUrl) return null;
                const isVideo = imageUrl.endsWith('.mp4') || imageUrl.endsWith('.mov');
                return (
                  <View key={moment.id} style={styles.gridItem}>
                    <Image source={{ uri: imageUrl }} style={styles.gridItemImage} />
                    {isVideo && (
                      <View style={styles.gridVideoOverlay}>
                        <MaterialIcons name="play-circle-filled" size={20} color="#FFF" />
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.gridEmptyState}>
              <MaterialIcons name="camera-alt" size={48} color={colors.textTertiary} />
              <Text style={styles.gridEmptyText}>No posts yet</Text>
              {onCreateMoment && (
                <TouchableOpacity style={styles.uploadBtn} onPress={onCreateMoment}>
                  <MaterialIcons name="add-a-photo" size={18} color={colors.white} />
                  <Text style={styles.uploadBtnText}>Share your first moment</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}

        {/* ── Menu tab content ── */}
        {activeTab === 'menu' && (
          <>
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

              {/* Dark Mode toggle */}
              <View style={styles.menuItem}>
                <MaterialIcons
                  name={isDark ? 'dark-mode' : 'light-mode'}
                  size={22}
                  color={colors.textSecondary}
                />
                <View style={styles.menuContent}>
                  <Text style={styles.menuLabel}>Dark Mode</Text>
                  <Text style={styles.menuSubtitle}>Toggle app theme</Text>
                </View>
                <Switch
                  value={isDark}
                  onValueChange={toggleTheme}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.white}
                />
              </View>
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
              <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>

            <Text style={styles.version}>PartyWings v1.0.0</Text>
          </>
        )}
      </ScrollView>

      {user?.roles && (
        <RoleSwitcher
          visible={roleSwitcherVisible}
          roles={user.roles}
          activeRole={user.activeRole ?? 'USER'}
          onSwitch={async (role) => {
            setRoleSwitcherVisible(false);
            await switchActiveRole({ variables: { role } });
          }}
          onClose={() => setRoleSwitcherVisible(false)}
        />
      )}
    </SafeAreaView>
  );
};

export default ProfileScreen;
