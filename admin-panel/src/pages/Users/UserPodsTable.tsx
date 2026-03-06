import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Link from '@mui/material/Link';
import { useNavigate } from 'react-router-dom';
import type { PodSummary } from './UserDetail.types';
import { STATUS_COLORS } from './UserDetail.types';

interface UserPodsTableProps {
  title: string;
  pods: PodSummary[];
  loading: boolean;
  showHost?: boolean;
}

const formatDate = (d: string): string =>
  new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

const UserPodsTable: React.FC<UserPodsTableProps> = ({ title, pods, loading, showHost }) => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" mb={2}>
          {title} ({pods.length})
        </Typography>
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress size={24} />
          </Box>
        ) : pods.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No pods found
          </Typography>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Seats</TableCell>
                  <TableCell>Fee</TableCell>
                  {showHost && <TableCell>Host</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {pods.map((pod) => (
                  <TableRow key={pod.id} hover sx={{ cursor: 'pointer' }}>
                    <TableCell>
                      <Link
                        underline="hover"
                        sx={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/pods/${pod.id}`)}
                      >
                        {pod.title}
                      </Link>
                    </TableCell>
                    <TableCell>{pod.category}</TableCell>
                    <TableCell>
                      <Chip
                        label={pod.status}
                        size="small"
                        color={STATUS_COLORS[pod.status] ?? 'default'}
                        sx={{ whiteSpace: 'nowrap' }}
                      />
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDate(pod.dateTime)}</TableCell>
                    <TableCell>
                      {pod.currentSeats}/{pod.maxSeats}
                    </TableCell>
                    <TableCell>₹{pod.feePerPerson}</TableCell>
                    {showHost && <TableCell>{pod.host?.name ?? '—'}</TableCell>}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default UserPodsTable;
