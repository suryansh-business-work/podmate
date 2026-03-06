import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  CircularProgress,
} from '@mui/material';
import { SupportTicket } from './Support.types';

interface EditTicketDialogProps {
  ticket: SupportTicket | null;
  replyText: string;
  newStatus: string;
  newPriority: string;
  updating: boolean;
  onReplyChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
  onSave: () => void;
  onClose: () => void;
}

const EditTicketDialog: React.FC<EditTicketDialogProps> = ({
  ticket,
  replyText,
  newStatus,
  newPriority,
  updating,
  onReplyChange,
  onStatusChange,
  onPriorityChange,
  onSave,
  onClose,
}) => (
  <Dialog open={Boolean(ticket)} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle>Respond to Ticket</DialogTitle>
    <DialogContent>
      {ticket && (
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            {ticket.subject}
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2} sx={{ whiteSpace: 'pre-wrap' }}>
            {ticket.message}
          </Typography>
          <TextField
            select
            fullWidth
            label="Status"
            value={newStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            sx={{ mb: 2, mt: 1 }}
          >
            <MenuItem value="OPEN">Open</MenuItem>
            <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
            <MenuItem value="RESOLVED">Resolved</MenuItem>
            <MenuItem value="CLOSED">Closed</MenuItem>
          </TextField>
          <TextField
            select
            fullWidth
            label="Priority"
            value={newPriority}
            onChange={(e) => onPriorityChange(e.target.value)}
            sx={{ mb: 2 }}
          >
            <MenuItem value="LOW">Low</MenuItem>
            <MenuItem value="MEDIUM">Medium</MenuItem>
            <MenuItem value="HIGH">High</MenuItem>
          </TextField>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Admin Reply"
            value={replyText}
            onChange={(e) => onReplyChange(e.target.value)}
          />
        </Box>
      )}
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cancel</Button>
      <Button variant="contained" onClick={onSave} disabled={updating}>
        {updating ? <CircularProgress size={20} /> : 'Save'}
      </Button>
    </DialogActions>
  </Dialog>
);

export default EditTicketDialog;
