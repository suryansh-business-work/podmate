import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  Avatar,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import { RemoveAttendeeDialogProps } from './RemoveAttendeeDialog.types';

const RemoveAttendeeDialog: React.FC<RemoveAttendeeDialogProps> = ({
  open,
  attendee,
  podTitle,
  feePerPerson,
  loading,
  onClose,
  onConfirm,
}) => {
  const [issueRefund, setIssueRefund] = useState(true);

  useEffect(() => {
    if (!open) setIssueRefund(true);
  }, [open]);

  if (!attendee) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <PersonRemoveIcon color="warning" />
        Remove Attendee
      </DialogTitle>
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          This will remove the attendee from &quot;{podTitle}&quot;.
        </Alert>

        <Box display="flex" alignItems="center" gap={1.5} mb={2}>
          <Avatar src={attendee.avatar} sx={{ width: 40, height: 40 }}>
            {attendee.name?.[0]}
          </Avatar>
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>
              {attendee.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ID: {attendee.id}
            </Typography>
          </Box>
        </Box>

        <FormControlLabel
          control={
            <Checkbox
              checked={issueRefund}
              onChange={(e) => setIssueRefund(e.target.checked)}
            />
          }
          label={
            <Typography variant="body2">
              Issue refund of ₹{feePerPerson.toLocaleString()}
            </Typography>
          }
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="warning"
          onClick={() => onConfirm(issueRefund)}
          disabled={loading}
        >
          {loading ? 'Removing…' : 'Remove Attendee'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RemoveAttendeeDialog;
