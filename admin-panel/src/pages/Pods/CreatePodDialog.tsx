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
import { CREATE_POD } from '../../graphql/mutations';

interface CreatePodDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const INITIAL = {
  title: '',
  description: '',
  category: 'Social',
  feePerPerson: 0,
  maxSeats: 10,
  dateTime: '',
  location: '',
  locationDetail: '',
};

const CreatePodDialog: React.FC<CreatePodDialogProps> = ({ open, onClose, onCreated }) => {
  const [form, setForm] = useState(INITIAL);
  const [error, setError] = useState('');
  const [createPod, { loading }] = useMutation(CREATE_POD);

  const handleCreate = async () => {
    setError('');
    if (!form.title.trim() || !form.location.trim() || !form.dateTime) {
      setError('Title, location and date/time are required');
      return;
    }
    try {
      await createPod({
        variables: {
          input: {
            title: form.title.trim(),
            description: form.description.trim() || 'No description',
            category: form.category,
            feePerPerson: Number(form.feePerPerson),
            maxSeats: Number(form.maxSeats),
            dateTime: new Date(form.dateTime).toISOString(),
            location: form.location.trim(),
            locationDetail: form.locationDetail.trim(),
          },
        },
      });
      setForm(INITIAL);
      onClose();
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create pod');
    }
  };

  const update = (key: string, value: string | number) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create Pod</DialogTitle>
      <DialogContent
        sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}
      >
        {error && <Alert severity="error">{error}</Alert>}
        <TextField
          label="Title"
          value={form.title}
          onChange={(e) => update('title', e.target.value)}
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
        <FormControl fullWidth>
          <InputLabel>Category</InputLabel>
          <Select
            value={form.category}
            label="Category"
            onChange={(e) => update('category', e.target.value)}
          >
            <MenuItem value="Social">Social</MenuItem>
            <MenuItem value="Learning">Learning</MenuItem>
            <MenuItem value="Outdoor">Outdoor</MenuItem>
          </Select>
        </FormControl>
        <Box display="flex" gap={2}>
          <TextField
            label="Fee Per Person (₹)"
            type="number"
            value={form.feePerPerson}
            onChange={(e) => update('feePerPerson', Number(e.target.value))}
            fullWidth
          />
          <TextField
            label="Max Seats"
            type="number"
            value={form.maxSeats}
            onChange={(e) => update('maxSeats', Number(e.target.value))}
            fullWidth
          />
        </Box>
        <TextField
          label="Date & Time"
          type="datetime-local"
          value={form.dateTime}
          onChange={(e) => update('dateTime', e.target.value)}
          fullWidth
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          label="Location"
          value={form.location}
          onChange={(e) => update('location', e.target.value)}
          fullWidth
        />
        <TextField
          label="Location Detail"
          value={form.locationDetail}
          onChange={(e) => update('locationDetail', e.target.value)}
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

export default CreatePodDialog;
