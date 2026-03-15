export interface VenueMomentsScreenProps {
  onBack: () => void;
}

export interface MomentItem {
  id: string;
  caption: string;
  mediaUrls: string[];
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatar: string;
    username: string;
  };
}
