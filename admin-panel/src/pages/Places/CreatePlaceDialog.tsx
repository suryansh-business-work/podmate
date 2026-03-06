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
  Box,
} from '@mui/material';
import { useMutation } from '@apollo/client';
import { ADMIN_CREATE_PLACE } from '../../graphql/mutations';

interface CreatePlaceDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const INITIAL = {
  name: '',
  description: '',
  address: '',
  city: '',
  category: 'Restaurant',
  phone: '',
  email: '',
  ownerId: '',
};

const CreatePlaceDialog: React.FC<CreatePlaceDialogProps> = ({ open, onClose, onCreated }) => {
  const [form, setForm] = useState(INITIAL);
  const [error, setError] = useState('');
  const [adminCreatePlace, { loading }] = useMutation(ADMIN_CREATE_PLACE);

  const handleCreate = async () => {
    setError('');
    if (!form.name.trim() || !form.address.trim() || !form.city.trim()) {
      setError('Name, address, and city are required');
      return;
    }
    try {
      await adminCreatePlace({
        variables: {
          input: {
            name: form.name.trim(),
            description: form.description.trim() || 'No description provided',
            address: form.address.trim(),
            city: form.city.trim(),
            category: form.category,
            phone: form.phone.trim(),
            email: form.email.trim(),
          },
          ownerId: form.ownerId.trim() || 'admin-1',
        },
      });
      setForm(INITIAL);
      onClose();
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create place');
    }
  };

  const update = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create Place</DialogTitle>
      <DialogContent
        sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}
      >
        {error && <Alert severity="error">{error}</Alert>}
        <TextField
          label="Name"
          value={form.name}
          onChange={(e) => update('name', e.target.value)}
          fullWidth
        />
        <TextField
          label="Description"
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          multiline
          rows={3}
          fullWidth
        />
        <Box display="flex" gap={2}>
          <TextField
            label="Address"
            value={form.address}
            onChange={(e) => update('address', e.target.value)}
            fullWidth
          />
          <TextField
            label="City"
            value={form.city}
            onChange={(e) => update('city', e.target.value)}
            fullWidth
          />
        </Box>
        <FormControl fullWidth>
          <InputLabel>Category</InputLabel>
          <Select
            value={form.category}
            label="Category"
            onChange={(e) => update('category', e.target.value)}
          >
            <MenuItem value="Restaurant">Restaurant</MenuItem>
            <MenuItem value="Cafe">Cafe</MenuItem>
            <MenuItem value="Bar">Bar</MenuItem>
            <MenuItem value="Park">Park</MenuItem>
            <MenuItem value="Event Space">Event Space</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </Select>
        </FormControl>
        <Box display="flex" gap={2}>
          <TextField
            label="Phone"
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
            fullWidth
          />
          <TextField
            label="Email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            fullWidth
          />
        </Box>
        <TextField
          label="Owner ID (optional, defaults to admin)"
          value={form.ownerId}
          onChange={(e) => update('ownerId', e.target.value)}
          fullWidth
        />
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

export default CreatePlaceDialog;
