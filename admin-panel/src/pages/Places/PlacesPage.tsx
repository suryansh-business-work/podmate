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
  Tabs,
  Tab,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import HomeIcon from '@mui/icons-material/Home';
import AddIcon from '@mui/icons-material/Add';
import { useQuery, useMutation } from '@apollo/client';
import { GET_PLACES } from '../../graphql/queries';
import {
  APPROVE_PLACE,
  REJECT_PLACE,
  DELETE_PLACE,
  BULK_DELETE_PLACES,
} from '../../graphql/mutations';
import { useDebounce } from '../../hooks/useDebounce';
import { PlacesData, Place, Order, STATUS_TABS } from './Places.types';
import PlacesTable from './PlacesTable';
import CreatePlaceDialog from './CreatePlaceDialog';
import ConfirmDeleteDialog from '../../components/ConfirmDeleteDialog';
import BulkActionToolbar from '../../components/BulkActionToolbar';

const PlacesPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 400);
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState<Order>('DESC');
  const [statusTab, setStatusTab] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Place | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const statusFilter = STATUS_TABS[statusTab] === 'ALL' ? undefined : STATUS_TABS[statusTab];

  const { data, loading, error, refetch } = useQuery<PlacesData>(GET_PLACES, {
    variables: {
      page: page + 1,
      limit: rowsPerPage,
      search: debouncedSearch || undefined,
      status: statusFilter,
      sortBy,
      order,
    },
    fetchPolicy: 'cache-and-network',
  });

  const [approvePlace] = useMutation(APPROVE_PLACE);
  const [rejectPlace] = useMutation(REJECT_PLACE);
  const [deletePlaceMutation, { loading: deleting }] = useMutation(DELETE_PLACE);
  const [bulkDeletePlacesMutation, { loading: bulkDeleting }] = useMutation(BULK_DELETE_PLACES);

  const places = data?.places.items ?? [];

  const handleSort = (column: string) => {
    if (sortBy === column) setOrder(order === 'ASC' ? 'DESC' : 'ASC');
    else {
      setSortBy(column);
      setOrder('ASC');
    }
  };

  const handleApprove = async (id: string) => {
    await approvePlace({ variables: { id } });
    await refetch();
  };
  const handleReject = async (id: string) => {
    await rejectPlace({ variables: { id } });
    await refetch();
  };
  const handleDelete = (id: string) => {
    const place = places.find((p) => p.id === id);
    if (place) setDeleteTarget(place);
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.length === places.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(places.map((p) => p.id));
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deletePlaceMutation({ variables: { id: deleteTarget.id } });
      setDeleteTarget(null);
      setSelectedIds((prev) => prev.filter((id) => id !== deleteTarget.id));
      await refetch();
    } catch {
      /* handled by Apollo */
    }
  };

  const confirmBulkDelete = async () => {
    try {
      await bulkDeletePlacesMutation({ variables: { ids: selectedIds } });
      setSelectedIds([]);
      setBulkDeleteOpen(false);
      await refetch();
    } catch {
      /* handled by Apollo */
    }
  };

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          underline="hover"
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          color="inherit"
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" /> Dashboard
        </Link>
        <Typography color="text.primary" fontWeight={600}>
          Places
        </Typography>
      </Breadcrumbs>

      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
        flexWrap="wrap"
        gap={2}
      >
        <Typography variant="h5" fontWeight={700}>
          Places
        </Typography>
        <Box display="flex" gap={2} alignItems="center">
          <TextField
            size="small"
            placeholder="Search places..."
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setPage(0);
            }}
            sx={{ width: '100%', maxWidth: 300 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
            Create Place
          </Button>
        </Box>
      </Box>

      <Tabs
        value={statusTab}
        onChange={(_, v: number) => {
          setStatusTab(v);
          setPage(0);
        }}
        sx={{ mb: 2 }}
      >
        {STATUS_TABS.map((tab) => (
          <Tab key={tab} label={tab} />
        ))}
      </Tabs>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error.message}
        </Alert>
      )}

      <Card>
        <BulkActionToolbar
          selectedCount={selectedIds.length}
          entityType="place"
          loading={bulkDeleting}
          onDelete={() => setBulkDeleteOpen(true)}
          onClearSelection={() => setSelectedIds([])}
        />
        <PlacesTable
          places={places}
          loading={loading && !data}
          sortBy={sortBy}
          order={order}
          selectedIds={selectedIds}
          onSort={handleSort}
          onApprove={handleApprove}
          onReject={handleReject}
          onDelete={handleDelete}
          onToggleSelect={handleToggleSelect}
          onToggleSelectAll={handleToggleSelectAll}
        />
        {data && (
          <TablePagination
            component="div"
            count={data.places.total}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25]}
          />
        )}
      </Card>

      <CreatePlaceDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => refetch()}
      />

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        title="Delete Place"
        entityName={deleteTarget?.name ?? ''}
        entityType="place"
        loading={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />

      <ConfirmDeleteDialog
        open={bulkDeleteOpen}
        title={`Delete ${selectedIds.length} Places`}
        entityName={`${selectedIds.length} places`}
        entityType="places"
        loading={bulkDeleting}
        onClose={() => setBulkDeleteOpen(false)}
        onConfirm={confirmBulkDelete}
      />
    </Box>
  );
};

export default PlacesPage;
