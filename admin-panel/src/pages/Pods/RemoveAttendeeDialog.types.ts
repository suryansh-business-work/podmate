export interface Attendee {
  id: string;
  name: string;
  avatar: string;
}

export interface RemoveAttendeeDialogProps {
  open: boolean;
  attendee: Attendee | null;
  podTitle: string;
  feePerPerson: number;
  loading: boolean;
  onClose: () => void;
  onConfirm: (issueRefund: boolean) => void;
}
