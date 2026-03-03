export interface CheckoutScreenProps {
  podId: string;
  onBack: () => void;
  onSuccess: () => void;
}

export interface CheckoutPodData {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  feePerPerson: number;
  maxSeats: number;
  currentSeats: number;
  dateTime: string;
  location: string;
  host: {
    id: string;
    name: string;
    avatar: string;
  };
}

export interface CheckoutResultData {
  checkoutPod: {
    success: boolean;
    pod: {
      id: string;
      currentSeats: number;
      attendees: Array<{ id: string; name: string; avatar: string }>;
    };
    paymentId: string;
    isDummy: boolean;
  };
}
