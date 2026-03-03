export interface PodDetailScreenProps {
  podId?: string;
  onBack: () => void;
  onCheckout?: (podId: string) => void;
}

export interface PodAttendee {
  id: string;
  avatar: string;
}
