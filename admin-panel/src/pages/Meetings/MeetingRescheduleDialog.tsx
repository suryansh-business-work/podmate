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
import ScheduleIcon from '@mui/icons-material/Schedule';
import type { Meeting } from './Meetings.types';
import { formatTimeDisplay, MEETING_TIME_SLOTS } from './Meetings.utils';

interface MeetingRescheduleDialogProps {
  meeting: Meeting | null;
  saving: boolean;
  onClose: () => void;
  onSave: (meetingDate: string, meetingTime: string) => void;
}

const MeetingRescheduleDialog: React.FC<MeetingRescheduleDialogProps> = ({
  meeting,
  saving,
  onClose,
  onSave,
}) => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  React.useEffect(() => {
    if (meeting) {
      setDate(meeting.meetingDate);
      setTime(meeting.meetingTime);
    }
  }, [meeting]);

  return (
    <Dialog open={Boolean(meeting)} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ScheduleIcon /> Reschedule Meeting
      </DialogTitle>
      {meeting && (
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {meeting.user?.name ?? 'Unknown'} — {meeting.userEmail}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Current: {new Date(meeting.meetingDate + 'T00:00:00').toLocaleDateString()} at{' '}
            {formatTimeDisplay(meeting.meetingTime)}
          </Typography>
          <TextField
            label="New Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            fullWidth
            size="small"
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            select
            label="New Time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            fullWidth
            size="small"
          >
            {MEETING_TIME_SLOTS.map((slot) => (
              <MenuItem key={slot} value={slot}>
                {formatTimeDisplay(slot)}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
      )}
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={() => onSave(date, time)} disabled={saving}>
          {saving ? 'Rescheduling…' : 'Reschedule'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MeetingRescheduleDialog;
