export interface BulkActionToolbarProps {
  selectedCount: number;
  entityType: string;
  loading: boolean;
  onDelete: () => void;
  onClearSelection: () => void;
}
