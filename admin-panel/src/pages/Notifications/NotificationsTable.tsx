import React from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import type { AdminNotification } from './Notifications.types';

interface NotificationsTableProps {
  notifications: AdminNotification[];
  total: number;
  page: number;
  rowsPerPage: number;
  loading: boolean;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
}

const NotificationsTable: React.FC<NotificationsTableProps> = ({
  notifications,
  total,
  page,
  rowsPerPage,
  loading,
  onPageChange,
  onRowsPerPageChange,
}) => (
  <TableContainer component={Paper}>
    {loading ? (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    ) : notifications.length === 0 ? (
      <Box p={4} textAlign="center">
        <NotificationsActiveIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
        <Typography color="text.secondary">No notifications sent yet</Typography>
      </Box>
    ) : (
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell>Message</TableCell>
            <TableCell>Recipients</TableCell>
            <TableCell>Sent At</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {notifications.map((n) => (
            <TableRow key={n.id}>
              <TableCell>
                <Typography variant="body2" fontWeight={600}>{n.title}</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400 }} noWrap>
                  {n.message}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip label={`${n.recipientCount} users`} size="small" color="primary" variant="outlined" />
              </TableCell>
              <TableCell>
                {new Date(n.sentAt).toLocaleString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )}
    <TablePagination
      component="div"
      count={total}
      page={page}
      onPageChange={(_, p) => onPageChange(p)}
      rowsPerPage={rowsPerPage}
      onRowsPerPageChange={(e) => onRowsPerPageChange(parseInt(e.target.value, 10))}
    />
  </TableContainer>
);

export default NotificationsTable;
