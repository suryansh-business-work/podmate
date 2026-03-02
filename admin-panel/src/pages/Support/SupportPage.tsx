import React, { useState } from 'react';
import {
  Box, Typography, TextField, MenuItem, CircularProgress,
  Alert, InputAdornment, Breadcrumbs, Link,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import HomeIcon from '@mui/icons-material/Home';
import { useQuery, useMutation } from '@apollo/client';
import { GET_SUPPORT_TICKETS, GET_SUPPORT_TICKET_COUNTS } from '../../graphql/queries';
import { UPDATE_SUPPORT_TICKET, DELETE_SUPPORT_TICKET } from '../../graphql/mutations';
import { useDebounce } from '../../hooks/useDebounce';
import { SupportTicket, PaginatedSupportTickets, SupportTicketCounts, Order } from './Support.types';
import SupportTable from './SupportTable';
import StatusCounts from './StatusCounts';
import ViewTicketDialog from './ViewTicketDialog';
import EditTicketDialog from './EditTicketDialog';

const SupportPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 400);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState<Order>('DESC');
  const [editTicket, setEditTicket] = useState<SupportTicket | null>(null);
  const [viewTicket, setViewTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [newPriority, setNewPriority] = useState('');

  const { data: countsData } = useQuery<SupportTicketCounts>(GET_SUPPORT_TICKET_COUNTS, {
    fetchPolicy: 'cache-and-network',
  });

  const { data, loading, refetch } = useQuery<PaginatedSupportTickets>(GET_SUPPORT_TICKETS, {
    variables: {
      page: page + 1,
      limit: rowsPerPage,
      search: debouncedSearch || undefined,
      status: statusFilter || undefined,
      priority: priorityFilter || undefined,
      sortBy,
      order,
    },
    fetchPolicy: 'cache-and-network',
  });

  const [updateTicket, { loading: updating }] = useMutation(UPDATE_SUPPORT_TICKET);
  const [deleteTicketMutation] = useMutation(DELETE_SUPPORT_TICKET);

  const tickets = data?.supportTickets?.items ?? [];
  const total = data?.supportTickets?.total ?? 0;
  const counts = countsData?.supportTicketCounts;

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setOrder(order === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(column);
      setOrder('ASC');
    }
  };

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
    } catch { /* handled by Apollo */ }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this ticket?')) return;
    try {
      await deleteTicketMutation({ variables: { id } });
      await refetch();
    } catch { /* handled */ }
  };

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} color="inherit">
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" /> Dashboard
        </Link>
        <Typography color="text.primary" fontWeight={600}>Support Tickets</Typography>
      </Breadcrumbs>

      <Typography variant="h5" fontWeight={700} mb={3}>Support Tickets</Typography>

      {counts && (
        <StatusCounts
          open={counts.open}
          inProgress={counts.inProgress}
          resolved={counts.resolved}
          closed={counts.closed}
        />
      )}

      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        <TextField
          size="small"
          placeholder="Search tickets…"
          value={searchInput}
          onChange={(e) => { setSearchInput(e.target.value); setPage(0); }}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
          sx={{ minWidth: 250 }}
        />
        <TextField
          select size="small" label="Status" value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="OPEN">Open</MenuItem>
          <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
          <MenuItem value="RESOLVED">Resolved</MenuItem>
          <MenuItem value="CLOSED">Closed</MenuItem>
        </TextField>
        <TextField
          select size="small" label="Priority" value={priorityFilter}
          onChange={(e) => { setPriorityFilter(e.target.value); setPage(0); }}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="LOW">Low</MenuItem>
          <MenuItem value="MEDIUM">Medium</MenuItem>
          <MenuItem value="HIGH">High</MenuItem>
        </TextField>
      </Box>

      {loading && !data && <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>}
      {!loading && tickets.length === 0 && <Alert severity="info">No support tickets found.</Alert>}

      {tickets.length > 0 && (
        <SupportTable
          tickets={tickets}
          total={total}
          page={page}
          rowsPerPage={rowsPerPage}
          sortBy={sortBy}
          order={order}
          onSort={handleSort}
          onPageChange={setPage}
          onRowsPerPageChange={(size) => { setRowsPerPage(size); setPage(0); }}
          onView={setViewTicket}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <ViewTicketDialog ticket={viewTicket} onClose={() => setViewTicket(null)} onReply={handleEdit} />
      <EditTicketDialog
        ticket={editTicket} replyText={replyText} newStatus={newStatus} newPriority={newPriority} updating={updating}
        onReplyChange={setReplyText} onStatusChange={setNewStatus} onPriorityChange={setNewPriority}
        onSave={handleSaveEdit} onClose={() => setEditTicket(null)}
      />
    </Box>
  );
};

export default SupportPage;
