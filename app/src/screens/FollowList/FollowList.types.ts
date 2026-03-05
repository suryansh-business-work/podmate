export interface FollowUser {
  id: string;
  name: string;
  avatar: string;
}

export interface Follow {
  id: string;
  follower: FollowUser;
  following: FollowUser;
  createdAt: string;
}

export interface FollowStats {
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
}

export type FollowTab = 'followers' | 'following';

export interface FollowListScreenProps {
  userId: string;
  userName: string;
  initialTab?: FollowTab;
  onBack: () => void;
  onUserPress?: (userId: string) => void;
}
