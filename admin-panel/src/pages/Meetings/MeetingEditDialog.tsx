import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Typography,
} from '@mui/material';
import type { Meeting } from './Meetings.types';
import { formatTimeDisplay } from './Meetings.utils';

interface MeetingEditDialogProps {
  meeting: Meeting | null;
  saving: boolean;
  onClose: () => void;
  onSave: (input: {
    status?: string;
    adminNote?: string;
    meetingLink?: string;
    cancelReason?: string;
  }) => void;
}

const MeetingEditDialog: React.FC<MeetingEditDialogProps> = ({
  meeting,
  saving,
  onClose,
  onSave,
}) => {
  const [status, setStatus] = useState('');
  const [note, setNote] = useState('');
  const [link, setLink] = useState('');
  const [cancelReason, setCancelReason] = useState('');

  React.useEffect(() => {
    if (meeting) {
      setStatus(meeting.status);
      setNote(meeting.adminNote);
      setLink(meeting.meetingLink);
      setCancelReason(meeting.cancelReason);
    }
  }, [meeting]);

  const handleSave = () => {
    onSave({
      status: status || undefined,
      adminNote: note || undefined,
      meetingLink: link || undefined,
      cancelReason: cancelReason || undefined,
    });
  };

  return (
    <Dialog open={Boolean(meeting)} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Update Meeting</DialogTitle>
      {meeting && (
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {meeting.user?.name ?? 'Unknown'} — {meeting.userEmail}
          </Typography>
          <Typography variant="body2">
            {new Date(meeting.meetingDate + 'T00:00:00').toLocaleDateString()} at{' '}
            {formatTimeDisplay(meeting.meetingTime)}
          </Typography>
          <TextField
            select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            fullWidth
            size="small"
          >
            <MenuItem value="PENDING">Pending</MenuItem>
            <MenuItem value="CONFIRMED">Confirmed</MenuItem>
            <MenuItem value="COMPLETED">Completed</MenuItem>
            <MenuItem value="CANCELLED">Cancelled</MenuItem>
          </TextField>
          <TextField
            label="Meeting Link (auto-generated via Google Meet)"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            fullWidth
            size="small"
            placeholder="Auto-generated when confirmed"
            helperText="Leave empty to auto-generate via Google Calendar"
          />
          <TextField
            label="Admin Note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            multiline
            rows={3}
            fullWidth
            size="small"
          />
          {status === 'CANCELLED' && (
            <TextField
              label="Cancel Reason"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              multiline
              rows={2}
              fullWidth
              size="small"
            />
          )}
        </DialogContent>
      )}
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MeetingEditDialog;
