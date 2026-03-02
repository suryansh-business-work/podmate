export interface DeviceContact {
  id: string;
  name: string;
  phone: string;
}

export interface ContactPickerProps {
  podId: string;
  podTitle: string;
  onDone: () => void;
  onSkip: () => void;
}
