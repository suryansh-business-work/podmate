import React, { useState } from 'react';
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Typography,
  Chip,
  IconButton,
  Card,
  TablePagination,
  TableSortLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  CircularProgress,
  Alert,
  InputAdornment,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import PhoneCallbackIcon from '@mui/icons-material/PhoneCallback';
import { useQuery, useMutation } from '@apollo/client';
import { GET_CALLBACK_REQUESTS, GET_CALLBACK_REQUEST_COUNTS } from '../../graphql/queries';
import { UPDATE_CALLBACK_REQUEST, DELETE_CALLBACK_REQUEST } from '../../graphql/mutations';
import { useDebounce } from '../../hooks/useDebounce';
import {
  CallbackRequest,
  PaginatedCallbackRequests,
  CallbackRequestCounts,
  CallbackOrder,
  CALLBACK_STATUS_COLORS,
} from './Callback.types';

const COLUMNS = [
  { id: 'phone', label: 'Phone', sortable: false },
  { id: 'reason', label: 'Reason', sortable: false },
  { id: 'preferredTime', label: 'Preferred Time', sortable: false },
  { id: 'status', label: 'Status', sortable: true },
  { id: 'createdAt', label: 'Date', sortable: true },
] as const;

const CallbackRequestsTab: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 400);
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState<CallbackOrder>('DESC');
  const [editReq, setEditReq] = useState<CallbackRequest | null>(null);
  const [viewReq, setViewReq] = useState<CallbackRequest | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [editNote, setEditNote] = useState('');
  const [editScheduled, setEditScheduled] = useState('');

  const { data: countsData } = useQuery<CallbackRequestCounts>(GET_CALLBACK_REQUEST_COUNTS, {
    fetchPolicy: 'cache-and-network',
  });

  const { data, loading, refetch } = useQuery<PaginatedCallbackRequests>(GET_CALLBACK_REQUESTS, {
    variables: {
      page: page + 1,
      limit: rowsPerPage,
      search: debouncedSearch || undefined,
      status: statusFilter || undefined,
      sortBy,
      order,
    },
    fetchPolicy: 'cache-and-network',
  });

  const [updateReq, { loading: updating }] = useMutation(UPDATE_CALLBACK_REQUEST);
  const [deleteReq] = useMutation(DELETE_CALLBACK_REQUEST);

  const items = data?.callbackRequests?.items ?? [];
  const total = data?.callbackRequests?.total ?? 0;
  const counts = countsData?.callbackRequestCounts;

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setOrder(order === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(column);
      setOrder('ASC');
    }
  };

  const handleEdit = (req: CallbackRequest) => {
    setEditReq(req);
    setEditStatus(req.status);
    setEditNote(req.adminNote);
    setEditScheduled(req.scheduledAt);
  };

  const handleSaveEdit = async () => {
    if (!editReq) return;
    try {
      await updateReq({
        variables: {
          id: editReq.id,
          input: {
            status: editStatus || undefined,
            adminNote: editNote || undefined,
            scheduledAt: editScheduled || undefined,
          },
        },
      });
      await refetch();
      setEditReq(null);
    } catch {
      /* handled by Apollo */
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this callback request?')) return;
    try {
      await deleteReq({ variables: { id } });
      await refetch();
    } catch {
      /* handled */
    }
  };

  return (
    <Box>
      {counts && (
        <Box display="flex" gap={2} mb={3} flexWrap="wrap">
          {[
            { label: 'Pending', value: counts.pending, color: '#f59e0b' },
            { label: 'Scheduled', value: counts.scheduled, color: '#3b82f6' },
            { label: 'Completed', value: counts.completed, color: '#10b981' },
            { label: 'Cancelled', value: counts.cancelled, color: '#6b7280' },
          ].map((s) => (
            <Card
              key={s.label}
              sx={{ flex: '1 1 120px', p: 2, borderLeft: `4px solid ${s.color}` }}
            >
              <Typography variant="caption" color="text.secondary">
                {s.label}
              </Typography>
              <Typography variant="h5" fontWeight={700}>
                {s.value}
              </Typography>
            </Card>
          ))}
        </Box>
      )}

      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        <TextField
          size="small"
          placeholder="Search by phone or reason…"
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.target.value);
            setPage(0);
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
          sx={{ minWidth: 250 }}
        />
        <TextField
          select
          size="small"
          label="Status"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(0);
          }}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="PENDING">Pending</MenuItem>
          <MenuItem value="SCHEDULED">Scheduled</MenuItem>
          <MenuItem value="COMPLETED">Completed</MenuItem>
          <MenuItem value="CANCELLED">Cancelled</MenuItem>
        </TextField>
      </Box>

      {loading && !data && (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      )}
      {!loading && items.length === 0 && <Alert severity="info">No callback requests found.</Alert>}

      {items.length > 0 && (
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                  {COLUMNS.map((col) => (
                    <TableCell key={col.id} sx={{ fontWeight: 600 }}>
                      {col.sortable ? (
                        <TableSortLabel
                          active={sortBy === col.id}
                          direction={sortBy === col.id ? (order === 'ASC' ? 'asc' : 'desc') : 'asc'}
                          onClick={() => handleSort(col.id)}
                        >
                          {col.label}
                        </TableSortLabel>
                      ) : (
                        col.label
                      )}
                    </TableCell>
                  ))}
                  <TableCell sx={{ fontWeight: 600 }} align="right">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((req) => (
                  <TableRow key={req.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {req.user?.name ?? 'Unknown'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {req.user?.phone ?? req.phone}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{req.phone}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                        {req.reason}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{req.preferredTime || '—'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={req.status}
                        size="small"
                        color={CALLBACK_STATUS_COLORS[req.status] ?? 'default'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => setViewReq(req)}>
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleEdit(req)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(req.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </Card>
      )}

      {/* View Dialog */}
      <Dialog open={Boolean(viewReq)} onClose={() => setViewReq(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PhoneCallbackIcon /> Callback Request
        </DialogTitle>
        {viewReq && (
          <DialogContent dividers>
            <Typography variant="subtitle2" color="text.secondary">
              User
            </Typography>
            <Typography mb={2}>
              {viewReq.user?.name ?? 'Unknown'} ({viewReq.phone})
            </Typography>
            <Typography variant="subtitle2" color="text.secondary">
              Reason
            </Typography>
            <Typography mb={2}>{viewReq.reason}</Typography>
            <Typography variant="subtitle2" color="text.secondary">
              Preferred Time
            </Typography>
            <Typography mb={2}>{viewReq.preferredTime || '—'}</Typography>
            <Typography variant="subtitle2" color="text.secondary">
              Status
            </Typography>
            <Chip
              label={viewReq.status}
              color={CALLBACK_STATUS_COLORS[viewReq.status] ?? 'default'}
              size="small"
              sx={{ mb: 2 }}
            />
            {viewReq.adminNote && (
              <>
                <Typography variant="subtitle2" color="text.secondary">
                  Admin Note
                </Typography>
                <Typography mb={2}>{viewReq.adminNote}</Typography>
              </>
            )}
            {viewReq.scheduledAt && (
              <>
                <Typography variant="subtitle2" color="text.secondary">
                  Scheduled At
                </Typography>
                <Typography mb={2}>{new Date(viewReq.scheduledAt).toLocaleString()}</Typography>
              </>
            )}
            <Typography variant="caption" color="text.secondary">
              Created: {new Date(viewReq.createdAt).toLocaleString()}
            </Typography>
          </DialogContent>
        )}
        <DialogActions>
          <Button
            onClick={() => {
              if (viewReq) handleEdit(viewReq);
              setViewReq(null);
            }}
          >
            Edit
          </Button>
          <Button onClick={() => setViewReq(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={Boolean(editReq)} onClose={() => setEditReq(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Callback Request</DialogTitle>
        {editReq && (
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {editReq.user?.name ?? 'Unknown'} — {editReq.phone}
            </Typography>
            <Typography variant="body2">{editReq.reason}</Typography>
            <TextField
              select
              label="Status"
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value)}
              fullWidth
              size="small"
            >
              <MenuItem value="PENDING">Pending</MenuItem>
              <MenuItem value="SCHEDULED">Scheduled</MenuItem>
              <MenuItem value="COMPLETED">Completed</MenuItem>
              <MenuItem value="CANCELLED">Cancelled</MenuItem>
            </TextField>
            <TextField
              label="Admin Note"
              value={editNote}
              onChange={(e) => setEditNote(e.target.value)}
              multiline
              rows={3}
              fullWidth
              size="small"
            />
            <TextField
              label="Scheduled At"
              value={editScheduled}
              onChange={(e) => setEditScheduled(e.target.value)}
              placeholder="e.g. 2025-01-15T10:00:00.000Z"
              fullWidth
              size="small"
            />
          </DialogContent>
        )}
        <DialogActions>
          <Button onClick={() => setEditReq(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveEdit} disabled={updating}>
            {updating ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CallbackRequestsTab;
