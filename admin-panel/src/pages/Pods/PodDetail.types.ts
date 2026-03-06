export interface AdminUpdatePodInput {
  title?: string;
  description?: string;
  category?: string;
  imageUrl?: string;
  mediaUrls?: string[];
  feePerPerson?: number;
  maxSeats?: number;
  dateTime?: string;
  location?: string;
  locationDetail?: string;
  latitude?: number;
  longitude?: number;
  status?: string;
  closeReason?: string;
  refundPolicy?: string;
}

export interface PodDetailData {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  mediaUrls: string[];
  feePerPerson: number;
  maxSeats: number;
  currentSeats: number;
  dateTime: string;
  location: string;
  locationDetail: string;
  latitude: number;
  longitude: number;
  placeId: string;
  rating: number;
  reviewCount: number;
  status: string;
  closeReason: string;
  viewCount: number;
  refundPolicy: string;
  createdAt: string;
  host: { id: string; name: string; avatar: string; isVerifiedHost: boolean };
  attendees: { id: string; name: string; avatar: string }[];
  place: { id: string; name: string } | null;
}

export const POD_STATUS_OPTIONS = [
  'NEW',
  'CONFIRMED',
  'PENDING',
  'COMPLETED',
  'CANCELLED',
  'OPEN',
  'CLOSED',
] as const;

export const POD_CATEGORIES = [
  'Music',
  'Sports',
  'Gaming',
  'Food & Drink',
  'Arts & Crafts',
  'Outdoor',
  'Fitness',
  'Learning',
  'Networking',
  'Party',
  'Other',
] as const;
