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
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  TablePagination,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useQuery, useMutation } from '@apollo/client';
import { GET_SUPPORT_TICKETS } from '../graphql/queries';
import { UPDATE_SUPPORT_TICKET, DELETE_SUPPORT_TICKET } from '../graphql/mutations';

interface SupportTicket {
  id: string;
  userId: string;
  user: { id: string; name: string; phone: string } | null;
  subject: string;
  message: string;
  status: string;
  priority: string;
  adminReply: string;
  createdAt: string;
  updatedAt: string;
}

interface PaginatedSupportTickets {
  supportTickets: {
    items: SupportTicket[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const STATUS_COLORS: Record<string, 'warning' | 'info' | 'success' | 'default'> = {
  OPEN: 'warning',
  IN_PROGRESS: 'info',
  RESOLVED: 'success',
  CLOSED: 'default',
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW: '#10b981',
  MEDIUM: '#f59e0b',
  HIGH: '#ef4444',
};

const SupportPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editTicket, setEditTicket] = useState<SupportTicket | null>(null);
  const [viewTicket, setViewTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [newPriority, setNewPriority] = useState('');

  const { data, loading, refetch } = useQuery<PaginatedSupportTickets>(GET_SUPPORT_TICKETS, {
    variables: {
      page: page + 1,
      limit: rowsPerPage,
      search: search || undefined,
      status: statusFilter || undefined,
      sortBy: 'createdAt',
      order: 'DESC',
    },
    fetchPolicy: 'cache-and-network',
  });

  const [updateTicket, { loading: updating }] = useMutation(UPDATE_SUPPORT_TICKET);
  const [deleteTicketMutation] = useMutation(DELETE_SUPPORT_TICKET);

  const tickets = data?.supportTickets?.items ?? [];
  const total = data?.supportTickets?.total ?? 0;

  const handleEdit = (ticket: SupportTicket) => {
    setEditTicket(ticket);
    setReplyText(ticket.adminReply);
    setNewStatus(ticket.status);
    setNewPriority(ticket.priority);
  };

  const handleSaveEdit = async () => {
    if (!editTicket) return;
    try {
      await updateTicket({
        variables: {
          id: editTicket.id,
          input: {
            status: newStatus || undefined,
            adminReply: replyText || undefined,
            priority: newPriority || undefined,
          },
        },
      });
      await refetch();
      setEditTicket(null);
    } catch {
      /* handled by Apollo */
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this ticket?')) return;
    try {
      await deleteTicketMutation({ variables: { id } });
      await refetch();
    } catch {
      /* handled */
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>
          Support Tickets
        </Typography>
      </Box>

      {/* Filters */}
      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        <TextField
          size="small"
          placeholder="Search tickets…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
          }}
          sx={{ minWidth: 250 }}
        />
        <TextField
          select
          size="small"
          label="Status"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="OPEN">Open</MenuItem>
          <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
          <MenuItem value="RESOLVED">Resolved</MenuItem>
          <MenuItem value="CLOSED">Closed</MenuItem>
        </TextField>
      </Box>

      {loading && !data && (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      )}

      {!loading && tickets.length === 0 && (
        <Alert severity="info">No support tickets found.</Alert>
      )}

      {tickets.length > 0 && (
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Subject</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Priority</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tickets.map((ticket) => (
                  <TableRow key={ticket.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 200 }}>
                        {ticket.subject}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{ticket.user?.name ?? 'Unknown'}</Typography>
                      <Typography variant="caption" color="text.secondary">{ticket.user?.phone ?? ''}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={ticket.status.replace('_', ' ')}
                        size="small"
                        color={STATUS_COLORS[ticket.status] ?? 'default'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={ticket.priority}
                        size="small"
                        sx={{
                          bgcolor: `${PRIORITY_COLORS[ticket.priority] ?? '#999'}20`,
                          color: PRIORITY_COLORS[ticket.priority] ?? '#999',
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => setViewTicket(ticket)}>
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleEdit(ticket)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(ticket.id)}>
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
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          />
        </Card>
      )}

      {/* View Dialog */}
      <Dialog open={Boolean(viewTicket)} onClose={() => setViewTicket(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Ticket Details</DialogTitle>
        <DialogContent>
          {viewTicket && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary">Subject</Typography>
              <Typography variant="body1" fontWeight={600} mb={2}>{viewTicket.subject}</Typography>
              <Typography variant="subtitle2" color="text.secondary">From</Typography>
              <Typography variant="body2" mb={2}>{viewTicket.user?.name ?? 'Unknown'} ({viewTicket.user?.phone ?? ''})</Typography>
              <Typography variant="subtitle2" color="text.secondary">Message</Typography>
              <Typography variant="body2" mb={2} sx={{ whiteSpace: 'pre-wrap' }}>{viewTicket.message}</Typography>
              {viewTicket.adminReply && (
                <>
                  <Typography variant="subtitle2" color="text.secondary">Admin Reply</Typography>
                  <Card variant="outlined" sx={{ p: 2, bgcolor: 'primary.main', color: '#fff', mb: 2 }}>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{viewTicket.adminReply}</Typography>
                  </Card>
                </>
              )}
              <Box display="flex" gap={1} mt={1}>
                <Chip label={viewTicket.status.replace('_', ' ')} color={STATUS_COLORS[viewTicket.status] ?? 'default'} size="small" />
                <Chip
                  label={viewTicket.priority}
                  size="small"
                  sx={{ bgcolor: `${PRIORITY_COLORS[viewTicket.priority] ?? '#999'}20`, color: PRIORITY_COLORS[viewTicket.priority] ?? '#999', fontWeight: 600 }}
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewTicket(null)}>Close</Button>
          <Button variant="contained" onClick={() => { if (viewTicket) handleEdit(viewTicket); setViewTicket(null); }}>Reply</Button>
        </DialogActions>
      </Dialog>

      {/* Edit/Reply Dialog */}
      <Dialog open={Boolean(editTicket)} onClose={() => setEditTicket(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Respond to Ticket</DialogTitle>
        <DialogContent>
          {editTicket && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>{editTicket.subject}</Typography>
              <Typography variant="body2" color="text.secondary" mb={2} sx={{ whiteSpace: 'pre-wrap' }}>
                {editTicket.message}
              </Typography>
              <TextField
                select
                fullWidth
                label="Status"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                sx={{ mb: 2, mt: 1 }}
              >
                <MenuItem value="OPEN">Open</MenuItem>
                <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                <MenuItem value="RESOLVED">Resolved</MenuItem>
                <MenuItem value="CLOSED">Closed</MenuItem>
              </TextField>
              <TextField
                select
                fullWidth
                label="Priority"
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value)}
                sx={{ mb: 2 }}
              >
                <MenuItem value="LOW">Low</MenuItem>
                <MenuItem value="MEDIUM">Medium</MenuItem>
                <MenuItem value="HIGH">High</MenuItem>
              </TextField>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Admin Reply"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditTicket(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveEdit} disabled={updating}>
            {updating ? <CircularProgress size={20} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SupportPage;
