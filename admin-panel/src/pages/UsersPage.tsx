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
  IconButton,
  Tooltip,
  TableSortLabel,
  Breadcrumbs,
  Link,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VerifiedIcon from '@mui/icons-material/Verified';
import HomeIcon from '@mui/icons-material/Home';
import { useQuery } from '@apollo/client';
import { GET_USERS } from '../graphql/queries';

type Order = 'ASC' | 'DESC';

interface User {
  id: string;
  phone: string;
  name: string;
  avatar: string;
  role: string;
  isVerifiedHost: boolean;
  createdAt: string;
}

interface UsersData {
  users: {
    items: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const roleColor: Record<string, 'primary' | 'warning' | 'error' | 'default'> = {
  USER: 'default',
  PLACE_OWNER: 'warning',
  ADMIN: 'error',
};

const UsersPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState<Order>('DESC');
  const [searchInput, setSearchInput] = useState('');

  const { data, loading, error } = useQuery<UsersData>(GET_USERS, {
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
          Users
        </Typography>
      </Breadcrumbs>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Typography variant="h5" fontWeight={700}>
          Users
        </Typography>
        <Box component="form" onSubmit={handleSearch}>
          <TextField
            size="small"
            placeholder="Search by name or phone..."
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
                    active={sortBy === 'name'}
                    direction={sortBy === 'name' ? (order === 'ASC' ? 'asc' : 'desc') : 'asc'}
                    onClick={() => handleSort('name')}
                  >
                    User
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === 'phone'}
                    direction={sortBy === 'phone' ? (order === 'ASC' ? 'asc' : 'desc') : 'asc'}
                    onClick={() => handleSort('phone')}
                  >
                    Phone
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === 'role'}
                    direction={sortBy === 'role' ? (order === 'ASC' ? 'asc' : 'desc') : 'asc'}
                    onClick={() => handleSort('role')}
                  >
                    Role
                  </TableSortLabel>
                </TableCell>
                <TableCell>Verified Host</TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === 'createdAt'}
                    direction={sortBy === 'createdAt' ? (order === 'ASC' ? 'asc' : 'desc') : 'asc'}
                    onClick={() => handleSort('createdAt')}
                  >
                    Joined
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && !data ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={32} />
                  </TableCell>
                </TableRow>
              ) : !data?.users.items.length ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">No users found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                data.users.items.map((user) => (
                  <TableRow key={user.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <Avatar src={user.avatar} sx={{ width: 36, height: 36 }}>
                          {user.name?.[0] || '?'}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600} noWrap>
                            {user.name || 'Unnamed'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {user.id}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{user.phone}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.role.replace('_', ' ')}
                        color={roleColor[user.role] || 'default'}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      {user.isVerifiedHost ? (
                        <Tooltip title="Verified Host">
                          <IconButton size="small" color="success">
                            <VerifiedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          —
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(user.createdAt)}
                      </Typography>
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
            count={data.users.total}
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

export default UsersPage;
