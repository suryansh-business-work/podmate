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
  Chip,
  Typography,
  Box,
  Tooltip,
  IconButton,
  CircularProgress,
  Checkbox,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';
import VerifiedIcon from '@mui/icons-material/Verified';
import { Place, Order, statusColor, formatDate } from './Places.types';

interface PlacesTableProps {
  places: Place[];
  loading: boolean;
  sortBy: string;
  order: Order;
  selectedIds: string[];
  onSort: (column: string) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
}

const PlacesTable: React.FC<PlacesTableProps> = ({
  places,
  loading,
  sortBy,
  order,
  selectedIds,
  onSort,
  onApprove,
  onReject,
  onDelete,
  onToggleSelect,
  onToggleSelectAll,
}) => {
  const navigate = useNavigate();
  const sortDir = (col: string) => (sortBy === col ? (order === 'ASC' ? 'asc' : 'desc') : 'asc');
  const allSelected = places.length > 0 && selectedIds.length === places.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < places.length;

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
              <TableSortLabel
                active={sortBy === 'name'}
                direction={sortDir('name')}
                onClick={() => onSort('name')}
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
                direction={sortDir('createdAt')}
                onClick={() => onSort('createdAt')}
              >
                Registered
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
          ) : !places.length ? (
            <TableRow>
              <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                <Typography color="text.secondary">No places found</Typography>
              </TableCell>
            </TableRow>
          ) : (
            places.map((place) => (
              <TableRow
                key={place.id}
                hover
                selected={selectedIds.includes(place.id)}
                sx={{ cursor: 'pointer', '&:last-child td': { border: 0 } }}
                onClick={() => navigate(`/places/${place.id}`)}
              >
                <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    size="small"
                    checked={selectedIds.includes(place.id)}
                    onChange={() => onToggleSelect(place.id)}
                  />
                </TableCell>
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
                  <Typography variant="caption" color="text.secondary">
                    {place.owner?.phone || ''}
                  </Typography>
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
                    <Typography variant="body2" color="text.secondary">
                      —
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(place.createdAt)}
                  </Typography>
                </TableCell>
                <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                  <Box display="flex" justifyContent="center" gap={0.5}>
                    {place.status === 'PENDING' && (
                      <>
                        <Tooltip title="Approve">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => onApprove(place.id)}
                          >
                            <CheckCircleIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Reject">
                          <IconButton size="small" color="error" onClick={() => onReject(place.id)}>
                            <CancelIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                    {place.status === 'REJECTED' && (
                      <Tooltip title="Approve">
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => onApprove(place.id)}
                        >
                          <CheckCircleIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    {place.status === 'APPROVED' && (
                      <Tooltip title="Reject">
                        <IconButton size="small" color="warning" onClick={() => onReject(place.id)}>
                          <CancelIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => onDelete(place.id)}>
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
  );
};

export default PlacesTable;
