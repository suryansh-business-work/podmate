import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useQuery, useMutation, gql } from '@apollo/client';

const GET_SLIDERS = gql`
  query GetSliders($page: Int, $limit: Int, $search: String) {
    sliders(page: $page, limit: $limit, search: $search) {
      items {
        id
        title
        subtitle
        imageUrl
        ctaText
        ctaLink
        category
        locationCity
        sortOrder
        isActive
        createdAt
        updatedAt
      }
      total
      page
      limit
      totalPages
    }
  }
`;

const CREATE_SLIDER = gql`
  mutation CreateSlider($input: CreateSliderInput!) {
    createSlider(input: $input) {
      id
      title
      subtitle
      imageUrl
      ctaText
      ctaLink
      category
      locationCity
      sortOrder
      isActive
    }
  }
`;

const UPDATE_SLIDER = gql`
  mutation UpdateSlider($id: ID!, $input: UpdateSliderInput!) {
    updateSlider(id: $id, input: $input) {
      id
      title
      subtitle
      imageUrl
      ctaText
      ctaLink
      category
      locationCity
      sortOrder
      isActive
    }
  }
`;

const DELETE_SLIDER = gql`
  mutation DeleteSlider($id: ID!) {
    deleteSlider(id: $id)
  }
`;

interface SliderFormData {
  title: string;
  subtitle: string;
  imageUrl: string;
  ctaText: string;
  ctaLink: string;
  category: string;
  locationCity: string;
  sortOrder: number;
  isActive: boolean;
}

interface SliderItem {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  ctaText: string;
  ctaLink: string;
  category: string;
  locationCity: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

const defaultForm: SliderFormData = {
  title: '',
  subtitle: '',
  imageUrl: '',
  ctaText: '',
  ctaLink: '',
  category: '',
  locationCity: '',
  sortOrder: 0,
  isActive: true,
};

const SlidersPage: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<SliderFormData>(defaultForm);

  const { data, loading, error, refetch } = useQuery(GET_SLIDERS, {
    variables: { page: 1, limit: 50 },
  });

  const [createSlider, { loading: creating }] = useMutation(CREATE_SLIDER, {
    onCompleted: () => {
      setDialogOpen(false);
      setForm(defaultForm);
      refetch();
    },
  });

  const [updateSlider, { loading: updating }] = useMutation(UPDATE_SLIDER, {
    onCompleted: () => {
      setDialogOpen(false);
      setForm(defaultForm);
      setEditingId(null);
      refetch();
    },
  });

  const [deleteSlider] = useMutation(DELETE_SLIDER, {
    onCompleted: () => refetch(),
  });

  const sliders: SliderItem[] = data?.sliders?.items ?? [];

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm(defaultForm);
    setDialogOpen(true);
  };

  const handleOpenEdit = (slider: SliderItem) => {
    setEditingId(slider.id);
    setForm({
      title: slider.title,
      subtitle: slider.subtitle,
      imageUrl: slider.imageUrl,
      ctaText: slider.ctaText,
      ctaLink: slider.ctaLink,
      category: slider.category,
      locationCity: slider.locationCity,
      sortOrder: slider.sortOrder,
      isActive: slider.isActive,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (editingId) {
      updateSlider({ variables: { id: editingId, input: form } });
    } else {
      createSlider({ variables: { input: form } });
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this slider?')) {
      deleteSlider({ variables: { id } });
    }
  };

  return (
    <Box>
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" href="/dashboard">
          Dashboard
        </Link>
        <Typography color="text.primary">Sliders</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          Home Sliders
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
          Add Slider
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error.message}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Image</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Subtitle</TableCell>
                <TableCell>CTA</TableCell>
                <TableCell>City</TableCell>
                <TableCell>Order</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sliders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No sliders yet. Create one to get started.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                sliders.map((slider) => (
                  <TableRow key={slider.id}>
                    <TableCell>
                      <Box
                        component="img"
                        src={slider.imageUrl}
                        sx={{ width: 80, height: 45, borderRadius: 1, objectFit: 'cover' }}
                      />
                    </TableCell>
                    <TableCell>{slider.title}</TableCell>
                    <TableCell>{slider.subtitle || '—'}</TableCell>
                    <TableCell>{slider.ctaText || '—'}</TableCell>
                    <TableCell>{slider.locationCity || 'All'}</TableCell>
                    <TableCell>{slider.sortOrder}</TableCell>
                    <TableCell>
                      <Chip
                        label={slider.isActive ? 'Active' : 'Inactive'}
                        color={slider.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => handleOpenEdit(slider)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(slider.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Slider' : 'Add Slider'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Subtitle"
              value={form.subtitle}
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              fullWidth
            />
            <TextField
              label="Image URL"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="CTA Text"
              value={form.ctaText}
              onChange={(e) => setForm({ ...form, ctaText: e.target.value })}
              fullWidth
              placeholder="e.g. Explore Now"
            />
            <TextField
              label="CTA Link"
              value={form.ctaLink}
              onChange={(e) => setForm({ ...form, ctaLink: e.target.value })}
              fullWidth
              placeholder="e.g. partywings://explore"
            />
            <TextField
              label="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              fullWidth
              placeholder="e.g. Social, Learning"
            />
            <TextField
              label="Location City (empty = all cities)"
              value={form.locationCity}
              onChange={(e) => setForm({ ...form, locationCity: e.target.value })}
              fullWidth
              placeholder="e.g. Gurgaon, Delhi"
            />
            <TextField
              label="Sort Order"
              type="number"
              value={form.sortOrder}
              onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value, 10) || 0 })}
              fullWidth
            />
            <FormControlLabel
              control={
                <Switch
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                />
              }
              label="Active"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={creating || updating || !form.title || !form.imageUrl}
          >
            {creating || updating ? <CircularProgress size={20} /> : editingId ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SlidersPage;
