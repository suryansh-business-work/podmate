import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation } from '@apollo/client';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import { GET_FOLLOWERS, GET_FOLLOWING } from '../../graphql/queries';
import { FOLLOW_USER, UNFOLLOW_USER } from '../../graphql/mutations';
import type { FollowListScreenProps, Follow, FollowTab, FollowUser } from './FollowList.types';
import { createStyles } from './FollowList.styles';
import { useThemedStyles, useAppColors } from '../../hooks/useThemedStyles';

const FollowListScreen: React.FC<FollowListScreenProps> = ({
  userId, userName, initialTab = 'followers', onBack, onUserPress,
}) => {
  const styles = useThemedStyles(createStyles);
  const colors = useAppColors();
  const [activeTab, setActiveTab] = useState<FollowTab>(initialTab);

  const { data: followersData, loading: loadingFollowers, refetch: refetchFollowers } = useQuery<{
    followers: { items: Follow[]; total: number };
  }>(GET_FOLLOWERS, {
    variables: { userId, page: 1, limit: 100 },
    fetchPolicy: 'cache-and-network',
    skip: activeTab !== 'followers',
  });

  const { data: followingData, loading: loadingFollowing, refetch: refetchFollowing } = useQuery<{
    following: { items: Follow[]; total: number };
  }>(GET_FOLLOWING, {
    variables: { userId, page: 1, limit: 100 },
    fetchPolicy: 'cache-and-network',
    skip: activeTab !== 'following',
  });

  const [followUser] = useMutation(FOLLOW_USER);
  const [unfollowUser] = useMutation(UNFOLLOW_USER);

  const followers = followersData?.followers?.items ?? [];
  const following = followingData?.following?.items ?? [];
  const loading = activeTab === 'followers' ? loadingFollowers : loadingFollowing;

  const currentList = activeTab === 'followers' ? followers : following;

  const getUserFromFollow = (item: Follow): FollowUser =>
    activeTab === 'followers' ? item.follower : item.following;

  const handleFollowToggle = useCallback(async (targetUserId: string, isCurrentlyFollowing: boolean) => {
    try {
      if (isCurrentlyFollowing) {
        await unfollowUser({ variables: { userId: targetUserId } });
      } else {
        await followUser({ variables: { userId: targetUserId } });
      }
      refetchFollowers();
      refetchFollowing();
    } catch {
      // silently ignore
    }
  }, [followUser, unfollowUser, refetchFollowers, refetchFollowing]);

  const renderItem = useCallback(({ item }: { item: Follow }) => {
    const user = getUserFromFollow(item);
    return (
      <TouchableOpacity
        style={styles.userRow}
        onPress={() => onUserPress?.(user.id)}
        activeOpacity={0.7}
      >
        {user.avatar ? (
          <Image source={{ uri: user.avatar }} style={styles.userAvatar} />
        ) : (
          <View style={styles.userAvatarPlaceholder}>
            <MaterialIcons name="person" size={24} color={colors.white} />
          </View>
        )}
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userDate}>
            Since {new Date(Number(item.createdAt)).toLocaleDateString()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }, [activeTab, onUserPress]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{userName}</Text>
      </View>

      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'followers' && styles.tabActive]}
          onPress={() => setActiveTab('followers')}
        >
          <Text style={[styles.tabText, activeTab === 'followers' && styles.tabTextActive]}>
            Followers ({followersData?.followers?.total ?? 0})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'following' && styles.tabActive]}
          onPress={() => setActiveTab('following')}
        >
          <Text style={[styles.tabText, activeTab === 'following' && styles.tabTextActive]}>
            Following ({followingData?.following?.total ?? 0})
          </Text>
        </TouchableOpacity>
      </View>

      {loading && currentList.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={currentList}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={styles.content}
          ListEmptyComponent={
            <View style={styles.centered}>
              <MaterialIcons name="people-outline" size={48} color={colors.textTertiary} />
              <Text style={styles.emptyText}>
                {activeTab === 'followers' ? 'No followers yet' : 'Not following anyone'}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

export default FollowListScreen;
