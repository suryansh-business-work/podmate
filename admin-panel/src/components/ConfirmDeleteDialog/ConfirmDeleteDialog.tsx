import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { ConfirmDeleteDialogProps } from './ConfirmDeleteDialog.types';

const ConfirmDeleteDialog: React.FC<ConfirmDeleteDialogProps> = ({
  open,
  title,
  entityName,
  entityType,
  loading = false,
  disableConfirm = false,
  children,
  onClose,
  onConfirm,
}) => {
  const [inputValue, setInputValue] = useState('');
  const isMatch = inputValue.trim().toLowerCase() === entityName.trim().toLowerCase();

  useEffect(() => {
    if (!open) {
      setInputValue('');
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <WarningAmberIcon color="error" />
        {title}
      </DialogTitle>
      <DialogContent>
        <Alert severity="error" sx={{ mb: 2 }}>
          This action is permanent and cannot be undone. All associated data will be deleted.
        </Alert>
        {children}
        <Typography variant="body2" sx={{ mb: 2 }}>
          To confirm deletion of this {entityType}, please type{' '}
          <Box component="span" sx={{ fontWeight: 700, color: 'error.main' }}>
            {entityName}
          </Box>{' '}
          below:
        </Typography>
        <TextField
          fullWidth
          size="small"
          placeholder={`Type "${entityName}" to confirm`}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          autoFocus
          error={inputValue.length > 0 && !isMatch}
          helperText={inputValue.length > 0 && !isMatch ? 'Name does not match' : ''}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={onConfirm}
          disabled={!isMatch || loading || disableConfirm}
        >
          {loading ? 'Deleting…' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDeleteDialog;
