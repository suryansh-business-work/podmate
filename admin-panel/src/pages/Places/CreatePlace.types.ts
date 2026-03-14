export interface CreatePlaceFormValues {
  name: string;
  description: string;
  category: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  phone: string;
  email: string;
  ownerId: string;
  imageUrl: string;
  mediaUrls: string[];
}

export const PLACE_CATEGORIES = [
  'Restaurant',
  'Cafe',
  'Bar',
  'Park',
  'Event Space',
  'Co-working',
  'Studio',
  'Other',
] as const;

export const CREATE_PLACE_STEPS = ['Venue Details', 'Media', 'Contact & Owner'] as const;
