import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Button, CircularProgress, Stack, Alert,
} from '@mui/material';
import { useQuery, useMutation } from '@apollo/client';
import { GET_USERS } from '../../graphql/queries';
import { ADMIN_CREATE_SUPPORT_TICKET } from '../../graphql/mutations';

interface CreateTicketDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

interface UserItem {
  id: string;
  name: string;
  phone: string;
}

interface UsersData {
  users: { items: UserItem[] };
}

const CreateTicketDialog: React.FC<CreateTicketDialogProps> = ({ open, onClose, onCreated }) => {
  const [userId, setUserId] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [error, setError] = useState('');

  const { data: usersData } = useQuery<UsersData>(GET_USERS, {
    variables: { page: 1, limit: 100 },
    skip: !open,
  });

  const [createTicket, { loading }] = useMutation(ADMIN_CREATE_SUPPORT_TICKET);

  const handleSubmit = async () => {
    if (!userId || !subject.trim() || !message.trim()) {
      setError('Please fill in all required fields');
      return;
    }
    setError('');
    try {
      await createTicket({
        variables: { userId, subject: subject.trim(), message: message.trim(), priority },
      });
      onCreated();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create ticket');
    }
  };

  const handleClose = () => {
    setUserId('');
    setSubject('');
    setMessage('');
    setPriority('MEDIUM');
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create Support Ticket</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            select
            fullWidth
            label="User *"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          >
            {(usersData?.users.items ?? []).map((u) => (
              <MenuItem key={u.id} value={u.id}>
                {u.name || 'Unnamed'} — {u.phone}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="Subject *"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Message *"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <TextField
            select
            fullWidth
            label="Priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <MenuItem value="LOW">Low</MenuItem>
            <MenuItem value="MEDIUM">Medium</MenuItem>
            <MenuItem value="HIGH">High</MenuItem>
          </TextField>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          {loading ? <CircularProgress size={20} /> : 'Create Ticket'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateTicketDialog;
