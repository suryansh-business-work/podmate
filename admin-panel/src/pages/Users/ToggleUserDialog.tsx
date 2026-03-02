import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useMutation } from '@apollo/client';
import { TOGGLE_USER_ACTIVE } from '../../graphql/mutations';

interface ToggleUserDialogProps {
  open: boolean;
  onClose: () => void;
  onToggled: () => void;
  userId: string;
  userName: string;
  currentActive: boolean;
}

const ToggleUserDialog: React.FC<ToggleUserDialogProps> = ({
  open,
  onClose,
  onToggled,
  userId,
  userName,
  currentActive,
}) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const [toggleUserActive, { loading }] = useMutation(TOGGLE_USER_ACTIVE);

  const handleToggle = async () => {
    setError('');
    if (currentActive && !reason.trim()) {
      setError('Please provide a reason for disabling the user');
      return;
    }
    try {
      await toggleUserActive({
        variables: { userId, isActive: !currentActive, reason: reason.trim() || undefined },
      });
      setReason('');
      onClose();
      onToggled();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle user');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{currentActive ? 'Disable User' : 'Enable User'}</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
        {error && <Alert severity="error">{error}</Alert>}
        <Typography>
          {currentActive
            ? `Are you sure you want to disable "${userName}"? The user will be notified via SMS.`
            : `Re-enable "${userName}"? The user will be notified via SMS.`}
        </Typography>
        {currentActive && (
          <TextField
            label="Reason for disabling"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            multiline
            rows={2}
            fullWidth
            required
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          color={currentActive ? 'error' : 'success'}
          onClick={handleToggle}
          disabled={loading}
        >
          {loading ? <CircularProgress size={20} /> : currentActive ? 'Disable' : 'Enable'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ToggleUserDialog;
