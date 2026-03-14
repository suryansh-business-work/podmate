export interface VenueFormValues {
  name: string;
  category: string;
  description: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  capacity: string;
  latitude?: number;
  longitude?: number;
  placeId?: string;
}

export interface PolicyItem {
  id: string;
  type: string;
  title: string;
  content: string;
  isActive: boolean;
}

export const STEPS = ['Venue Details', 'Documents', 'Policies'];
export const CATEGORIES = ['Bar', 'Club', 'Lounge', 'Restaurant', 'Rooftop', 'Café', 'Pub'];
