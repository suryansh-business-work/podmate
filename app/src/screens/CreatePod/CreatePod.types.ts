export type PodTypeOption = 'ONE_TIME' | 'OCCURRENCE';
export type RecurrenceOption = 'DAILY' | 'WEEKLY' | 'MONTHLY';

export interface PodFormValues {
  title: string;
  description: string;
  fee: string;
  maxSeats: number;
  placeId: string;
  location: string;
  locationDetail: string;
  latitude: number;
  longitude: number;
  category: string;
  podType: PodTypeOption;
  recurrence: RecurrenceOption;
}

export interface ApprovedPlace {
  id: string;
  name: string;
  address: string;
  city: string;
}

export const CATEGORIES = ['Social', 'Learning', 'Outdoor'];
