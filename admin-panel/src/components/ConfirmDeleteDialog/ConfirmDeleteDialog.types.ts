export interface ConfirmDeleteDialogProps {
  open: boolean;
  title: string;
  entityName: string;
  entityType: string;
  loading?: boolean;
  disableConfirm?: boolean;
  children?: React.ReactNode;
  onClose: () => void;
  onConfirm: () => void;
}
