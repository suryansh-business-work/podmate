import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Chip,
} from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import type { Meeting, MeetingPurpose } from './Meetings.types';
import { MEETING_STATUS_COLORS, PURPOSE_LABELS, PURPOSE_COLORS } from './Meetings.types';
import { formatTimeDisplay } from './Meetings.utils';

interface MeetingViewDialogProps {
  meeting: Meeting | null;
  onClose: () => void;
  onEdit: (meeting: Meeting) => void;
}

const MeetingViewDialog: React.FC<MeetingViewDialogProps> = ({ meeting, onClose, onEdit }) => (
  <Dialog open={Boolean(meeting)} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <VideocamIcon /> Meeting Details
    </DialogTitle>
    {meeting && (
      <DialogContent dividers>
        <Typography variant="subtitle2" color="text.secondary">
          User
        </Typography>
        <Typography mb={2}>
          {meeting.user?.name ?? 'Unknown'} ({meeting.userEmail})
        </Typography>
        <Typography variant="subtitle2" color="text.secondary">
          Date & Time
        </Typography>
        <Typography mb={2}>
          {new Date(meeting.meetingDate + 'T00:00:00').toLocaleDateString()} at{' '}
          {formatTimeDisplay(meeting.meetingTime)}
        </Typography>
        <Typography variant="subtitle2" color="text.secondary">
          Status
        </Typography>
        <Chip
          label={meeting.status}
          color={MEETING_STATUS_COLORS[meeting.status] ?? 'default'}
          size="small"
          sx={{ mb: 2 }}
        />
        <Typography variant="subtitle2" color="text.secondary">
          Purpose
        </Typography>
        <Chip
          label={PURPOSE_LABELS[meeting.purpose as MeetingPurpose] ?? meeting.purpose}
          color={PURPOSE_COLORS[meeting.purpose as MeetingPurpose] ?? 'default'}
          size="small"
          sx={{ mb: 2 }}
        />
        {meeting.meetingLink && (
          <>
            <Typography variant="subtitle2" color="text.secondary">
              Meeting Link (Google Meet)
            </Typography>
            <Typography mb={2} sx={{ wordBreak: 'break-all' }}>
              {meeting.meetingLink}
            </Typography>
          </>
        )}
        {meeting.rescheduledFrom && (
          <>
            <Typography variant="subtitle2" color="text.secondary">
              Rescheduled From
            </Typography>
            <Typography mb={1}>{meeting.rescheduledFrom}</Typography>
            <Typography variant="caption" color="text.secondary" mb={2} display="block">
              Rescheduled by: {meeting.rescheduledBy}
            </Typography>
          </>
        )}
        {meeting.adminNote && (
          <>
            <Typography variant="subtitle2" color="text.secondary">
              Admin Note
            </Typography>
            <Typography mb={2}>{meeting.adminNote}</Typography>
          </>
        )}
        {meeting.cancelReason && (
          <>
            <Typography variant="subtitle2" color="text.secondary">
              Cancel Reason
            </Typography>
            <Typography mb={2}>{meeting.cancelReason}</Typography>
          </>
        )}
        <Typography variant="caption" color="text.secondary">
          Requested: {new Date(meeting.createdAt).toLocaleString()}
        </Typography>
      </DialogContent>
    )}
    <DialogActions>
      <Button
        onClick={() => {
          if (meeting) onEdit(meeting);
          onClose();
        }}
      >
        Edit
      </Button>
      <Button onClick={onClose}>Close</Button>
    </DialogActions>
  </Dialog>
);

export default MeetingViewDialog;
