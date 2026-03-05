export interface ReviewUser {
  id: string;
  name: string;
  avatar: string;
}

export interface ReviewReply {
  id: string;
  comment: string;
  createdAt: string;
  user: ReviewUser;
}

export interface Review {
  id: string;
  targetType: 'POD' | 'PLACE';
  targetId: string;
  rating: number;
  comment: string;
  parentId: string;
  isReported: boolean;
  createdAt: string;
  user: ReviewUser;
  replies: ReviewReply[];
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  distribution: number[];
}

export interface ReviewsScreenProps {
  targetType: 'POD' | 'PLACE';
  targetId: string;
  targetTitle: string;
  onBack: () => void;
}
