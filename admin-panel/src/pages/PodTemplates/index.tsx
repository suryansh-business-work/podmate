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
  MenuItem,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useQuery, useMutation, gql } from '@apollo/client';
import { GET_ACTIVE_CATEGORIES } from '../../graphql/queries';
import AdminMediaUploader from '../../components/AdminMediaUploader';
import type { MediaItem } from '../../components/AdminMediaUploader';
import ConfirmDeleteDialog from '../../components/ConfirmDeleteDialog';

/* ── GraphQL ── */

const GET_POD_TEMPLATES = gql`
  query GetPodTemplates($page: Int, $limit: Int, $search: String) {
    podTemplates(page: $page, limit: $limit, search: $search) {
      items {
        id
        name
        description
        category
        imageUrl
        defaultTitle
        defaultDescription
        defaultFee
        defaultMaxSeats
        isActive
        createdAt
      }
      total
      page
      limit
      totalPages
    }
  }
`;

const CREATE_POD_TEMPLATE = gql`
  mutation CreatePodTemplate($input: CreatePodTemplateInput!) {
    createPodTemplate(input: $input) {
      id
    }
  }
`;

const UPDATE_POD_TEMPLATE = gql`
  mutation UpdatePodTemplate($id: ID!, $input: UpdatePodTemplateInput!) {
    updatePodTemplate(id: $id, input: $input) {
      id
    }
  }
`;

const DELETE_POD_TEMPLATE = gql`
  mutation DeletePodTemplate($id: ID!) {
    deletePodTemplate(id: $id)
  }
`;

/* ── Types ── */

interface PodTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  imageUrl: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultFee: number;
  defaultMaxSeats: number;
  isActive: boolean;
}

interface CategoryOption {
  id: string;
  name: string;
}

interface FormState {
  name: string;
  description: string;
  category: string;
  imageUrl: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultFee: string;
  defaultMaxSeats: string;
  isActive: boolean;
}

const emptyForm: FormState = {
  name: '',
  description: '',
  category: '',
  imageUrl: '',
  defaultTitle: '',
  defaultDescription: '',
  defaultFee: '0',
  defaultMaxSeats: '10',
  isActive: true,
};

const STEPPER_LABELS = ['Basic Info', 'Defaults & Media', 'Review'];

/* ── Component ── */

const PodTemplatesPage: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [activeStep, setActiveStep] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<PodTemplate | null>(null);

  const { data, loading, error, refetch } = useQuery(GET_POD_TEMPLATES, {
    variables: { page: 1, limit: 100 },
    fetchPolicy: 'cache-and-network',
  });

  const { data: catData } = useQuery(GET_ACTIVE_CATEGORIES);
  const categories: CategoryOption[] = catData?.activeCategories ?? [];

  const [createTemplate, { loading: creating }] = useMutation(CREATE_POD_TEMPLATE, {
    onCompleted: () => {
      handleClose();
      refetch();
    },
  });
  const [updateTemplate, { loading: updating }] = useMutation(UPDATE_POD_TEMPLATE, {
    onCompleted: () => {
      handleClose();
      refetch();
    },
  });
  const [deleteTemplate, { loading: deleting }] = useMutation(DELETE_POD_TEMPLATE, {
    onCompleted: () => {
      setDeleteTarget(null);
      refetch();
    },
  });

  const items: PodTemplate[] = data?.podTemplates?.items ?? [];

  const handleClose = () => {
    setDialogOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setMediaItems([]);
    setActiveStep(0);
  };

  const handleOpen = (template?: PodTemplate) => {
    if (template) {
      setEditingId(template.id);
      setForm({
        name: template.name,
        description: template.description,
        category: template.category,
        imageUrl: template.imageUrl,
        defaultTitle: template.defaultTitle,
        defaultDescription: template.defaultDescription,
        defaultFee: String(template.defaultFee),
        defaultMaxSeats: String(template.defaultMaxSeats),
        isActive: template.isActive,
      });
      setMediaItems(template.imageUrl ? [{ url: template.imageUrl, type: 'image' }] : []);
    } else {
      setEditingId(null);
      setForm(emptyForm);
      setMediaItems([]);
    }
    setActiveStep(0);
    setDialogOpen(true);
  };

  const handleMediaChange = (items: MediaItem[]) => {
    setMediaItems(items);
    setForm((p) => ({ ...p, imageUrl: items[0]?.url ?? '' }));
  };

  const handleSave = async () => {
    const input = {
      name: form.name,
      description: form.description,
      category: form.category,
      imageUrl: mediaItems[0]?.url || undefined,
      defaultTitle: form.defaultTitle || undefined,
      defaultDescription: form.defaultDescription || undefined,
      defaultFee: parseFloat(form.defaultFee) || 0,
      defaultMaxSeats: parseInt(form.defaultMaxSeats, 10) || 10,
      isActive: form.isActive,
    };
    if (editingId) {
      await updateTemplate({ variables: { id: editingId, input } });
    } else {
      await createTemplate({ variables: { input } });
    }
  };

  const canNext = () => {
    if (activeStep === 0) return Boolean(form.name && form.category);
    return true;
  };

  return (
    <Box>
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" href="/dashboard">
          Dashboard
        </Link>
        <Typography color="text.primary">Pod Templates</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Pod Templates
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Templates pre-fill pod creation forms for hosts
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
          Add Template
        </Button>
      </Box>

      {loading && !data && <CircularProgress />}
      {error && <Alert severity="error">{error.message}</Alert>}

      <PodTemplateTable
        items={items}
        onEdit={handleOpen}
        onDelete={(t) => setDeleteTarget(t)}
      />

      {/* Stepper Dialog */}
      <Dialog open={dialogOpen} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Template' : 'New Template'}</DialogTitle>
        <DialogContent>
          <Stepper activeStep={activeStep} sx={{ mt: 1, mb: 3 }}>
            {STEPPER_LABELS.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {activeStep === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Template Name"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                required
                fullWidth
                helperText="A short name for this template (e.g. Rooftop Social)"
              />
              <TextField
                label="Description"
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                multiline
                rows={2}
                fullWidth
                helperText="Briefly describe what kind of pod this template creates"
              />
              <TextField
                label="Category"
                select
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                fullWidth
                required
                helperText="Select a category managed under Categories"
              >
                {categories.map((c) => (
                  <MenuItem key={c.id} value={c.name}>
                    {c.name}
                  </MenuItem>
                ))}
              </TextField>
              <FormControlLabel
                control={
                  <Switch
                    checked={form.isActive}
                    onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
                  />
                }
                label="Active (visible to hosts)"
              />
            </Box>
          )}

          {activeStep === 1 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Default Title"
                value={form.defaultTitle}
                onChange={(e) => setForm((p) => ({ ...p, defaultTitle: e.target.value }))}
                fullWidth
                helperText="Pre-filled title when host picks this template"
              />
              <TextField
                label="Default Description"
                value={form.defaultDescription}
                onChange={(e) => setForm((p) => ({ ...p, defaultDescription: e.target.value }))}
                multiline
                rows={3}
                fullWidth
                helperText="Pre-filled description for the pod"
              />
              <TextField
                label="Default Fee (₹)"
                type="number"
                value={form.defaultFee}
                onChange={(e) => setForm((p) => ({ ...p, defaultFee: e.target.value }))}
                fullWidth
                helperText="Suggested entry fee in INR"
              />
              <TextField
                label="Default Max Seats"
                type="number"
                value={form.defaultMaxSeats}
                onChange={(e) => setForm((p) => ({ ...p, defaultMaxSeats: e.target.value }))}
                fullWidth
                helperText="Maximum number of attendees"
              />
              <AdminMediaUploader
                mediaItems={mediaItems}
                onMediaChange={handleMediaChange}
                folder="/pod-templates"
                maxItems={1}
                label="Template Cover Image"
              />
            </Box>
          )}

          {activeStep === 2 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Review before {editingId ? 'updating' : 'creating'}
              </Typography>
              <Typography variant="body2">
                <strong>Name:</strong> {form.name}
              </Typography>
              <Typography variant="body2">
                <strong>Category:</strong> {form.category}
              </Typography>
              <Typography variant="body2">
                <strong>Description:</strong> {form.description || '—'}
              </Typography>
              <Typography variant="body2">
                <strong>Default Title:</strong> {form.defaultTitle || '—'}
              </Typography>
              <Typography variant="body2">
                <strong>Default Fee:</strong> ₹{form.defaultFee}
              </Typography>
              <Typography variant="body2">
                <strong>Max Seats:</strong> {form.defaultMaxSeats}
              </Typography>
              <Typography variant="body2">
                <strong>Active:</strong> {form.isActive ? 'Yes' : 'No'}
              </Typography>
              {mediaItems[0] && (
                <Box
                  component="img"
                  src={mediaItems[0].url}
                  sx={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 1, mt: 1 }}
                />
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          {activeStep > 0 && (
            <Button onClick={() => setActiveStep((s) => s - 1)}>Back</Button>
          )}
          {activeStep < STEPPER_LABELS.length - 1 ? (
            <Button
              variant="contained"
              onClick={() => setActiveStep((s) => s + 1)}
              disabled={!canNext()}
            >
              Next
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={creating || updating || !form.name || !form.category}
            >
              {creating || updating ? (
                <CircularProgress size={20} />
              ) : editingId ? (
                'Update'
              ) : (
                'Create'
              )}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        title="Delete Template"
        entityName={deleteTarget?.name ?? ''}
        entityType="pod template"
        loading={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deleteTemplate({ variables: { id: deleteTarget.id } });
        }}
      />
    </Box>
  );
};

export default PodTemplatesPage;

/* ── Sub-components ── */

interface TableProps {
  items: PodTemplate[];
  onEdit: (t: PodTemplate) => void;
  onDelete: (t: PodTemplate) => void;
}

const PodTemplateTable: React.FC<TableProps> = ({ items, onEdit, onDelete }) => (
  <TableContainer component={Paper}>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Name</TableCell>
          <TableCell>Category</TableCell>
          <TableCell>Default Fee</TableCell>
          <TableCell>Max Seats</TableCell>
          <TableCell>Status</TableCell>
          <TableCell align="right">Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {items.length === 0 && (
          <TableRow>
            <TableCell colSpan={6} align="center">
              No templates found
            </TableCell>
          </TableRow>
        )}
        {items.map((t) => (
          <TableRow key={t.id}>
            <TableCell>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {t.imageUrl && (
                  <Box
                    component="img"
                    src={t.imageUrl}
                    sx={{ width: 40, height: 28, borderRadius: 0.5, objectFit: 'cover' }}
                  />
                )}
                {t.name}
              </Box>
            </TableCell>
            <TableCell>
              <Chip label={t.category} size="small" variant="outlined" />
            </TableCell>
            <TableCell>₹{t.defaultFee}</TableCell>
            <TableCell>{t.defaultMaxSeats}</TableCell>
            <TableCell>
              <Chip
                label={t.isActive ? 'Active' : 'Inactive'}
                color={t.isActive ? 'success' : 'default'}
                size="small"
              />
            </TableCell>
            <TableCell align="right">
              <IconButton size="small" onClick={() => onEdit(t)}>
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" color="error" onClick={() => onDelete(t)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);
