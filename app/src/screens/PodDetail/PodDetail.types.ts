export interface PodDetailScreenProps {
  podId?: string;
  onBack: () => void;
  onCheckout?: (podId: string) => void;
  onReviews?: (targetType: 'POD' | 'PLACE', targetId: string, targetTitle: string) => void;
  onGoLive?: (podId: string) => void;
  onUserProfile?: (userId: string) => void;
}

export interface PodAttendee {
  id: string;
  avatar: string;
}
