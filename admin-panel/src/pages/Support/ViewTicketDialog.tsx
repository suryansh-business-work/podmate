import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Chip,
  Card,
  Button,
  TextField,
  CircularProgress,
  Divider,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useMutation } from '@apollo/client';
import { REPLY_SUPPORT_TICKET } from '../../graphql/mutations';
import { SupportTicket, STATUS_COLORS, PRIORITY_COLORS } from './Support.types';

interface ViewTicketDialogProps {
  ticket: SupportTicket | null;
  onClose: () => void;
  onReply: (ticket: SupportTicket) => void;
  onRefetch: () => void;
}

const ViewTicketDialog: React.FC<ViewTicketDialogProps> = ({
  ticket,
  onClose,
  onReply,
  onRefetch,
}) => {
  const [replyText, setReplyText] = useState('');
  const [replySupportTicket, { loading: replying }] = useMutation(REPLY_SUPPORT_TICKET);

  const handleSendReply = async () => {
    if (!ticket || !replyText.trim()) return;
    try {
      await replySupportTicket({ variables: { ticketId: ticket.id, content: replyText.trim() } });
      setReplyText('');
      onRefetch();
    } catch {
      /* handled by Apollo */
    }
  };

  const handleClose = () => {
    setReplyText('');
    onClose();
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <Dialog open={Boolean(ticket)} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Ticket Details</DialogTitle>
      <DialogContent>
        {ticket && (
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Subject
            </Typography>
            <Typography variant="body1" fontWeight={600} mb={2}>
              {ticket.subject}
            </Typography>
            <Typography variant="subtitle2" color="text.secondary">
              From
            </Typography>
            <Typography variant="body2" mb={2}>
              {ticket.user?.name ?? 'Unknown'} ({ticket.user?.phone ?? ''})
            </Typography>
            <Typography variant="subtitle2" color="text.secondary">
              Message
            </Typography>
            <Typography variant="body2" mb={2} sx={{ whiteSpace: 'pre-wrap' }}>
              {ticket.message}
            </Typography>

            <Box display="flex" gap={1} mb={2}>
              <Chip
                label={ticket.status.replace('_', ' ')}
                color={STATUS_COLORS[ticket.status] ?? 'default'}
                size="small"
              />
              <Chip
                label={ticket.priority}
                size="small"
                sx={{
                  bgcolor: `${PRIORITY_COLORS[ticket.priority] ?? '#999'}20`,
                  color: PRIORITY_COLORS[ticket.priority] ?? '#999',
                  fontWeight: 600,
                }}
              />
            </Box>

            {ticket.replies && ticket.replies.length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" fontWeight={600} mb={1}>
                  Conversation
                </Typography>
                <Box
                  sx={{
                    maxHeight: 300,
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                  }}
                >
                  {ticket.replies.map((reply) => {
                    const isAdmin = reply.senderRole === 'ADMIN';
                    return (
                      <Card
                        key={reply.id}
                        variant="outlined"
                        sx={{
                          p: 1.5,
                          bgcolor: isAdmin ? 'primary.main' : 'grey.100',
                          color: isAdmin ? '#fff' : 'text.primary',
                          alignSelf: isAdmin ? 'flex-end' : 'flex-start',
                          maxWidth: '85%',
                        }}
                      >
                        <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
                          {isAdmin ? (
                            <AdminPanelSettingsIcon sx={{ fontSize: 14 }} />
                          ) : (
                            <PersonIcon sx={{ fontSize: 14 }} />
                          )}
                          <Typography variant="caption" fontWeight={600}>
                            {reply.sender?.name ?? (isAdmin ? 'Admin' : 'User')}
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                          {reply.content}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ opacity: 0.7, display: 'block', mt: 0.5, textAlign: 'right' }}
                        >
                          {formatDate(reply.createdAt)}
                        </Typography>
                      </Card>
                    );
                  })}
                </Box>
              </>
            )}

            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" fontWeight={600} mb={1}>
              Reply
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Type your reply..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              size="small"
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
        <Button
          variant="outlined"
          onClick={() => {
            if (ticket) onReply(ticket);
            handleClose();
          }}
        >
          Edit Ticket
        </Button>
        <Button
          variant="contained"
          onClick={handleSendReply}
          disabled={replying || !replyText.trim()}
        >
          {replying ? <CircularProgress size={20} /> : 'Send Reply'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewTicketDialog;
