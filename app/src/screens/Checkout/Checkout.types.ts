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
  podType: 'ONE_TIME' | 'OCCURRENCE';
  recurrence: '' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
  occurrenceCount: number;
  startDate: string;
  endDate: string;
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

export interface CheckoutOccurrenceResultData {
  checkoutOccurrencePod: {
    success: boolean;
    pod: {
      id: string;
      currentSeats: number;
      attendees: Array<{ id: string; name: string; avatar: string }>;
    };
    subscription: {
      id: string;
      status: string;
      billingCycle: string;
      amountPerCycle: number;
      totalPaid: number;
      cyclesCompleted: number;
      totalCycles: number;
      nextBillingDate: string;
    };
    paymentId: string;
    isDummy: boolean;
  };
}

export interface SubscriptionForPodData {
  subscriptionForPod: {
    id: string;
    status: string;
    billingCycle: string;
    amountPerCycle: number;
    totalPaid: number;
    cyclesCompleted: number;
    totalCycles: number;
    nextBillingDate: string;
    startDate: string;
    endDate: string;
    cancelledAt: string;
  } | null;
}
