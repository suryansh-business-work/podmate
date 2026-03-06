import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation } from '@apollo/client';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import { GET_USER_PROFILE, GET_USER_PODS, GET_FOLLOW_STATS } from '../../graphql/queries';
import { FOLLOW_USER, UNFOLLOW_USER } from '../../graphql/mutations';
import type { UserProfileScreenProps, UserProfileUser, UserProfilePod } from './UserProfile.types';
import type { FollowStats } from '../FollowList/FollowList.types';
import { createStyles } from './UserProfile.styles';
import { useThemedStyles, useAppColors } from '../../hooks/useThemedStyles';

const UserProfileScreen: React.FC<UserProfileScreenProps> = ({
  userId,
  onBack,
  onPodPress,
  onFollowers,
  onFollowing,
}) => {
  const styles = useThemedStyles(createStyles);
  const colors = useAppColors();
  const { data: userData, loading: loadingUser } = useQuery<{ userProfile: UserProfileUser }>(
    GET_USER_PROFILE,
    { variables: { userId } },
  );

  const { data: podsData } = useQuery<{ userPods: UserProfilePod[] }>(GET_USER_PODS, {
    variables: { userId },
  });

  const { data: followData, refetch: refetchFollow } = useQuery<{ followStats: FollowStats }>(
    GET_FOLLOW_STATS,
    { variables: { userId } },
  );

  const [followUser] = useMutation(FOLLOW_USER);
  const [unfollowUser] = useMutation(UNFOLLOW_USER);

  const user = userData?.userProfile;
  const pods = podsData?.userPods ?? [];
  const stats = followData?.followStats;
  const isFollowing = stats?.isFollowing ?? false;

  const handleFollowToggle = useCallback(async () => {
    try {
      if (isFollowing) {
        await unfollowUser({ variables: { userId } });
      } else {
        await followUser({ variables: { userId } });
      }
      refetchFollow();
    } catch {
      // silently ignore
    }
  }, [isFollowing, userId, followUser, unfollowUser, refetchFollow]);

  if (loadingUser) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack}>
            <MaterialIcons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{user?.name ?? 'Profile'}</Text>
      </View>

      <ScrollView>
        <View style={styles.profileHeader}>
          {user?.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <MaterialIcons name="person" size={40} color={colors.white} />
            </View>
          )}
          <Text style={styles.userName}>{user?.name}</Text>

          {stats && (
            <View style={styles.statsRow}>
              <TouchableOpacity
                style={styles.statItem}
                onPress={() => onFollowers?.(userId, user?.name ?? '')}
              >
                <Text style={styles.statCount}>{stats.followersCount}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.statItem}
                onPress={() => onFollowing?.(userId, user?.name ?? '')}
              >
                <Text style={styles.statCount}>{stats.followingCount}</Text>
                <Text style={styles.statLabel}>Following</Text>
              </TouchableOpacity>
              <View style={styles.statItem}>
                <Text style={styles.statCount}>{pods.length}</Text>
                <Text style={styles.statLabel}>Pods</Text>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={isFollowing ? styles.followingBtn : styles.followBtn}
            onPress={handleFollowToggle}
          >
            <Text style={isFollowing ? styles.followingBtnText : styles.followBtnText}>
              {isFollowing ? 'Following' : 'Follow'}
            </Text>
          </TouchableOpacity>
        </View>

        {pods.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Pods</Text>
            <FlatList
              horizontal
              data={pods}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.podsList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.podCard}
                  onPress={() => onPodPress?.(item.id)}
                  activeOpacity={0.8}
                >
                  {item.mediaUrls?.[0] ? (
                    <Image source={{ uri: item.mediaUrls[0] }} style={styles.podImage} />
                  ) : (
                    <View style={styles.podImagePlaceholder}>
                      <MaterialIcons name="celebration" size={32} color={colors.textTertiary} />
                    </View>
                  )}
                  <View style={styles.podBody}>
                    <Text style={styles.podTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.podDesc} numberOfLines={1}>
                      {item.description}
                    </Text>
                    {item.rating > 0 && (
                      <View style={styles.podRating}>
                        <MaterialIcons name="star" size={14} color={colors.warning} />
                        <Text style={styles.podRatingText}>
                          {item.rating.toFixed(1)} ({item.reviewCount})
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              )}
            />
          </>
        )}

        {pods.length === 0 && <Text style={styles.emptyText}>No pods yet</Text>}
      </ScrollView>
    </SafeAreaView>
  );
};

export default UserProfileScreen;
