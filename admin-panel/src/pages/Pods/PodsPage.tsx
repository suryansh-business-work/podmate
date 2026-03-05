import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  TablePagination,
  TextField,
  InputAdornment,
  Alert,
  Breadcrumbs,
  Link,
  Button,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import HomeIcon from '@mui/icons-material/Home';
import AddIcon from '@mui/icons-material/Add';
import { useQuery, useMutation } from '@apollo/client';
import { GET_PODS } from '../../graphql/queries';
import { DELETE_POD, FORCE_DELETE_POD, BULK_DELETE_PODS } from '../../graphql/mutations';
import { useDebounce } from '../../hooks/useDebounce';
import { PodsData, Pod, Order } from './Pods.types';
import PodsTable from './PodsTable';
import CreatePodDialog from './CreatePodDialog';
import ConfirmDeleteDialog from '../../components/ConfirmDeleteDialog';
import BulkActionToolbar from '../../components/BulkActionToolbar';

const PodsPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 400);
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState<Order>('DESC');
  const [createOpen, setCreateOpen] = useState(false);
  const [deletePod, setDeletePod] = useState<Pod | null>(null);
  const [issueRefunds, setIssueRefunds] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const { data, loading, error, refetch } = useQuery<PodsData>(GET_PODS, {
    variables: { page: page + 1, limit: rowsPerPage, search: debouncedSearch || undefined, sortBy, order },
    fetchPolicy: 'cache-and-network',
  });

  const [deletePodMutation, { loading: deleting }] = useMutation(DELETE_POD);
  const [forceDeletePodMutation, { loading: forceDeleting }] = useMutation(FORCE_DELETE_POD);
  const [bulkDeletePodsMutation, { loading: bulkDeleting }] = useMutation(BULK_DELETE_PODS);

  const pods = data?.pods.items ?? [];

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setOrder(order === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(column);
      setOrder('ASC');
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.length === pods.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(pods.map((p) => p.id));
    }
  };

  const handleDeletePod = (id: string) => {
    const pod = pods.find((p) => p.id === id);
    if (pod) setDeletePod(pod);
  };

  const confirmDelete = async () => {
    if (!deletePod) return;
    try {
      const hasAttendees = deletePod.attendees.length > 0;
      if (hasAttendees) {
        await forceDeletePodMutation({
          variables: { id: deletePod.id, issueRefunds },
        });
      } else {
        await deletePodMutation({ variables: { id: deletePod.id } });
      }
      setDeletePod(null);
      setIssueRefunds(true);
      setSelectedIds((prev) => prev.filter((id) => id !== deletePod.id));
      await refetch();
    } catch { /* handled by Apollo */ }
  };

  const confirmBulkDelete = async () => {
    try {
      await bulkDeletePodsMutation({ variables: { ids: selectedIds, issueRefunds } });
      setSelectedIds([]);
      setBulkDeleteOpen(false);
      setIssueRefunds(true);
      await refetch();
    } catch { /* handled by Apollo */ }
  };

  const attendeeCount = deletePod?.attendees.length ?? 0;
  const bulkAttendeeCount = pods
    .filter((p) => selectedIds.includes(p.id))
    .reduce((sum, p) => sum + p.attendees.length, 0);

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} color="inherit">
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" /> Dashboard
        </Link>
        <Typography color="text.primary" fontWeight={600}>Pods</Typography>
      </Breadcrumbs>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Typography variant="h5" fontWeight={700}>Pods</Typography>
        <Box display="flex" gap={2} alignItems="center">
          <TextField
            size="small"
            placeholder="Search pods..."
            value={searchInput}
            onChange={(e) => { setSearchInput(e.target.value); setPage(0); }}
            sx={{ width: '100%', maxWidth: 300 }}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
          />
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>Create Pod</Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error.message}</Alert>}

      <Card>
        <BulkActionToolbar
          selectedCount={selectedIds.length}
          entityType="pod"
          loading={bulkDeleting}
          onDelete={() => setBulkDeleteOpen(true)}
          onClearSelection={() => setSelectedIds([])}
        />
        <PodsTable
          pods={pods}
          loading={loading && !data}
          sortBy={sortBy}
          order={order}
          selectedIds={selectedIds}
          onSort={handleSort}
          onDeletePod={handleDeletePod}
          onToggleSelect={handleToggleSelect}
          onToggleSelectAll={handleToggleSelectAll}
        />
        {data && (
          <TablePagination
            component="div"
            count={data.pods.total}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            rowsPerPageOptions={[5, 10, 25]}
          />
        )}
      </Card>

      <CreatePodDialog open={createOpen} onClose={() => setCreateOpen(false)} onCreated={() => refetch()} />

      {/* Single delete dialog */}
      <ConfirmDeleteDialog
        open={!!deletePod}
        title="Delete Pod"
        entityName={deletePod?.title ?? ''}
        entityType="pod"
        loading={deleting || forceDeleting}
        onClose={() => { setDeletePod(null); setIssueRefunds(true); }}
        onConfirm={confirmDelete}
      >
        {attendeeCount > 0 && (
          <Box sx={{ mb: 2 }}>
            <Alert severity="warning" sx={{ mb: 1 }}>
              This pod has <strong>{attendeeCount}</strong> active attendee{attendeeCount > 1 ? 's' : ''}.
              All attendees will be removed before deleting the pod.
            </Alert>
            <FormControlLabel
              control={
                <Checkbox
                  checked={issueRefunds}
                  onChange={(e) => setIssueRefunds(e.target.checked)}
                />
              }
              label={
                <Typography variant="body2">
                  Issue refunds to all attendees (₹{((deletePod?.feePerPerson ?? 0) * attendeeCount).toLocaleString()} total)
                </Typography>
              }
            />
          </Box>
        )}
      </ConfirmDeleteDialog>

      {/* Bulk delete dialog */}
      <ConfirmDeleteDialog
        open={bulkDeleteOpen}
        title={`Delete ${selectedIds.length} Pods`}
        entityName={`${selectedIds.length} pods`}
        entityType="pods"
        loading={bulkDeleting}
        onClose={() => { setBulkDeleteOpen(false); setIssueRefunds(true); }}
        onConfirm={confirmBulkDelete}
      >
        {bulkAttendeeCount > 0 && (
          <Box sx={{ mb: 2 }}>
            <Alert severity="warning" sx={{ mb: 1 }}>
              These pods have a total of <strong>{bulkAttendeeCount}</strong> active attendee{bulkAttendeeCount > 1 ? 's' : ''}.
            </Alert>
            <FormControlLabel
              control={
                <Checkbox
                  checked={issueRefunds}
                  onChange={(e) => setIssueRefunds(e.target.checked)}
                />
              }
              label={<Typography variant="body2">Issue refunds to all attendees</Typography>}
            />
          </Box>
        )}
      </ConfirmDeleteDialog>
    </Box>
  );
};

export default PodsPage;
