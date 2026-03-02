import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  TableSortLabel,
  Breadcrumbs,
  Link,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import HomeIcon from '@mui/icons-material/Home';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';
import VerifiedIcon from '@mui/icons-material/Verified';
import { useQuery, useMutation } from '@apollo/client';
import { GET_PLACES } from '../graphql/queries';
import { ADMIN_CREATE_PLACE, APPROVE_PLACE, REJECT_PLACE, DELETE_PLACE } from '../graphql/mutations';

type Order = 'ASC' | 'DESC';

interface Owner {
  id: string;
  name: string;
  phone: string;
}

interface Place {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  imageUrl: string;
  owner: Owner;
  category: string;
  phone: string;
  email: string;
  status: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PlacesData {
  places: {
    items: Place[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const statusColor: Record<string, 'warning' | 'success' | 'error' | 'default'> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'error',
};

const STATUS_TABS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED'];

const PlacesPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState<Order>('DESC');
  const [searchInput, setSearchInput] = useState('');
  const [statusTab, setStatusTab] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [newPlace, setNewPlace] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    category: 'Restaurant',
    phone: '',
    email: '',
    ownerId: '',
  });
  const [createError, setCreateError] = useState('');

  const statusFilter = STATUS_TABS[statusTab] === 'ALL' ? undefined : STATUS_TABS[statusTab];

  const { data, loading, error, refetch } = useQuery<PlacesData>(GET_PLACES, {
    variables: {
      page: page + 1,
      limit: rowsPerPage,
      search: search || undefined,
      status: statusFilter,
      sortBy,
      order,
    },
    fetchPolicy: 'cache-and-network',
  });

  const [adminCreatePlace, { loading: creating }] = useMutation(ADMIN_CREATE_PLACE);
  const [approvePlace] = useMutation(APPROVE_PLACE);
  const [rejectPlace] = useMutation(REJECT_PLACE);
  const [deletePlace] = useMutation(DELETE_PLACE);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setOrder(order === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(column);
      setOrder('ASC');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(0);
  };

  const handleApprove = async (id: string) => {
    await approvePlace({ variables: { id } });
    await refetch();
  };

  const handleReject = async (id: string) => {
    await rejectPlace({ variables: { id } });
    await refetch();
  };

  const handleDelete = async (id: string) => {
    await deletePlace({ variables: { id } });
    await refetch();
  };

  const handleCreatePlace = async () => {
    setCreateError('');
    if (!newPlace.name.trim() || !newPlace.address.trim() || !newPlace.city.trim()) {
      setCreateError('Name, address, and city are required');
      return;
    }
    try {
      await adminCreatePlace({
        variables: {
          input: {
            name: newPlace.name.trim(),
            description: newPlace.description.trim() || 'No description provided',
            address: newPlace.address.trim(),
            city: newPlace.city.trim(),
            category: newPlace.category,
            phone: newPlace.phone.trim(),
            email: newPlace.email.trim(),
          },
          ownerId: newPlace.ownerId.trim() || 'admin-1',
        },
      });
      setCreateOpen(false);
      setNewPlace({ name: '', description: '', address: '', city: '', category: 'Restaurant', phone: '', email: '', ownerId: '' });
      await refetch();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create place');
    }
  };

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          underline="hover"
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          color="inherit"
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Dashboard
        </Link>
        <Typography color="text.primary" fontWeight={600}>
          Places
        </Typography>
      </Breadcrumbs>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Typography variant="h5" fontWeight={700}>
          Places
        </Typography>
        <Box display="flex" gap={2} alignItems="center">
          <Box component="form" onSubmit={handleSearch}>
            <TextField
              size="small"
              placeholder="Search places..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
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
          </Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
            Create Place
          </Button>
        </Box>
      </Box>

      {/* Status Filter Tabs */}
      <Tabs
        value={statusTab}
        onChange={(_, v: number) => { setStatusTab(v); setPage(0); }}
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
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === 'name'}
                    direction={sortBy === 'name' ? (order === 'ASC' ? 'asc' : 'desc') : 'asc'}
                    onClick={() => handleSort('name')}
                  >
                    Place
                  </TableSortLabel>
                </TableCell>
                <TableCell>Owner</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>City</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Verified</TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === 'createdAt'}
                    direction={sortBy === 'createdAt' ? (order === 'ASC' ? 'asc' : 'desc') : 'asc'}
                    onClick={() => handleSort('createdAt')}
                  >
                    Registered
                  </TableSortLabel>
                </TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && !data ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={32} />
                  </TableCell>
                </TableRow>
              ) : !data?.places.items.length ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">No places found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                data.places.items.map((place) => (
                  <TableRow key={place.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={600} noWrap>
                          {place.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {place.address}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{place.owner?.name || '—'}</Typography>
                      <Typography variant="caption" color="text.secondary">{place.owner?.phone || ''}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={place.category} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{place.city}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={place.status}
                        color={statusColor[place.status] || 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {place.isVerified ? (
                        <Tooltip title="Verified">
                          <VerifiedIcon fontSize="small" color="success" />
                        </Tooltip>
                      ) : (
                        <Typography variant="body2" color="text.secondary">—</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(place.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" justifyContent="center" gap={0.5}>
                        {place.status === 'PENDING' && (
                          <>
                            <Tooltip title="Approve">
                              <IconButton size="small" color="success" onClick={() => handleApprove(place.id)}>
                                <CheckCircleIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject">
                              <IconButton size="small" color="error" onClick={() => handleReject(place.id)}>
                                <CancelIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                        {place.status === 'REJECTED' && (
                          <Tooltip title="Approve">
                            <IconButton size="small" color="success" onClick={() => handleApprove(place.id)}>
                              <CheckCircleIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {place.status === 'APPROVED' && (
                          <Tooltip title="Reject">
                            <IconButton size="small" color="warning" onClick={() => handleReject(place.id)}>
                              <CancelIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Delete">
                          <IconButton size="small" color="error" onClick={() => handleDelete(place.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {data && (
          <TablePagination
            component="div"
            count={data.places.total}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25]}
          />
        )}
      </Card>

      {/* Create Place Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Place</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          {createError && <Alert severity="error">{createError}</Alert>}
          <TextField
            label="Name"
            value={newPlace.name}
            onChange={(e) => setNewPlace({ ...newPlace, name: e.target.value })}
            fullWidth
          />
          <TextField
            label="Description"
            value={newPlace.description}
            onChange={(e) => setNewPlace({ ...newPlace, description: e.target.value })}
            multiline
            rows={3}
            fullWidth
          />
          <Box display="flex" gap={2}>
            <TextField
              label="Address"
              value={newPlace.address}
              onChange={(e) => setNewPlace({ ...newPlace, address: e.target.value })}
              fullWidth
            />
            <TextField
              label="City"
              value={newPlace.city}
              onChange={(e) => setNewPlace({ ...newPlace, city: e.target.value })}
              fullWidth
            />
          </Box>
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              value={newPlace.category}
              label="Category"
              onChange={(e) => setNewPlace({ ...newPlace, category: e.target.value })}
            >
              <MenuItem value="Restaurant">Restaurant</MenuItem>
              <MenuItem value="Cafe">Cafe</MenuItem>
              <MenuItem value="Bar">Bar</MenuItem>
              <MenuItem value="Park">Park</MenuItem>
              <MenuItem value="Event Space">Event Space</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </Select>
          </FormControl>
          <Box display="flex" gap={2}>
            <TextField
              label="Phone"
              value={newPlace.phone}
              onChange={(e) => setNewPlace({ ...newPlace, phone: e.target.value })}
              fullWidth
            />
            <TextField
              label="Email"
              value={newPlace.email}
              onChange={(e) => setNewPlace({ ...newPlace, email: e.target.value })}
              fullWidth
            />
          </Box>
          <TextField
            label="Owner ID (optional, defaults to admin)"
            value={newPlace.ownerId}
            onChange={(e) => setNewPlace({ ...newPlace, ownerId: e.target.value })}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreatePlace} disabled={creating}>
            {creating ? <CircularProgress size={20} /> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PlacesPage;
