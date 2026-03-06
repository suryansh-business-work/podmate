import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  TablePagination,
  Chip,
  IconButton,
  TextField,
  MenuItem,
  Breadcrumbs,
  Link,
  CircularProgress,
  Alert,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import { useQuery, useMutation } from '@apollo/client';
import { GET_POD_IDEAS } from '../../graphql/queries';
import { UPDATE_POD_IDEA, DELETE_POD_IDEA } from '../../graphql/mutations';
import type { PodIdeaItem, PaginatedPodIdeas } from './PodIdeas.types';
import { POD_IDEA_STATUS_COLORS } from './PodIdeas.types';

const PodIdeasPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [categoryFilter, setCategoryFilter] = useState('');

  const [editItem, setEditItem] = useState<PodIdeaItem | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const { data, loading, refetch } = useQuery<PaginatedPodIdeas>(GET_POD_IDEAS, {
    variables: {
      page: page + 1,
      limit: rowsPerPage,
      category: categoryFilter || undefined,
    },
    fetchPolicy: 'cache-and-network',
  });

  const [updatePodIdea, { loading: updating }] = useMutation(UPDATE_POD_IDEA);
  const [deletePodIdea] = useMutation(DELETE_POD_IDEA);

  const items = data?.podIdeas?.items ?? [];
  const total = data?.podIdeas?.total ?? 0;

  const handleEdit = (item: PodIdeaItem) => {
    setEditItem(item);
    setEditStatus(item.status);
    setEditNotes(item.adminNotes ?? '');
  };

  const handleSaveEdit = async () => {
    if (!editItem) return;
    try {
      await updatePodIdea({
        variables: {
          id: editItem.id,
          input: {
            status: editStatus || undefined,
            adminNotes: editNotes || undefined,
          },
        },
      });
      await refetch();
      setEditItem(null);
    } catch {
      /* handled by Apollo */
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this pod idea?')) return;
    try {
      await deletePodIdea({ variables: { id } });
      await refetch();
    } catch {
      /* handled */
    }
  };

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          underline="hover"
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          color="inherit"
          href="/dashboard"
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" /> Dashboard
        </Link>
        <Typography color="text.primary" fontWeight={600}>
          Pod Ideas
        </Typography>
      </Breadcrumbs>

      <Typography variant="h5" fontWeight={700} mb={3}>
        Pod Ideas
      </Typography>

      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        <TextField
          size="small"
          placeholder="Filter by category..."
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
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
      </Box>

      {loading && !data && (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      )}
      {!loading && items.length === 0 && (
        <Alert severity="info">No pod ideas found.</Alert>
      )}

      {items.length > 0 && (
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Location</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Budget</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Upvotes</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {item.user?.name ?? 'Unknown'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.user?.phone ?? ''}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {item.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 200, display: 'block' }}>
                        {item.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={item.category} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{item.location || '—'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{item.estimatedBudget || '—'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <ThumbUpIcon fontSize="small" color="primary" />
                        <Typography variant="body2" fontWeight={600}>
                          {item.upvoteCount}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={item.status}
                        size="small"
                        color={POD_IDEA_STATUS_COLORS[item.status] ?? 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => handleEdit(item)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(item.id)}>
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

      {/* Edit Dialog */}
      <Dialog open={Boolean(editItem)} onClose={() => setEditItem(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Pod Idea</DialogTitle>
        {editItem && (
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {editItem.user?.name ?? 'Unknown'} — {editItem.title}
            </Typography>
            <Typography variant="body2">{editItem.description}</Typography>
            <TextField
              select
              label="Status"
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value)}
              fullWidth
              size="small"
            >
              <MenuItem value="PENDING">Pending</MenuItem>
              <MenuItem value="APPROVED">Approved</MenuItem>
              <MenuItem value="REJECTED">Rejected</MenuItem>
            </TextField>
            <TextField
              label="Admin Notes"
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              multiline
              rows={3}
              fullWidth
              size="small"
            />
          </DialogContent>
        )}
        <DialogActions>
          <Button onClick={() => setEditItem(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveEdit} disabled={updating}>
            {updating ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PodIdeasPage;
