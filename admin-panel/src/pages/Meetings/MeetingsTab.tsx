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
import VideocamIcon from '@mui/icons-material/Videocam';
import { useQuery, useMutation } from '@apollo/client';
import { GET_MEETINGS, GET_MEETING_COUNTS } from '../../graphql/queries';
import { UPDATE_MEETING, DELETE_MEETING } from '../../graphql/mutations';
import { useDebounce } from '../../hooks/useDebounce';
import type {
  Meeting,
  PaginatedMeetings,
  MeetingCountsData,
  MeetingOrder,
} from './Meetings.types';
import { MEETING_STATUS_COLORS } from './Meetings.types';
import ConfirmDeleteDialog from '../../components/ConfirmDeleteDialog';

const COLUMNS = [
  { id: 'userEmail', label: 'Email', sortable: false },
  { id: 'meetingDate', label: 'Date', sortable: true },
  { id: 'meetingTime', label: 'Time', sortable: false },
  { id: 'status', label: 'Status', sortable: true },
  { id: 'createdAt', label: 'Requested', sortable: true },
] as const;

function formatTimeDisplay(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${displayHour}:${String(minutes).padStart(2, '0')} ${suffix}`;
}

const MeetingsTab: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 400);
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState<MeetingOrder>('DESC');
  const [editMeeting, setEditMeeting] = useState<Meeting | null>(null);
  const [viewMeeting, setViewMeeting] = useState<Meeting | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [editNote, setEditNote] = useState('');
  const [editLink, setEditLink] = useState('');
  const [editCancelReason, setEditCancelReason] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Meeting | null>(null);

  const { data: countsData } = useQuery<MeetingCountsData>(GET_MEETING_COUNTS, {
    fetchPolicy: 'cache-and-network',
  });

  const { data, loading, refetch } = useQuery<PaginatedMeetings>(GET_MEETINGS, {
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

  const [updateReq, { loading: updating }] = useMutation(UPDATE_MEETING);
  const [deleteReq] = useMutation(DELETE_MEETING);

  const items = data?.meetings?.items ?? [];
  const total = data?.meetings?.total ?? 0;
  const counts = countsData?.meetingCounts;

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setOrder(order === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(column);
      setOrder('ASC');
    }
  };

  const handleEdit = (meeting: Meeting) => {
    setEditMeeting(meeting);
    setEditStatus(meeting.status);
    setEditNote(meeting.adminNote);
    setEditLink(meeting.meetingLink);
    setEditCancelReason(meeting.cancelReason);
  };

  const handleSaveEdit = async () => {
    if (!editMeeting) return;
    try {
      await updateReq({
        variables: {
          id: editMeeting.id,
          input: {
            status: editStatus || undefined,
            adminNote: editNote || undefined,
            meetingLink: editLink || undefined,
            cancelReason: editCancelReason || undefined,
          },
        },
      });
      await refetch();
      setEditMeeting(null);
    } catch {
      /* handled by Apollo */
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteReq({ variables: { id: deleteTarget.id } });
      await refetch();
      setDeleteTarget(null);
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
            { label: 'Confirmed', value: counts.confirmed, color: '#3b82f6' },
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
          placeholder="Search by email or date…"
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
          <MenuItem value="CONFIRMED">Confirmed</MenuItem>
          <MenuItem value="COMPLETED">Completed</MenuItem>
          <MenuItem value="CANCELLED">Cancelled</MenuItem>
        </TextField>
      </Box>

      {loading && !data && (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      )}
      {!loading && items.length === 0 && (
        <Alert severity="info">No meeting requests found.</Alert>
      )}

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
                          direction={
                            sortBy === col.id ? (order === 'ASC' ? 'asc' : 'desc') : 'asc'
                          }
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
                {items.map((meeting) => (
                  <TableRow key={meeting.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {meeting.user?.name ?? 'Unknown'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {meeting.user?.phone ?? '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{meeting.userEmail}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(meeting.meetingDate + 'T00:00:00').toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatTimeDisplay(meeting.meetingTime)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={meeting.status}
                        size="small"
                        color={MEETING_STATUS_COLORS[meeting.status] ?? 'default'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">
                        {new Date(meeting.createdAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => setViewMeeting(meeting)}>
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleEdit(meeting)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setDeleteTarget(meeting)}
                      >
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
      <Dialog
        open={Boolean(viewMeeting)}
        onClose={() => setViewMeeting(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <VideocamIcon /> Meeting Details
        </DialogTitle>
        {viewMeeting && (
          <DialogContent dividers>
            <Typography variant="subtitle2" color="text.secondary">
              User
            </Typography>
            <Typography mb={2}>
              {viewMeeting.user?.name ?? 'Unknown'} ({viewMeeting.userEmail})
            </Typography>
            <Typography variant="subtitle2" color="text.secondary">
              Date & Time
            </Typography>
            <Typography mb={2}>
              {new Date(viewMeeting.meetingDate + 'T00:00:00').toLocaleDateString()} at{' '}
              {formatTimeDisplay(viewMeeting.meetingTime)}
            </Typography>
            <Typography variant="subtitle2" color="text.secondary">
              Status
            </Typography>
            <Chip
              label={viewMeeting.status}
              color={MEETING_STATUS_COLORS[viewMeeting.status] ?? 'default'}
              size="small"
              sx={{ mb: 2 }}
            />
            {viewMeeting.meetingLink && (
              <>
                <Typography variant="subtitle2" color="text.secondary">
                  Meeting Link
                </Typography>
                <Typography mb={2} sx={{ wordBreak: 'break-all' }}>
                  {viewMeeting.meetingLink}
                </Typography>
              </>
            )}
            {viewMeeting.adminNote && (
              <>
                <Typography variant="subtitle2" color="text.secondary">
                  Admin Note
                </Typography>
                <Typography mb={2}>{viewMeeting.adminNote}</Typography>
              </>
            )}
            {viewMeeting.cancelReason && (
              <>
                <Typography variant="subtitle2" color="text.secondary">
                  Cancel Reason
                </Typography>
                <Typography mb={2}>{viewMeeting.cancelReason}</Typography>
              </>
            )}
            <Typography variant="caption" color="text.secondary">
              Requested: {new Date(viewMeeting.createdAt).toLocaleString()}
            </Typography>
          </DialogContent>
        )}
        <DialogActions>
          <Button
            onClick={() => {
              if (viewMeeting) handleEdit(viewMeeting);
              setViewMeeting(null);
            }}
          >
            Edit
          </Button>
          <Button onClick={() => setViewMeeting(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={Boolean(editMeeting)}
        onClose={() => setEditMeeting(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Update Meeting</DialogTitle>
        {editMeeting && (
          <DialogContent
            dividers
            sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}
          >
            <Typography variant="body2" color="text.secondary">
              {editMeeting.user?.name ?? 'Unknown'} — {editMeeting.userEmail}
            </Typography>
            <Typography variant="body2">
              {new Date(editMeeting.meetingDate + 'T00:00:00').toLocaleDateString()} at{' '}
              {formatTimeDisplay(editMeeting.meetingTime)}
            </Typography>
            <TextField
              select
              label="Status"
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value)}
              fullWidth
              size="small"
            >
              <MenuItem value="PENDING">Pending</MenuItem>
              <MenuItem value="CONFIRMED">Confirmed</MenuItem>
              <MenuItem value="COMPLETED">Completed</MenuItem>
              <MenuItem value="CANCELLED">Cancelled</MenuItem>
            </TextField>
            <TextField
              label="Meeting Link (Zoom URL)"
              value={editLink}
              onChange={(e) => setEditLink(e.target.value)}
              fullWidth
              size="small"
              placeholder="https://zoom.us/j/..."
            />
            <TextField
              label="Admin Note"
              value={editNote}
              onChange={(e) => setEditNote(e.target.value)}
              multiline
              rows={3}
              fullWidth
              size="small"
            />
            {editStatus === 'CANCELLED' && (
              <TextField
                label="Cancel Reason"
                value={editCancelReason}
                onChange={(e) => setEditCancelReason(e.target.value)}
                multiline
                rows={2}
                fullWidth
                size="small"
              />
            )}
          </DialogContent>
        )}
        <DialogActions>
          <Button onClick={() => setEditMeeting(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveEdit} disabled={updating}>
            {updating ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        title="Delete Meeting"
        entityName={deleteTarget?.user?.name ?? 'Unknown'}
        entityType="meeting"
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </Box>
  );
};

export default MeetingsTab;
