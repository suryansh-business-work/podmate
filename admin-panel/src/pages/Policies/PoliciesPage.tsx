import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useQuery, useMutation } from '@apollo/client';
import { useFormik } from 'formik';
import { GET_POLICIES } from '../../graphql/queries';
import { CREATE_POLICY, UPDATE_POLICY, DELETE_POLICY } from '../../graphql/mutations';
import {
  Policy,
  PolicyFormValues,
  NotifyConfirmState,
  INITIAL_NOTIFY_STATE,
  policySchema,
  POLICY_COLORS,
  POLICY_TYPE_LABELS,
} from './Policies.types';
import PolicyDialog from './PolicyDialog';
import NotifyConfirmDialog from './NotifyConfirmDialog';

const PoliciesPage: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null);
  const [notifyState, setNotifyState] = useState<NotifyConfirmState>(INITIAL_NOTIFY_STATE);

  const { data, loading, error, refetch } = useQuery<{ policies: Policy[] }>(GET_POLICIES, {
    fetchPolicy: 'cache-and-network',
  });
  const [createPolicy, { loading: creating }] = useMutation(CREATE_POLICY);
  const [updatePolicy, { loading: updating }] = useMutation(UPDATE_POLICY);
  const [deletePolicy] = useMutation(DELETE_POLICY);

  const formik = useFormik<PolicyFormValues>({
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
          await refetch();
          setDialogOpen(false);
          setNotifyState({
            open: true,
            policyId: editingPolicy.id,
            policyTitle: values.title,
            notifyUsers: false,
            notificationMethod: 'IN_APP',
          });
        } else {
          await createPolicy({ variables: { input: values } });
          await refetch();
          setDialogOpen(false);
        }
        resetForm();
        setEditingPolicy(null);
      } catch {
        /* handled by Apollo */
      }
    },
  });

  const handleNotifyConfirm = useCallback(async () => {
    if (!notifyState.notifyUsers) return;
    try {
      await updatePolicy({
        variables: {
          id: notifyState.policyId,
          input: {
            notifyUsers: true,
            notificationMethod: notifyState.notificationMethod,
          },
        },
      });
    } catch {
      /* handled by Apollo */
    } finally {
      setNotifyState(INITIAL_NOTIFY_STATE);
    }
  }, [notifyState, updatePolicy]);

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
      /* handled */
    }
  };

  const handleOpenNew = () => {
    setEditingPolicy(null);
    formik.resetForm();
    setDialogOpen(true);
  };

  const policies = data?.policies ?? [];

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" href="/dashboard">
          Dashboard
        </Link>
        <Typography color="text.primary">Policies</Typography>
      </Breadcrumbs>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>
          Policies
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenNew}>
          Add Policy
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error.message}
        </Alert>
      )}
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
                    label={POLICY_TYPE_LABELS[policy.type] ?? policy.type}
                    size="small"
                    sx={{
                      bgcolor: `${POLICY_COLORS[policy.type] ?? '#999'}20`,
                      color: POLICY_COLORS[policy.type] ?? '#999',
                      fontWeight: 600,
                    }}
                  />
                  <Chip
                    label={`v${policy.version ?? 1}`}
                    size="small"
                    variant="outlined"
                    color="default"
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                  {policy.content}
                </Typography>
                <Typography variant="caption" color="text.disabled" mt={1} display="block">
                  Updated: {new Date(policy.updatedAt).toLocaleString()}
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

      <PolicyDialog
        open={dialogOpen}
        isEditing={!!editingPolicy}
        formik={formik}
        creating={creating}
        updating={updating}
        onClose={() => setDialogOpen(false)}
      />

      <NotifyConfirmDialog
        state={notifyState}
        loading={updating}
        onChange={(updates) => setNotifyState((prev) => ({ ...prev, ...updates }))}
        onConfirm={handleNotifyConfirm}
        onCancel={() => setNotifyState(INITIAL_NOTIFY_STATE)}
      />
    </Box>
  );
};

export default PoliciesPage;
