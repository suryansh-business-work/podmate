import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControlLabel,
  Checkbox,
  TextField,
  MenuItem,
  Typography,
} from '@mui/material';
import { NotifyConfirmState, NOTIFICATION_METHODS } from './Policies.types';

interface NotifyConfirmDialogProps {
  state: NotifyConfirmState;
  loading: boolean;
  onChange: (updates: Partial<NotifyConfirmState>) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

const NotifyConfirmDialog: React.FC<NotifyConfirmDialogProps> = ({
  state,
  loading,
  onChange,
  onConfirm,
  onCancel,
}) => (
  <Dialog open={state.open} onClose={onCancel} maxWidth="xs" fullWidth>
    <DialogTitle>Policy Updated</DialogTitle>
    <DialogContent>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        &quot;{state.policyTitle}&quot; has been updated successfully. Would you like to notify
        users about this change?
      </Typography>

      <FormControlLabel
        control={
          <Checkbox
            checked={state.notifyUsers}
            onChange={(e) => onChange({ notifyUsers: e.target.checked })}
          />
        }
        label="Notify all active users"
      />

      {state.notifyUsers && (
        <TextField
          select
          fullWidth
          label="Notification Method"
          value={state.notificationMethod}
          onChange={(e) => onChange({ notificationMethod: e.target.value })}
          sx={{ mt: 2 }}
          size="small"
        >
          {NOTIFICATION_METHODS.map((method) => (
            <MenuItem key={method.value} value={method.value}>
              {method.label}
            </MenuItem>
          ))}
        </TextField>
      )}
    </DialogContent>
    <DialogActions>
      <Button onClick={onCancel} disabled={loading}>
        Skip
      </Button>
      <Button variant="contained" onClick={onConfirm} disabled={loading || !state.notifyUsers}>
        {loading ? 'Sending…' : 'Notify Users'}
      </Button>
    </DialogActions>
  </Dialog>
);

export default NotifyConfirmDialog;
