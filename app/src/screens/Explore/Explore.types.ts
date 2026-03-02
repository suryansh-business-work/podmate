export interface Pod {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  feePerPerson: number;
  location: string;
  locationDetail: string;
  maxSeats: number;
  currentSeats: number;
  dateTime: string;
  status: string;
  rating: number;
  reviewCount: number;
  host: { id: string; name: string; avatar: string; isVerifiedHost: boolean };
}

export interface PodNavigationCallback {
  (podId: string): void;
}

export interface ExploreScreenProps {
  onPodPress?: PodNavigationCallback;
}

export const CATEGORIES = ['All', 'Social', 'Learning', 'Outdoor'];

export const formatDate = (d: string): string => {
  const dt = new Date(d);
  return dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const formatTime = (d: string): string => {
  const dt = new Date(d);
  return dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
};
