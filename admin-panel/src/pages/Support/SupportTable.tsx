import React from 'react';
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
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { SupportTicket, STATUS_COLORS, PRIORITY_COLORS, Order } from './Support.types';

interface SupportTableProps {
  tickets: SupportTicket[];
  total: number;
  page: number;
  rowsPerPage: number;
  sortBy: string;
  order: Order;
  onSort: (column: string) => void;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (size: number) => void;
  onView: (ticket: SupportTicket) => void;
  onEdit: (ticket: SupportTicket) => void;
  onDelete: (id: string) => void;
}

const COLUMNS = [
  { id: 'subject', label: 'Subject', sortable: true },
  { id: 'user', label: 'User', sortable: false },
  { id: 'status', label: 'Status', sortable: true },
  { id: 'priority', label: 'Priority', sortable: true },
  { id: 'createdAt', label: 'Date', sortable: true },
] as const;

const SupportTable: React.FC<SupportTableProps> = ({
  tickets,
  total,
  page,
  rowsPerPage,
  sortBy,
  order,
  onSort,
  onPageChange,
  onRowsPerPageChange,
  onView,
  onEdit,
  onDelete,
}) => (
  <Card>
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            {COLUMNS.map((col) => (
              <TableCell key={col.id} sx={{ fontWeight: 600 }}>
                {col.sortable ? (
                  <TableSortLabel
                    active={sortBy === col.id}
                    direction={sortBy === col.id ? (order === 'ASC' ? 'asc' : 'desc') : 'asc'}
                    onClick={() => onSort(col.id)}
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
          {tickets.map((ticket) => (
            <TableRow key={ticket.id} hover>
              <TableCell>
                <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 200 }}>
                  {ticket.subject}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{ticket.user?.name ?? 'Unknown'}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {ticket.user?.phone ?? ''}
                </Typography>
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
                <IconButton size="small" onClick={() => onView(ticket)}>
                  <VisibilityIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => onEdit(ticket)}>
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" color="error" onClick={() => onDelete(ticket.id)}>
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
      onPageChange={(_, p) => onPageChange(p)}
      rowsPerPage={rowsPerPage}
      onRowsPerPageChange={(e) => onRowsPerPageChange(parseInt(e.target.value, 10))}
      rowsPerPageOptions={[5, 10, 25]}
    />
  </Card>
);

export default SupportTable;
