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
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import HomeIcon from '@mui/icons-material/Home';
import AddIcon from '@mui/icons-material/Add';
import { useQuery, useMutation } from '@apollo/client';
import { GET_USERS } from '../../graphql/queries';
import { DELETE_USER, BULK_DELETE_USERS } from '../../graphql/mutations';
import { useDebounce } from '../../hooks/useDebounce';
import { UsersData, User, Order } from './Users.types';
import UsersTable from './UsersTable';
import CreateUserDialog from './CreateUserDialog';
import ToggleUserDialog from './ToggleUserDialog';
import ConfirmDeleteDialog from '../../components/ConfirmDeleteDialog';
import BulkActionToolbar from '../../components/BulkActionToolbar';

const UsersPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 400);
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState<Order>('DESC');
  const [createOpen, setCreateOpen] = useState(false);
  const [toggleUser, setToggleUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const { data, loading, error, refetch } = useQuery<UsersData>(GET_USERS, {
    variables: { page: page + 1, limit: rowsPerPage, search: debouncedSearch || undefined, sortBy, order },
    fetchPolicy: 'cache-and-network',
  });

  const [deleteUserMutation, { loading: deleting }] = useMutation(DELETE_USER);
  const [bulkDeleteUsersMutation, { loading: bulkDeleting }] = useMutation(BULK_DELETE_USERS);

  const users = data?.users.items ?? [];

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setOrder(order === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(column);
      setOrder('ASC');
    }
  };

  const handleDeleteUser = (id: string) => {
    const user = users.find((u) => u.id === id);
    if (user) setDeleteUser(user);
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.length === users.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(users.map((u) => u.id));
    }
  };

  const confirmDelete = async () => {
    if (!deleteUser) return;
    try {
      await deleteUserMutation({ variables: { userId: deleteUser.id } });
      setDeleteUser(null);
      setSelectedIds((prev) => prev.filter((id) => id !== deleteUser.id));
      await refetch();
    } catch { /* handled by Apollo */ }
  };

  const confirmBulkDelete = async () => {
    try {
      await bulkDeleteUsersMutation({ variables: { ids: selectedIds } });
      setSelectedIds([]);
      setBulkDeleteOpen(false);
      await refetch();
    } catch { /* handled by Apollo */ }
  };

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} color="inherit">
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Dashboard
        </Link>
        <Typography color="text.primary" fontWeight={600}>Users</Typography>
      </Breadcrumbs>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Typography variant="h5" fontWeight={700}>Users</Typography>
        <Box display="flex" gap={2} alignItems="center">
          <TextField
            size="small"
            placeholder="Search by name or phone..."
            value={searchInput}
            onChange={(e) => { setSearchInput(e.target.value); setPage(0); }}
            sx={{ width: 300 }}
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
            Create User
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error.message}</Alert>}

      <Card>
        <BulkActionToolbar
          selectedCount={selectedIds.length}
          entityType="user"
          loading={bulkDeleting}
          onDelete={() => setBulkDeleteOpen(true)}
          onClearSelection={() => setSelectedIds([])}
        />
        <UsersTable
          users={users}
          loading={loading && !data}
          sortBy={sortBy}
          order={order}
          selectedIds={selectedIds}
          onSort={handleSort}
          onToggleUser={(user) => setToggleUser(user)}
          onDeleteUser={handleDeleteUser}
          onRefetch={() => refetch()}
          onToggleSelect={handleToggleSelect}
          onToggleSelectAll={handleToggleSelectAll}
        />
        {data && (
          <TablePagination
            component="div"
            count={data.users.total}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            rowsPerPageOptions={[5, 10, 25]}
          />
        )}
      </Card>

      <CreateUserDialog open={createOpen} onClose={() => setCreateOpen(false)} onCreated={() => refetch()} />

      {toggleUser && (
        <ToggleUserDialog
          open={!!toggleUser}
          onClose={() => setToggleUser(null)}
          onToggled={() => { setToggleUser(null); refetch(); }}
          userId={toggleUser.id}
          userName={toggleUser.name}
          currentActive={toggleUser.isActive}
        />
      )}

      <ConfirmDeleteDialog
        open={!!deleteUser}
        title="Delete User"
        entityName={deleteUser?.name ?? ''}
        entityType="user"
        loading={deleting}
        onClose={() => setDeleteUser(null)}
        onConfirm={confirmDelete}
      />

      <ConfirmDeleteDialog
        open={bulkDeleteOpen}
        title={`Delete ${selectedIds.length} Users`}
        entityName={`${selectedIds.length} users`}
        entityType="users"
        loading={bulkDeleting}
        onClose={() => setBulkDeleteOpen(false)}
        onConfirm={confirmBulkDelete}
      />
    </Box>
  );
};

export default UsersPage;
