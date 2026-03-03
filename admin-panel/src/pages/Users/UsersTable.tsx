import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Avatar,
  Chip,
  Typography,
  Box,
  Tooltip,
  IconButton,
  CircularProgress,
  Select,
  MenuItem,
  Checkbox,
} from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import { useMutation } from '@apollo/client';
import { UPDATE_USER_ROLE } from '../../graphql/mutations';
import { User, Order, roleColor, formatDate } from './Users.types';

interface UsersTableProps {
  users: User[];
  loading: boolean;
  sortBy: string;
  order: Order;
  selectedIds: string[];
  onSort: (column: string) => void;
  onToggleUser: (user: User) => void;
  onDeleteUser: (id: string) => void;
  onRefetch: () => void;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
}

const UsersTable: React.FC<UsersTableProps> = ({
  users,
  loading,
  sortBy,
  order,
  selectedIds,
  onSort,
  onToggleUser,
  onDeleteUser,
  onRefetch,
  onToggleSelect,
  onToggleSelectAll,
}) => {
  const navigate = useNavigate();
  const [updateUserRole] = useMutation(UPDATE_USER_ROLE);
  const allSelected = users.length > 0 && selectedIds.length === users.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < users.length;

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateUserRole({ variables: { userId, role: newRole } });
      onRefetch();
    } catch {
      // Error handled silently - refetch shows current state
    }
  };

  const sortDir = (col: string) => (sortBy === col ? (order === 'ASC' ? 'asc' : 'desc') : 'asc');

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox
                indeterminate={someSelected}
                checked={allSelected}
                onChange={onToggleSelectAll}
                size="small"
              />
            </TableCell>
            <TableCell>
              <TableSortLabel active={sortBy === 'name'} direction={sortDir('name')} onClick={() => onSort('name')}>
                User
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel active={sortBy === 'phone'} direction={sortDir('phone')} onClick={() => onSort('phone')}>
                Phone
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel active={sortBy === 'role'} direction={sortDir('role')} onClick={() => onSort('role')}>
                Role
              </TableSortLabel>
            </TableCell>
            <TableCell align="center">Pods</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Verified</TableCell>
            <TableCell>
              <TableSortLabel active={sortBy === 'createdAt'} direction={sortDir('createdAt')} onClick={() => onSort('createdAt')}>
                Joined
              </TableSortLabel>
            </TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                <CircularProgress size={32} />
              </TableCell>
            </TableRow>
          ) : !users.length ? (
            <TableRow>
              <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                <Typography color="text.secondary">No users found</Typography>
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow
                key={user.id}
                hover
                selected={selectedIds.includes(user.id)}
                sx={{ cursor: 'pointer', '&:last-child td': { border: 0 } }}
                onClick={() => navigate(`/users/${user.id}`)}
              >
                <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                  <Checkbox size="small" checked={selectedIds.includes(user.id)} onChange={() => onToggleSelect(user.id)} />
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <Avatar src={user.avatar} sx={{ width: 36, height: 36 }}>{user.name?.[0] || '?'}</Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={600} noWrap>{user.name || 'Unnamed'}</Typography>
                      <Typography variant="caption" color="text.secondary">{user.id}</Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell><Typography variant="body2">{user.phone}</Typography></TableCell>
                <TableCell>
                  <Select
                    value={user.role}
                    size="small"
                    variant="standard"
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    sx={{ fontSize: 13 }}
                  >
                    <MenuItem value="USER">User</MenuItem>
                    <MenuItem value="PLACE_OWNER">Place Owner</MenuItem>
                    <MenuItem value="ADMIN">Admin</MenuItem>
                  </Select>
                </TableCell>
                <TableCell align="center">
                  <Chip label={user.podCount ?? 0} size="small" variant="outlined" />
                </TableCell>
                <TableCell>
                  <Chip
                    label={user.isActive ? 'Active' : 'Disabled'}
                    color={user.isActive ? 'success' : 'error'}
                    size="small"
                    variant="outlined"
                  />
                  {!user.isActive && user.disableReason && (
                    <Tooltip title={user.disableReason}>
                      <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }} noWrap>
                        {user.disableReason}
                      </Typography>
                    </Tooltip>
                  )}
                </TableCell>
                <TableCell>
                  {user.isVerifiedHost ? (
                    <Tooltip title="Verified Host">
                      <VerifiedIcon fontSize="small" color="success" />
                    </Tooltip>
                  ) : (
                    <Typography variant="body2" color="text.secondary">—</Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">{formatDate(user.createdAt)}</Typography>
                </TableCell>
                <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                  <Tooltip title={user.isActive ? 'Disable User' : 'Enable User'}>
                    <IconButton
                      size="small"
                      color={user.isActive ? 'error' : 'success'}
                      onClick={() => onToggleUser(user)}
                    >
                      {user.isActive ? <BlockIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete User">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => onDeleteUser(user.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default UsersTable;
