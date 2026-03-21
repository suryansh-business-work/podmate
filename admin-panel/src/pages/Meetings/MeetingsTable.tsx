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
import ScheduleIcon from '@mui/icons-material/Schedule';
import type { Meeting, MeetingPurpose, MeetingOrder } from './Meetings.types';
import { MEETING_STATUS_COLORS, PURPOSE_LABELS, PURPOSE_COLORS } from './Meetings.types';
import { formatTimeDisplay } from './Meetings.utils';

const COLUMNS = [
  { id: 'userEmail', label: 'Email', sortable: false },
  { id: 'meetingDate', label: 'Date', sortable: true },
  { id: 'meetingTime', label: 'Time', sortable: false },
  { id: 'purpose', label: 'Purpose', sortable: false },
  { id: 'status', label: 'Status', sortable: true },
  { id: 'createdAt', label: 'Requested', sortable: true },
] as const;

interface MeetingsTableProps {
  items: Meeting[];
  total: number;
  page: number;
  rowsPerPage: number;
  sortBy: string;
  order: MeetingOrder;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
  onSort: (column: string) => void;
  onView: (meeting: Meeting) => void;
  onEdit: (meeting: Meeting) => void;
  onReschedule: (meeting: Meeting) => void;
  onDelete: (meeting: Meeting) => void;
}

const MeetingsTable: React.FC<MeetingsTableProps> = ({
  items,
  total,
  page,
  rowsPerPage,
  sortBy,
  order,
  onPageChange,
  onRowsPerPageChange,
  onSort,
  onView,
  onEdit,
  onReschedule,
  onDelete,
}) => (
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
                <Typography variant="body2">{formatTimeDisplay(meeting.meetingTime)}</Typography>
              </TableCell>
              <TableCell>
                <Chip
                  label={PURPOSE_LABELS[meeting.purpose as MeetingPurpose] ?? meeting.purpose}
                  size="small"
                  color={PURPOSE_COLORS[meeting.purpose as MeetingPurpose] ?? 'default'}
                  variant="outlined"
                />
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
                <IconButton size="small" onClick={() => onView(meeting)}>
                  <VisibilityIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => onEdit(meeting)}>
                  <EditIcon fontSize="small" />
                </IconButton>
                {(meeting.status === 'PENDING' || meeting.status === 'CONFIRMED') && (
                  <IconButton size="small" color="primary" onClick={() => onReschedule(meeting)}>
                    <ScheduleIcon fontSize="small" />
                  </IconButton>
                )}
                <IconButton size="small" color="error" onClick={() => onDelete(meeting)}>
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

export default MeetingsTable;
