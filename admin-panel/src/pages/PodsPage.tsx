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
  Avatar,
  Chip,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  TableSortLabel,
  Breadcrumbs,
  Link,
  AvatarGroup,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import HomeIcon from '@mui/icons-material/Home';
import { useQuery } from '@apollo/client';
import { GET_PODS } from '../graphql/queries';

type Order = 'ASC' | 'DESC';

interface Host {
  id: string;
  name: string;
  avatar: string;
  isVerifiedHost: boolean;
}

interface Attendee {
  id: string;
  name: string;
  avatar: string;
}

interface Pod {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  feePerPerson: number;
  maxSeats: number;
  currentSeats: number;
  dateTime: string;
  location: string;
  locationDetail: string;
  rating: number;
  reviewCount: number;
  status: string;
  refundPolicy: string;
  createdAt: string;
  host: Host;
  attendees: Attendee[];
}

interface PodsData {
  pods: {
    items: Pod[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const statusColor: Record<string, 'success' | 'warning' | 'info' | 'default' | 'error'> = {
  NEW: 'info',
  CONFIRMED: 'success',
  PENDING: 'warning',
  COMPLETED: 'default',
  CANCELLED: 'error',
};

const PodsPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState<Order>('DESC');
  const [searchInput, setSearchInput] = useState('');

  const { data, loading, error } = useQuery<PodsData>(GET_PODS, {
    variables: {
      page: page + 1,
      limit: rowsPerPage,
      search: search || undefined,
      sortBy,
      order,
    },
    fetchPolicy: 'cache-and-network',
  });

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

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (dateStr: string): string => {
    return new Date(dateStr).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
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
          Pods
        </Typography>
      </Breadcrumbs>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Typography variant="h5" fontWeight={700}>
          Pods
        </Typography>
        <Box component="form" onSubmit={handleSearch}>
          <TextField
            size="small"
            placeholder="Search pods..."
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
      </Box>

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
                    active={sortBy === 'title'}
                    direction={sortBy === 'title' ? (order === 'ASC' ? 'asc' : 'desc') : 'asc'}
                    onClick={() => handleSort('title')}
                  >
                    Pod
                  </TableSortLabel>
                </TableCell>
                <TableCell>Host</TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === 'category'}
                    direction={sortBy === 'category' ? (order === 'ASC' ? 'asc' : 'desc') : 'asc'}
                    onClick={() => handleSort('category')}
                  >
                    Category
                  </TableSortLabel>
                </TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Fee</TableCell>
                <TableCell>Seats</TableCell>
                <TableCell>Attendees</TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === 'dateTime'}
                    direction={sortBy === 'dateTime' ? (order === 'ASC' ? 'asc' : 'desc') : 'asc'}
                    onClick={() => handleSort('dateTime')}
                  >
                    Date
                  </TableSortLabel>
                </TableCell>
                <TableCell>Location</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && !data ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={32} />
                  </TableCell>
                </TableRow>
              ) : !data?.pods.items.length ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">No pods found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                data.pods.items.map((pod) => {
                  const fillPercent = Math.round((pod.currentSeats / pod.maxSeats) * 100);
                  return (
                    <TableRow key={pod.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1.5}>
                          <Avatar
                            variant="rounded"
                            src={pod.imageUrl}
                            sx={{ width: 40, height: 40 }}
                          />
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="body2" fontWeight={600} noWrap>
                              {pod.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" noWrap>
                              {pod.id}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Tooltip title={pod.host.name}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Avatar src={pod.host.avatar} sx={{ width: 28, height: 28 }}>
                              {pod.host.name?.[0]}
                            </Avatar>
                            <Typography variant="body2" noWrap>
                              {pod.host.name}
                            </Typography>
                          </Box>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Chip label={pod.category} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={pod.status}
                          color={statusColor[pod.status] || 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={600}>
                          ₹{pod.feePerPerson.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ minWidth: 80 }}>
                          <Typography variant="caption" color="text.secondary">
                            {pod.currentSeats}/{pod.maxSeats}
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={fillPercent}
                            sx={{
                              height: 4,
                              borderRadius: 2,
                              mt: 0.5,
                              bgcolor: 'grey.200',
                              '& .MuiLinearProgress-bar': {
                                bgcolor: fillPercent >= 80 ? 'warning.main' : 'primary.main',
                              },
                            }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        {pod.attendees.length > 0 ? (
                          <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 24, height: 24, fontSize: 11 } }}>
                            {pod.attendees.map((a) => (
                              <Avatar key={a.id} src={a.avatar} sx={{ width: 24, height: 24 }}>
                                {a.name?.[0]}
                              </Avatar>
                            ))}
                          </AvatarGroup>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            None
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{formatDate(pod.dateTime)}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatTime(pod.dateTime)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap>
                          {pod.location}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {pod.locationDetail}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {data && (
          <TablePagination
            component="div"
            count={data.pods.total}
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
    </Box>
  );
};

export default PodsPage;
