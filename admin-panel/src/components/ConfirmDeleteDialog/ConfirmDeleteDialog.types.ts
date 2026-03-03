export interface ConfirmDeleteDialogProps {
  open: boolean;
  title: string;
  entityName: string;
  entityType: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}
