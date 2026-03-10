export interface CreatePodFormValues {
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  mediaUrls: string[];
  feePerPerson: number;
  maxSeats: number;
  dateTime: string;
  location: string;
  locationDetail: string;
}

export const POD_CATEGORIES = ['Social', 'Learning', 'Outdoor'];

export const CREATE_POD_STEPS = ['Basic Info', 'Media', 'Logistics'];
