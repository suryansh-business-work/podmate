import React, { useState, useCallback } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import SendIcon from '@mui/icons-material/Send';
import { GET_ADMIN_NOTIFICATIONS } from '../../graphql/queries';
import { SEND_BROADCAST_NOTIFICATION } from '../../graphql/mutations';
import type { PaginatedAdminNotifications, BroadcastNotificationResult } from './Notifications.types';
import SendNotificationDialog from './SendNotificationDialog';
import NotificationsTable from './NotificationsTable';

const NotificationsPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const { data, loading, error, refetch } = useQuery<PaginatedAdminNotifications>(GET_ADMIN_NOTIFICATIONS, {
    variables: { page: page + 1, limit: rowsPerPage },
    fetchPolicy: 'cache-and-network',
  });

  const [sendBroadcast, { loading: sending }] = useMutation<BroadcastNotificationResult>(SEND_BROADCAST_NOTIFICATION);

  const notifications = data?.adminNotifications?.items ?? [];
  const total = data?.adminNotifications?.total ?? 0;

  const handleSend = useCallback(
    async (title: string, message: string) => {
      const result = await sendBroadcast({ variables: { input: { title, message } } });
      const count = result.data?.sendBroadcastNotification?.recipientCount ?? 0;
      setSnackbar({ open: true, message: `Notification sent to ${count} users`, severity: 'success' });
      setDialogOpen(false);
      refetch();
    },
    [sendBroadcast, refetch],
  );

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" href="/dashboard">Dashboard</Link>
        <Typography color="text.primary">Notifications</Typography>
      </Breadcrumbs>

      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Notifications</Typography>
        <Button variant="contained" startIcon={<SendIcon />} onClick={() => setDialogOpen(true)}>
          Send Notification
        </Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error.message}</Alert>}

      <NotificationsTable
        notifications={notifications}
        total={total}
        page={page}
        rowsPerPage={rowsPerPage}
        loading={loading && !data}
        onPageChange={setPage}
        onRowsPerPageChange={(rpp: number) => { setRowsPerPage(rpp); setPage(0); }}
      />

      <SendNotificationDialog
        open={dialogOpen}
        sending={sending}
        onClose={() => setDialogOpen(false)}
        onSend={handleSend}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default NotificationsPage;
