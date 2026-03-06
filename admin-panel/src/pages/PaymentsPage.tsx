import React, { useState, useCallback } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Stack from '@mui/material/Stack';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid2';
import { GET_PAYMENTS, GET_PAYMENT_STATS } from '../graphql/queries';
import { PROCESS_REFUND, COMPLETE_PAYMENT } from '../graphql/mutations';

interface Payment {
  id: string;
  userId: string;
  podId: string;
  amount: number;
  type: string;
  status: string;
  transactionId: string;
  gateway: string;
  notes: string;
  refundAmount: number;
  createdAt: string;
  user: { id: string; name: string; phone: string } | null;
}

interface PaymentStats {
  totalRevenue: number;
  totalRefunds: number;
  netRevenue: number;
  totalTransactions: number;
  pendingPayments: number;
}

const statusColors: Record<string, 'success' | 'warning' | 'error'> = {
  COMPLETED: 'success',
  PENDING: 'warning',
  FAILED: 'error',
};

const typeColors: Record<string, 'primary' | 'error' | 'warning'> = {
  PAYMENT: 'primary',
  REFUND: 'error',
  PARTIAL_REFUND: 'warning',
};

const PaymentsPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [refundDialog, setRefundDialog] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundNotes, setRefundNotes] = useState('');

  const { data, loading, error, refetch } = useQuery(GET_PAYMENTS, {
    variables: {
      page: page + 1,
      limit: rowsPerPage,
      search: search || undefined,
      type: typeFilter || undefined,
      status: statusFilter || undefined,
    },
    fetchPolicy: 'cache-and-network',
  });

  const { data: statsData } = useQuery(GET_PAYMENT_STATS, { fetchPolicy: 'cache-and-network' });

  const [processRefund] = useMutation(PROCESS_REFUND);
  const [completePayment] = useMutation(COMPLETE_PAYMENT);

  const payments: Payment[] = data?.payments?.items ?? [];
  const total = data?.payments?.total ?? 0;
  const stats: PaymentStats | null = statsData?.paymentStats ?? null;

  const handleRefund = useCallback((payment: Payment) => {
    setSelectedPayment(payment);
    setRefundAmount(String(payment.amount - payment.refundAmount));
    setRefundNotes('');
    setRefundDialog(true);
  }, []);

  const handleProcessRefund = useCallback(async () => {
    if (!selectedPayment) return;
    await processRefund({
      variables: {
        input: {
          paymentId: selectedPayment.id,
          amount: parseFloat(refundAmount),
          notes: refundNotes,
        },
      },
    });
    setRefundDialog(false);
    refetch();
  }, [selectedPayment, refundAmount, refundNotes, processRefund, refetch]);

  const handleCompletePayment = useCallback(
    async (id: string) => {
      await completePayment({ variables: { id } });
      refetch();
    },
    [completePayment, refetch],
  );

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" href="/dashboard">
          Dashboard
        </Link>
        <Typography color="text.primary">Payments</Typography>
      </Breadcrumbs>

      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        Payments
      </Typography>

      {stats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <Card>
              <CardContent>
                <Typography variant="caption" color="text.secondary">
                  Total Revenue
                </Typography>
                <Typography variant="h6" fontWeight={700}>
                  ₹{stats.totalRevenue.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <Card>
              <CardContent>
                <Typography variant="caption" color="text.secondary">
                  Total Refunds
                </Typography>
                <Typography variant="h6" fontWeight={700} color="error">
                  ₹{stats.totalRefunds.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <Card>
              <CardContent>
                <Typography variant="caption" color="text.secondary">
                  Net Revenue
                </Typography>
                <Typography variant="h6" fontWeight={700} color="success.main">
                  ₹{stats.netRevenue.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <Card>
              <CardContent>
                <Typography variant="caption" color="text.secondary">
                  Transactions
                </Typography>
                <Typography variant="h6" fontWeight={700}>
                  {stats.totalTransactions}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <Card>
              <CardContent>
                <Typography variant="caption" color="text.secondary">
                  Pending
                </Typography>
                <Typography variant="h6" fontWeight={700} color="warning.main">
                  {stats.pendingPayments}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Paper sx={{ mb: 2, p: 2 }}>
        <Stack direction="row" spacing={2} flexWrap="wrap">
          <TextField
            size="small"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ minWidth: 200 }}
          />
          <FormControl size="small" sx={{ minWidth: 120, zIndex: 2 }}>
            <InputLabel>Type</InputLabel>
            <Select
              label="Type"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              MenuProps={{ disablePortal: false }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="PAYMENT">Payment</MenuItem>
              <MenuItem value="REFUND">Refund</MenuItem>
              <MenuItem value="PARTIAL_REFUND">Partial Refund</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120, zIndex: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              MenuProps={{ disablePortal: false }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="PENDING">Pending</MenuItem>
              <MenuItem value="COMPLETED">Completed</MenuItem>
              <MenuItem value="FAILED">Failed</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error.message}
        </Alert>
      )}

      <TableContainer component={Paper}>
        {loading && !data ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : payments.length === 0 ? (
          <Box p={4} textAlign="center">
            <Typography color="text.secondary">No payments found</Typography>
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Transaction ID</TableCell>
                <TableCell>Refunded</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.user?.name ?? p.userId}</TableCell>
                  <TableCell>₹{p.amount.toLocaleString()}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    <Chip label={p.type} size="small" color={typeColors[p.type] ?? 'default'} sx={{ whiteSpace: 'nowrap' }} />
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    <Chip
                      label={p.status}
                      size="small"
                      color={statusColors[p.status] ?? 'default'}
                      sx={{ whiteSpace: 'nowrap' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">{p.transactionId || '—'}</Typography>
                  </TableCell>
                  <TableCell>{p.refundAmount > 0 ? `₹${p.refundAmount}` : '—'}</TableCell>
                  <TableCell>{new Date(p.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      {p.status === 'PENDING' && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleCompletePayment(p.id)}
                        >
                          Complete
                        </Button>
                      )}
                      {p.status === 'COMPLETED' &&
                        p.type === 'PAYMENT' &&
                        p.refundAmount < p.amount && (
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => handleRefund(p)}
                          >
                            Refund
                          </Button>
                        )}
                    </Stack>
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
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </TableContainer>

      <Dialog open={refundDialog} onClose={() => setRefundDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Process Refund</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography>
              Original amount: ₹{selectedPayment?.amount.toLocaleString()}
              {selectedPayment &&
                selectedPayment.refundAmount > 0 &&
                ` (Already refunded: ₹${selectedPayment.refundAmount})`}
            </Typography>
            <TextField
              label="Refund Amount"
              type="number"
              value={refundAmount}
              onChange={(e) => setRefundAmount(e.target.value)}
              fullWidth
            />
            <TextField
              label="Notes"
              value={refundNotes}
              onChange={(e) => setRefundNotes(e.target.value)}
              multiline
              rows={2}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRefundDialog(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleProcessRefund}>
            Process Refund
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PaymentsPage;
