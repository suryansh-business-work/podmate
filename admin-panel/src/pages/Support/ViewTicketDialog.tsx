import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, Chip, Card, Button,
} from '@mui/material';
import { SupportTicket, STATUS_COLORS, PRIORITY_COLORS } from './Support.types';

interface ViewTicketDialogProps {
  ticket: SupportTicket | null;
  onClose: () => void;
  onReply: (ticket: SupportTicket) => void;
}

const ViewTicketDialog: React.FC<ViewTicketDialogProps> = ({ ticket, onClose, onReply }) => (
  <Dialog open={Boolean(ticket)} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle>Ticket Details</DialogTitle>
    <DialogContent>
      {ticket && (
        <Box>
          <Typography variant="subtitle2" color="text.secondary">Subject</Typography>
          <Typography variant="body1" fontWeight={600} mb={2}>{ticket.subject}</Typography>
          <Typography variant="subtitle2" color="text.secondary">From</Typography>
          <Typography variant="body2" mb={2}>{ticket.user?.name ?? 'Unknown'} ({ticket.user?.phone ?? ''})</Typography>
          <Typography variant="subtitle2" color="text.secondary">Message</Typography>
          <Typography variant="body2" mb={2} sx={{ whiteSpace: 'pre-wrap' }}>{ticket.message}</Typography>
          {ticket.adminReply && (
            <>
              <Typography variant="subtitle2" color="text.secondary">Admin Reply</Typography>
              <Card variant="outlined" sx={{ p: 2, bgcolor: 'primary.main', color: '#fff', mb: 2 }}>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{ticket.adminReply}</Typography>
              </Card>
            </>
          )}
          <Box display="flex" gap={1} mt={1}>
            <Chip label={ticket.status.replace('_', ' ')} color={STATUS_COLORS[ticket.status] ?? 'default'} size="small" />
            <Chip
              label={ticket.priority} size="small"
              sx={{ bgcolor: `${PRIORITY_COLORS[ticket.priority] ?? '#999'}20`, color: PRIORITY_COLORS[ticket.priority] ?? '#999', fontWeight: 600 }}
            />
          </Box>
        </Box>
      )}
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Close</Button>
      <Button variant="contained" onClick={() => { if (ticket) onReply(ticket); onClose(); }}>Reply</Button>
    </DialogActions>
  </Dialog>
);

export default ViewTicketDialog;
