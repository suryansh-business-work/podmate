export interface PodItem {
  id: string;
  title: string;
  imageUrl: string;
  feePerPerson: number;
  maxSeats: number;
  currentSeats: number;
  dateTime: string;
  rating: number;
  status: string;
  category: string;
  host: {
    id: string;
    name: string;
    avatar: string;
    isVerifiedHost: boolean;
  };
  attendees?: { id: string }[];
}

export interface PodsQueryData {
  pods: {
    items: PodItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface HomeScreenProps {
  onPodPress: (id: string) => void;
  onMenuPress: () => void;
}

export const CATEGORIES = ['All', 'Social', 'Learning', 'Outdoor'];
