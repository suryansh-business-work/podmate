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
  AvatarGroup,
  Chip,
  Typography,
  Box,
  Tooltip,
  IconButton,
  CircularProgress,
  LinearProgress,
  Checkbox,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Pod, Order, statusColor, formatDate, formatTime } from './Pods.types';

interface PodsTableProps {
  pods: Pod[];
  loading: boolean;
  sortBy: string;
  order: Order;
  selectedIds: string[];
  onSort: (column: string) => void;
  onDeletePod: (id: string) => void;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
}

const PodsTable: React.FC<PodsTableProps> = ({ pods, loading, sortBy, order, selectedIds, onSort, onDeletePod, onToggleSelect, onToggleSelectAll }) => {
  const navigate = useNavigate();
  const sortDir = (col: string) => (sortBy === col ? (order === 'ASC' ? 'asc' : 'desc') : 'asc');
  const allSelected = pods.length > 0 && selectedIds.length === pods.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < pods.length;

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
              <TableSortLabel active={sortBy === 'title'} direction={sortDir('title')} onClick={() => onSort('title')}>Pod</TableSortLabel>
            </TableCell>
            <TableCell>Host</TableCell>
            <TableCell>
              <TableSortLabel active={sortBy === 'category'} direction={sortDir('category')} onClick={() => onSort('category')}>Category</TableSortLabel>
            </TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Fee</TableCell>
            <TableCell>Seats</TableCell>
            <TableCell>Attendees</TableCell>
            <TableCell>
              <TableSortLabel active={sortBy === 'dateTime'} direction={sortDir('dateTime')} onClick={() => onSort('dateTime')}>Date</TableSortLabel>
            </TableCell>
            <TableCell>Location</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={11} align="center" sx={{ py: 6 }}><CircularProgress size={32} /></TableCell>
            </TableRow>
          ) : !pods.length ? (
            <TableRow>
              <TableCell colSpan={11} align="center" sx={{ py: 6 }}>
                <Typography color="text.secondary">No pods found</Typography>
              </TableCell>
            </TableRow>
          ) : (
            pods.map((pod) => {
              const fillPercent = Math.round((pod.currentSeats / pod.maxSeats) * 100);
              const isSelected = selectedIds.includes(pod.id);
              return (
                <TableRow key={pod.id} hover selected={isSelected} sx={{ cursor: 'pointer', '&:last-child td': { border: 0 } }} onClick={() => navigate(`/pods/${pod.id}`)}>
                  <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                    <Checkbox size="small" checked={isSelected} onChange={() => onToggleSelect(pod.id)} />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Avatar variant="rounded" src={pod.imageUrl} sx={{ width: 40, height: 40 }} />
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={600} noWrap>{pod.title}</Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>{pod.id}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Tooltip title={pod.host.name}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Avatar src={pod.host.avatar} sx={{ width: 28, height: 28 }}>{pod.host.name?.[0]}</Avatar>
                        <Typography variant="body2" noWrap>{pod.host.name}</Typography>
                      </Box>
                    </Tooltip>
                  </TableCell>
                  <TableCell><Chip label={pod.category} size="small" variant="outlined" /></TableCell>
                  <TableCell><Chip label={pod.status} color={statusColor[pod.status] || 'default'} size="small" /></TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight={600}>₹{pod.feePerPerson.toLocaleString()}</Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ minWidth: 80 }}>
                      <Typography variant="caption" color="text.secondary">{pod.currentSeats}/{pod.maxSeats}</Typography>
                      <LinearProgress
                        variant="determinate"
                        value={fillPercent}
                        sx={{ height: 4, borderRadius: 2, mt: 0.5, bgcolor: 'grey.200', '& .MuiLinearProgress-bar': { bgcolor: fillPercent >= 80 ? 'warning.main' : 'primary.main' } }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    {pod.attendees.length > 0 ? (
                      <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 24, height: 24, fontSize: 11 } }}>
                        {pod.attendees.map((a) => (<Avatar key={a.id} src={a.avatar} sx={{ width: 24, height: 24 }}>{a.name?.[0]}</Avatar>))}
                      </AvatarGroup>
                    ) : (
                      <Typography variant="caption" color="text.secondary">None</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{formatDate(pod.dateTime)}</Typography>
                    <Typography variant="caption" color="text.secondary">{formatTime(pod.dateTime)}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" noWrap>{pod.location}</Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>{pod.locationDetail}</Typography>
                  </TableCell>
                  <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                    <Tooltip title="Delete Pod">
                      <IconButton size="small" color="error" onClick={() => onDeletePod(pod.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default PodsTable;
