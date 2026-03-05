export interface UserProfileUser {
  id: string;
  name: string;
  avatar: string;
  phone: string;
}

export interface UserProfilePod {
  id: string;
  title: string;
  description: string;
  mediaUrls: string[];
  rating: number;
  reviewCount: number;
}

export interface UserProfileScreenProps {
  userId: string;
  onBack: () => void;
  onPodPress?: (podId: string) => void;
  onFollowers?: (userId: string, userName: string) => void;
  onFollowing?: (userId: string, userName: string) => void;
}
