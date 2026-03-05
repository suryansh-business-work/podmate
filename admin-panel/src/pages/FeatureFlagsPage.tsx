import React, { useState, useCallback } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Switch from '@mui/material/Switch';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Slider from '@mui/material/Slider';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Stack from '@mui/material/Stack';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { GET_FEATURE_FLAGS } from '../graphql/queries';
import { CREATE_FEATURE_FLAG, UPDATE_FEATURE_FLAG, DELETE_FEATURE_FLAG, TOGGLE_FEATURE_FLAG } from '../graphql/mutations';

interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  rolloutPercentage: number;
  platform: string;
  createdAt: string;
  updatedAt: string;
}

interface FormState {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  rolloutPercentage: number;
  platform: string;
}

const initialForm: FormState = {
  key: '',
  name: '',
  description: '',
  enabled: false,
  rolloutPercentage: 100,
  platform: 'ALL',
};

const FeatureFlagsPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFlag, setEditingFlag] = useState<FeatureFlag | null>(null);
  const [form, setForm] = useState<FormState>(initialForm);

  const { data, loading, error, refetch } = useQuery(GET_FEATURE_FLAGS, {
    variables: { page: page + 1, limit: rowsPerPage, search: search || undefined },
    fetchPolicy: 'cache-and-network',
  });

  const [createFlag] = useMutation(CREATE_FEATURE_FLAG);
  const [updateFlag] = useMutation(UPDATE_FEATURE_FLAG);
  const [deleteFlag] = useMutation(DELETE_FEATURE_FLAG);
  const [toggleFlag] = useMutation(TOGGLE_FEATURE_FLAG);

  const flags = data?.featureFlags?.items ?? [];
  const total = data?.featureFlags?.total ?? 0;

  const handleOpenCreate = useCallback(() => {
    setEditingFlag(null);
    setForm(initialForm);
    setDialogOpen(true);
  }, []);

  const handleOpenEdit = useCallback((flag: FeatureFlag) => {
    setEditingFlag(flag);
    setForm({
      key: flag.key,
      name: flag.name,
      description: flag.description,
      enabled: flag.enabled,
      rolloutPercentage: flag.rolloutPercentage,
      platform: flag.platform,
    });
    setDialogOpen(true);
  }, []);

  const handleSave = useCallback(async () => {
    if (editingFlag) {
      await updateFlag({
        variables: {
          id: editingFlag.id,
          input: {
            name: form.name,
            description: form.description,
            enabled: form.enabled,
            rolloutPercentage: form.rolloutPercentage,
            platform: form.platform,
          },
        },
      });
    } else {
      await createFlag({ variables: { input: form } });
    }
    setDialogOpen(false);
    refetch();
  }, [editingFlag, form, updateFlag, createFlag, refetch]);

  const handleDelete = useCallback(async (id: string) => {
    await deleteFlag({ variables: { id } });
    refetch();
  }, [deleteFlag, refetch]);

  const handleToggle = useCallback(async (id: string) => {
    await toggleFlag({ variables: { id } });
    refetch();
  }, [toggleFlag, refetch]);

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" href="/dashboard">Dashboard</Link>
        <Typography color="text.primary">Feature Flags</Typography>
      </Breadcrumbs>

      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Feature Flags</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
          Create Flag
        </Button>
      </Stack>

      <Paper sx={{ mb: 2, p: 2 }}>
        <TextField
          size="small"
          placeholder="Search flags..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: '100%', maxWidth: 300 }}
        />
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error.message}</Alert>}

      <TableContainer component={Paper}>
        {loading && !data ? (
          <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>
        ) : flags.length === 0 ? (
          <Box p={4} textAlign="center">
            <Typography color="text.secondary">No feature flags found</Typography>
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Key</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Platform</TableCell>
                <TableCell>Rollout %</TableCell>
                <TableCell>Enabled</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {flags.map((flag: FeatureFlag) => (
                <TableRow key={flag.id}>
                  <TableCell><code>{flag.key}</code></TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>{flag.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{flag.description}</Typography>
                  </TableCell>
                  <TableCell><Chip label={flag.platform} size="small" /></TableCell>
                  <TableCell>
                    <Chip
                      label={`${flag.rolloutPercentage}%`}
                      size="small"
                      color={flag.rolloutPercentage === 100 ? 'success' : 'warning'}
                    />
                  </TableCell>
                  <TableCell>
                    <Switch checked={flag.enabled} onChange={() => handleToggle(flag.id)} />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenEdit(flag)} size="small"><EditIcon /></IconButton>
                    <IconButton onClick={() => handleDelete(flag.id)} size="small" color="error"><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        />
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingFlag ? 'Edit Feature Flag' : 'Create Feature Flag'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Key"
              value={form.key}
              onChange={(e) => setForm({ ...form, key: e.target.value })}
              disabled={!!editingFlag}
              helperText="Lowercase, e.g. dark_mode_enabled"
              fullWidth
            />
            <TextField
              label="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              fullWidth
            />
            <TextField
              label="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              multiline
              rows={2}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Platform</InputLabel>
              <Select
                label="Platform"
                value={form.platform}
                onChange={(e) => setForm({ ...form, platform: e.target.value })}
              >
                <MenuItem value="ALL">All</MenuItem>
                <MenuItem value="APP">App</MenuItem>
                <MenuItem value="ADMIN">Admin</MenuItem>
                <MenuItem value="WEBSITE">Website</MenuItem>
              </Select>
            </FormControl>
            <Box>
              <Typography gutterBottom>Rollout Percentage: {form.rolloutPercentage}%</Typography>
              <Slider
                value={form.rolloutPercentage}
                onChange={(_, v) => setForm({ ...form, rolloutPercentage: v as number })}
                min={0}
                max={100}
                valueLabelDisplay="auto"
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FeatureFlagsPage;
