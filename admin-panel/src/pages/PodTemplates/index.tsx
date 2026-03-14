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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useQuery, useMutation, gql } from '@apollo/client';

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
        defaultRefundPolicy
        isActive
        sortOrder
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
  defaultRefundPolicy: string;
  isActive: boolean;
  sortOrder: number;
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
  defaultRefundPolicy: string;
  isActive: boolean;
  sortOrder: string;
}

const CATEGORIES = ['Social', 'Learning', 'Outdoor'];

const emptyForm: FormState = {
  name: '',
  description: '',
  category: 'Social',
  imageUrl: '',
  defaultTitle: '',
  defaultDescription: '',
  defaultFee: '0',
  defaultMaxSeats: '10',
  defaultRefundPolicy: '',
  isActive: true,
  sortOrder: '0',
};

/* ── Component ── */

const PodTemplatesPage: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const { data, loading, error, refetch } = useQuery(GET_POD_TEMPLATES, {
    variables: { page: 1, limit: 100 },
    fetchPolicy: 'cache-and-network',
  });

  const [createTemplate] = useMutation(CREATE_POD_TEMPLATE, { onCompleted: () => refetch() });
  const [updateTemplate] = useMutation(UPDATE_POD_TEMPLATE, { onCompleted: () => refetch() });
  const [deleteTemplate] = useMutation(DELETE_POD_TEMPLATE, { onCompleted: () => refetch() });

  const items: PodTemplate[] = data?.podTemplates?.items ?? [];

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
        defaultRefundPolicy: template.defaultRefundPolicy,
        isActive: template.isActive,
        sortOrder: String(template.sortOrder),
      });
    } else {
      setEditingId(null);
      setForm(emptyForm);
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const input = {
      name: form.name,
      description: form.description,
      category: form.category,
      imageUrl: form.imageUrl || undefined,
      defaultTitle: form.defaultTitle || undefined,
      defaultDescription: form.defaultDescription || undefined,
      defaultFee: parseFloat(form.defaultFee) || 0,
      defaultMaxSeats: parseInt(form.defaultMaxSeats, 10) || 10,
      defaultRefundPolicy: form.defaultRefundPolicy || undefined,
      isActive: form.isActive,
      sortOrder: parseInt(form.sortOrder, 10) || 0,
    };
    if (editingId) {
      await updateTemplate({ variables: { id: editingId, input } });
    } else {
      await createTemplate({ variables: { input } });
    }
    setDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this template?')) return;
    await deleteTemplate({ variables: { id } });
  };

  return (
    <Box>
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" href="/dashboard">
          Dashboard
        </Link>
        <Typography color="text.primary">Pod Templates</Typography>
      </Breadcrumbs>
      <Typography variant="h4" gutterBottom>
        Pod Templates
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
          Add Template
        </Button>
      </Box>

      {loading && !data && <CircularProgress />}
      {error && <Alert severity="error">{error.message}</Alert>}

      <PodTemplateTable items={items} onEdit={handleOpen} onDelete={handleDelete} />

      {/* Dialog */}
      <PodTemplateDialog
        open={dialogOpen}
        editingId={editingId}
        form={form}
        setForm={setForm}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
      />
    </Box>
  );
};

export default PodTemplatesPage;

/* ── Sub-components ── */

interface TableProps {
  items: PodTemplate[];
  onEdit: (t: PodTemplate) => void;
  onDelete: (id: string) => void;
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
          <TableCell>Order</TableCell>
          <TableCell align="right">Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {items.length === 0 && (
          <TableRow>
            <TableCell colSpan={7} align="center">
              No templates found
            </TableCell>
          </TableRow>
        )}
        {items.map((t) => (
          <TableRow key={t.id}>
            <TableCell>{t.name}</TableCell>
            <TableCell>{t.category}</TableCell>
            <TableCell>₹{t.defaultFee}</TableCell>
            <TableCell>{t.defaultMaxSeats}</TableCell>
            <TableCell>
              <Chip
                label={t.isActive ? 'Active' : 'Inactive'}
                color={t.isActive ? 'success' : 'default'}
                size="small"
              />
            </TableCell>
            <TableCell>{t.sortOrder}</TableCell>
            <TableCell align="right">
              <IconButton size="small" onClick={() => onEdit(t)}>
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" color="error" onClick={() => onDelete(t.id)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

/* ── Dialog ── */

interface DialogProps {
  open: boolean;
  editingId: string | null;
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  onClose: () => void;
  onSave: () => void;
}

const PodTemplateDialog: React.FC<DialogProps> = ({
  open,
  editingId,
  form,
  setForm,
  onClose,
  onSave,
}) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle>{editingId ? 'Edit Template' : 'New Template'}</DialogTitle>
    <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
      <TextField
        label="Template Name"
        value={form.name}
        onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
        required
        fullWidth
      />
      <TextField
        label="Description"
        value={form.description}
        onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
        multiline
        rows={2}
        fullWidth
      />
      <TextField
        label="Category"
        select
        value={form.category}
        onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
        fullWidth
      >
        {CATEGORIES.map((c) => (
          <MenuItem key={c} value={c}>
            {c}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        label="Image URL"
        value={form.imageUrl}
        onChange={(e) => setForm((p) => ({ ...p, imageUrl: e.target.value }))}
        fullWidth
      />
      <TextField
        label="Default Title"
        value={form.defaultTitle}
        onChange={(e) => setForm((p) => ({ ...p, defaultTitle: e.target.value }))}
        fullWidth
      />
      <TextField
        label="Default Description"
        value={form.defaultDescription}
        onChange={(e) => setForm((p) => ({ ...p, defaultDescription: e.target.value }))}
        multiline
        rows={3}
        fullWidth
      />
      <TextField
        label="Default Fee (₹)"
        type="number"
        value={form.defaultFee}
        onChange={(e) => setForm((p) => ({ ...p, defaultFee: e.target.value }))}
        fullWidth
      />
      <TextField
        label="Default Max Seats"
        type="number"
        value={form.defaultMaxSeats}
        onChange={(e) => setForm((p) => ({ ...p, defaultMaxSeats: e.target.value }))}
        fullWidth
      />
      <TextField
        label="Default Refund Policy"
        value={form.defaultRefundPolicy}
        onChange={(e) => setForm((p) => ({ ...p, defaultRefundPolicy: e.target.value }))}
        fullWidth
      />
      <TextField
        label="Sort Order"
        type="number"
        value={form.sortOrder}
        onChange={(e) => setForm((p) => ({ ...p, sortOrder: e.target.value }))}
        fullWidth
      />
      {editingId && (
        <FormControlLabel
          control={
            <Switch
              checked={form.isActive}
              onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
            />
          }
          label="Active"
        />
      )}
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cancel</Button>
      <Button variant="contained" onClick={onSave} disabled={!form.name || !form.category}>
        {editingId ? 'Update' : 'Create'}
      </Button>
    </DialogActions>
  </Dialog>
);
