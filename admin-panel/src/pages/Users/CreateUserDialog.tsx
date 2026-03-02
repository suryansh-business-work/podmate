import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useMutation } from '@apollo/client';
import { ADMIN_CREATE_USER } from '../../graphql/mutations';

interface CreateUserDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const CreateUserDialog: React.FC<CreateUserDialogProps> = ({ open, onClose, onCreated }) => {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('USER');
  const [error, setError] = useState('');

  const [adminCreateUser, { loading }] = useMutation(ADMIN_CREATE_USER);

  const handleCreate = async () => {
    setError('');
    if (!phone.trim() || !name.trim()) {
      setError('Phone and name are required');
      return;
    }
    try {
      await adminCreateUser({ variables: { phone: phone.trim(), name: name.trim(), role } });
      setPhone('');
      setName('');
      setRole('USER');
      onClose();
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create User</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField label="Phone" placeholder="+91XXXXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} fullWidth />
        <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
        <FormControl fullWidth>
          <InputLabel>Role</InputLabel>
          <Select value={role} label="Role" onChange={(e) => setRole(e.target.value)}>
            <MenuItem value="USER">User</MenuItem>
            <MenuItem value="PLACE_OWNER">Place Owner</MenuItem>
            <MenuItem value="ADMIN">Admin</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleCreate} disabled={loading}>
          {loading ? <CircularProgress size={20} /> : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateUserDialog;
