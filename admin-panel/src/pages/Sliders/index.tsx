import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
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
  MenuItem,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useQuery, useMutation, gql } from '@apollo/client';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import AdminMediaUploader from '../../components/AdminMediaUploader';
import type { MediaItem } from '../../components/AdminMediaUploader';
import ConfirmDeleteDialog from '../../components/ConfirmDeleteDialog';

const MAX_SLIDERS = 8;

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

const GET_ACTIVE_CITIES = gql`
  query GetActiveCities {
    activeCities {
      id
      name
    }
  }
`;

const CREATE_SLIDER = gql`
  mutation CreateSlider($input: CreateSliderInput!) {
    createSlider(input: $input) {
      id
    }
  }
`;

const UPDATE_SLIDER = gql`
  mutation UpdateSlider($id: ID!, $input: UpdateSliderInput!) {
    updateSlider(id: $id, input: $input) {
      id
    }
  }
`;

const DELETE_SLIDER = gql`
  mutation DeleteSlider($id: ID!) {
    deleteSlider(id: $id)
  }
`;

const REORDER_SLIDERS = gql`
  mutation ReorderSliders($orderedIds: [ID!]!) {
    reorderSliders(orderedIds: $orderedIds)
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

interface CityOption {
  id: string;
  name: string;
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
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<SliderItem | null>(null);

  const { data, loading, error, refetch } = useQuery(GET_SLIDERS, {
    variables: { page: 1, limit: 50 },
  });

  const { data: citiesData } = useQuery<{ activeCities: CityOption[] }>(GET_ACTIVE_CITIES);
  const cityOptions: CityOption[] = citiesData?.activeCities ?? [];

  const [createSlider, { loading: creating }] = useMutation(CREATE_SLIDER, {
    onCompleted: () => {
      setDialogOpen(false);
      setForm(defaultForm);
      setMediaItems([]);
      refetch();
    },
  });

  const [updateSlider, { loading: updating }] = useMutation(UPDATE_SLIDER, {
    onCompleted: () => {
      setDialogOpen(false);
      setForm(defaultForm);
      setMediaItems([]);
      setEditingId(null);
      refetch();
    },
  });

  const [deleteSlider, { loading: deleting }] = useMutation(DELETE_SLIDER, {
    onCompleted: () => {
      setDeleteTarget(null);
      refetch();
    },
  });

  const [reorderSliders] = useMutation(REORDER_SLIDERS, {
    onCompleted: () => refetch(),
  });

  const sliders: SliderItem[] = data?.sliders?.items ?? [];
  const canAdd = sliders.length < MAX_SLIDERS;

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm(defaultForm);
    setMediaItems([]);
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
    setMediaItems(slider.imageUrl ? [{ url: slider.imageUrl, type: 'image' }] : []);
    setDialogOpen(true);
  };

  const handleMediaChange = (items: MediaItem[]) => {
    setMediaItems(items);
    setForm({ ...form, imageUrl: items[0]?.url ?? '' });
  };

  const handleSave = () => {
    const input = { ...form, imageUrl: mediaItems[0]?.url ?? '' };
    if (editingId) {
      updateSlider({ variables: { id: editingId, input } });
    } else {
      createSlider({ variables: { input } });
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || result.source.index === result.destination.index) return;
    const reordered = Array.from(sliders);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    reorderSliders({
      variables: { orderedIds: reordered.map((s) => s.id) },
      optimisticResponse: { reorderSliders: true },
    });
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
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Home Sliders
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage promotional banners (max {MAX_SLIDERS}) — {sliders.length}/{MAX_SLIDERS} used.
            Drag to reorder.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
          disabled={!canAdd}
        >
          Add Slider
        </Button>
      </Box>

      {!canAdd && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Maximum {MAX_SLIDERS} sliders reached. Delete an existing slider to add a new one.
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error.message}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : sliders.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">
            No sliders yet. Create one to get started.
          </Typography>
        </Paper>
      ) : (
        <Paper variant="outlined">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="sliders-list">
              {(provided) => (
                <List ref={provided.innerRef} {...provided.droppableProps} disablePadding>
                  {sliders.map((slider, idx) => (
                    <Draggable key={slider.id} draggableId={slider.id} index={idx}>
                      {(dragProvided, snapshot) => (
                        <>
                          <ListItem
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            sx={{
                              bgcolor: snapshot.isDragging ? 'action.hover' : 'background.paper',
                              borderLeft: snapshot.isDragging ? 4 : 0,
                              borderColor: 'primary.main',
                            }}
                            secondaryAction={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Chip
                                  label={slider.locationCity || 'All'}
                                  size="small"
                                  variant="outlined"
                                />
                                <Chip
                                  label={slider.isActive ? 'Active' : 'Inactive'}
                                  color={slider.isActive ? 'success' : 'default'}
                                  size="small"
                                />
                                <IconButton size="small" onClick={() => handleOpenEdit(slider)}>
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => setDeleteTarget(slider)}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            }
                          >
                            <Box
                              {...dragProvided.dragHandleProps}
                              sx={{ display: 'flex', alignItems: 'center', mr: 1, cursor: 'grab' }}
                            >
                              <DragIndicatorIcon color="action" />
                            </Box>
                            <ListItemAvatar>
                              <Avatar
                                variant="rounded"
                                src={slider.imageUrl}
                                sx={{ width: 80, height: 45 }}
                              />
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Typography variant="body1" fontWeight={600}>
                                  {slider.title}
                                </Typography>
                              }
                              secondary={
                                <Typography variant="body2" color="text.secondary" noWrap>
                                  {slider.subtitle || 'No subtitle'}{' '}
                                  {slider.ctaText ? `· ${slider.ctaText}` : ''}
                                </Typography>
                              }
                              sx={{ ml: 1 }}
                            />
                          </ListItem>
                          {idx < sliders.length - 1 && <Divider />}
                        </>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </List>
              )}
            </Droppable>
          </DragDropContext>
        </Paper>
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
              helperText="Main heading displayed on the banner"
            />
            <TextField
              label="Subtitle"
              value={form.subtitle}
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              fullWidth
              helperText="Secondary text below the title"
            />
            <AdminMediaUploader
              mediaItems={mediaItems}
              onMediaChange={handleMediaChange}
              folder="/sliders"
              maxItems={1}
              label="Slider Image"
            />
            <TextField
              label="CTA Text"
              value={form.ctaText}
              onChange={(e) => setForm({ ...form, ctaText: e.target.value })}
              fullWidth
              helperText="Button text (e.g. Explore Now, Book Now)"
            />
            <TextField
              label="CTA Link"
              value={form.ctaLink}
              onChange={(e) => setForm({ ...form, ctaLink: e.target.value })}
              fullWidth
              helperText="Deep link target (e.g. partywings://explore)"
            />
            <TextField
              label="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              fullWidth
              helperText="Optional category tag for this slider"
            />
            <TextField
              select
              label="Location City"
              value={form.locationCity}
              onChange={(e) => setForm({ ...form, locationCity: e.target.value })}
              fullWidth
              helperText="Select a city or 'All Locations' to show everywhere"
            >
              <MenuItem value="">All Locations</MenuItem>
              {cityOptions.map((city) => (
                <MenuItem key={city.id} value={city.name}>
                  {city.name}
                </MenuItem>
              ))}
            </TextField>
            <FormControlLabel
              control={
                <Switch
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                />
              }
              label="Active (visible to users)"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={creating || updating || !form.title}
          >
            {creating || updating ? (
              <CircularProgress size={20} />
            ) : editingId ? (
              'Update'
            ) : (
              'Create'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        title="Delete Slider"
        entityName={deleteTarget?.title ?? ''}
        entityType="slider"
        loading={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deleteSlider({ variables: { id: deleteTarget.id } });
        }}
      />
    </Box>
  );
};

export default SlidersPage;
