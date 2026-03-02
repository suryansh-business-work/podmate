import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useQuery, useMutation } from '@apollo/client';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { GET_POLICIES } from '../graphql/queries';
import { CREATE_POLICY, UPDATE_POLICY, DELETE_POLICY } from '../graphql/mutations';

interface Policy {
  id: string;
  type: string;
  title: string;
  content: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const policySchema = Yup.object({
  type: Yup.string().oneOf(['VENUE', 'USER', 'HOST']).required('Type is required'),
  title: Yup.string().min(3, 'Minimum 3 characters').required('Title is required'),
  content: Yup.string().min(10, 'Minimum 10 characters').required('Content is required'),
});

const POLICY_COLORS: Record<string, string> = {
  VENUE: '#f97316',
  USER: '#5b4cdb',
  HOST: '#10b981',
};

const PoliciesPage: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null);

  const { data, loading, refetch } = useQuery<{ policies: Policy[] }>(GET_POLICIES, {
    fetchPolicy: 'cache-and-network',
  });

  const [createPolicy, { loading: creating }] = useMutation(CREATE_POLICY);
  const [updatePolicy, { loading: updating }] = useMutation(UPDATE_POLICY);
  const [deletePolicy] = useMutation(DELETE_POLICY);

  const formik = useFormik({
    initialValues: { type: 'VENUE', title: '', content: '' },
    validationSchema: policySchema,
    enableReinitialize: true,
    onSubmit: async (values, { resetForm }) => {
      try {
        if (editingPolicy) {
          await updatePolicy({
            variables: {
              id: editingPolicy.id,
              input: { title: values.title, content: values.content },
            },
          });
        } else {
          await createPolicy({ variables: { input: values } });
        }
        await refetch();
        resetForm();
        setDialogOpen(false);
        setEditingPolicy(null);
      } catch {
        /* error handled by Apollo */
      }
    },
  });

  const handleEdit = (policy: Policy) => {
    setEditingPolicy(policy);
    formik.setValues({ type: policy.type, title: policy.title, content: policy.content });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePolicy({ variables: { id } });
      await refetch();
    } catch {
      /* error handled by Apollo */
    }
  };

  const handleOpenNew = () => {
    setEditingPolicy(null);
    formik.resetForm();
    setDialogOpen(true);
  };

  const policies = data?.policies ?? [];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>
          Policies
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenNew}>
          Add Policy
        </Button>
      </Box>

      {loading && !data && (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      )}

      {!loading && policies.length === 0 && (
        <Alert severity="info">No policies found. Create your first policy.</Alert>
      )}

      {policies.map((policy) => (
        <Card key={policy.id} sx={{ mb: 2 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
              <Box flex={1}>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Typography variant="h6" fontWeight={600}>
                    {policy.title}
                  </Typography>
                  <Chip
                    label={policy.type}
                    size="small"
                    sx={{
                      bgcolor: `${POLICY_COLORS[policy.type] ?? '#999'}20`,
                      color: POLICY_COLORS[policy.type] ?? '#999',
                      fontWeight: 600,
                    }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                  {policy.content}
                </Typography>
                <Typography variant="caption" color="text.disabled" mt={1} display="block">
                  Updated: {new Date(policy.updatedAt).toLocaleDateString()}
                </Typography>
              </Box>
              <Box>
                <IconButton size="small" onClick={() => handleEdit(policy)}>
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" color="error" onClick={() => handleDelete(policy.id)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </CardContent>
        </Card>
      ))}

      {/* Create/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>{editingPolicy ? 'Edit Policy' : 'Create Policy'}</DialogTitle>
          <DialogContent>
            <TextField
              select
              fullWidth
              label="Policy Type"
              name="type"
              value={formik.values.type}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.type && Boolean(formik.errors.type)}
              helperText={formik.touched.type && formik.errors.type}
              sx={{ mt: 1, mb: 2 }}
              disabled={Boolean(editingPolicy)}
            >
              <MenuItem value="VENUE">Venue</MenuItem>
              <MenuItem value="USER">User</MenuItem>
              <MenuItem value="HOST">Host</MenuItem>
            </TextField>
            <TextField
              fullWidth
              label="Title"
              name="title"
              value={formik.values.title}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.title && Boolean(formik.errors.title)}
              helperText={formik.touched.title && formik.errors.title}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              multiline
              rows={6}
              label="Content"
              name="content"
              value={formik.values.content}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.content && Boolean(formik.errors.content)}
              helperText={formik.touched.content && formik.errors.content}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={creating || updating || !formik.isValid || !formik.dirty}
            >
              {creating || updating ? <CircularProgress size={20} /> : editingPolicy ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default PoliciesPage;
