import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid2';
import LinearProgress from '@mui/material/LinearProgress';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Snackbar from '@mui/material/Snackbar';
import HomeIcon from '@mui/icons-material/Home';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import { useQuery, useMutation } from '@apollo/client';
import { GET_POD } from '../graphql/queries';
import { REMOVE_ATTENDEE, ADMIN_UPDATE_POD } from '../graphql/mutations';
import RemoveAttendeeDialog from './Pods/RemoveAttendeeDialog';
import PodEditForm from './Pods/PodEditForm';
import type { PodDetailData, AdminUpdatePodInput } from './Pods/PodDetail.types';

interface Attendee {
  id: string;
  name: string;
  avatar: string;
}

const statusColor: Record<string, 'success' | 'warning' | 'info' | 'default' | 'error'> = {
  NEW: 'info',
  CONFIRMED: 'success',
  PENDING: 'warning',
  COMPLETED: 'default',
  CANCELLED: 'error',
  OPEN: 'success',
  CLOSED: 'error',
};

const InfoRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <Box display="flex" justifyContent="space-between" py={1}>
    <Typography variant="body2" color="text.secondary" fontWeight={500}>
      {label}
    </Typography>
    <Typography variant="body2" fontWeight={600}>
      {value}
    </Typography>
  </Box>
);

const PodDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [removeTarget, setRemoveTarget] = useState<Attendee | null>(null);
  const [snackMsg, setSnackMsg] = useState('');

  const { data, loading, error } = useQuery<{ pod: PodDetailData }>(GET_POD, {
    variables: { id },
    skip: !id,
  });

  const [removeAttendeeMutation, { loading: removing }] = useMutation(REMOVE_ATTENDEE);
  const [adminUpdatePod, { loading: saving }] = useMutation(ADMIN_UPDATE_POD);

  const pod = data?.pod;

  const handleRemoveConfirm = useCallback(
    async (issueRefund: boolean) => {
      if (!removeTarget || !pod) return;
      try {
        const { data: result } = await removeAttendeeMutation({
          variables: { podId: pod.id, userId: removeTarget.id, issueRefund },
        });
        const refunded = result?.removeAttendee?.refunded;
        const amount = result?.removeAttendee?.refundAmount ?? 0;
        setSnackMsg(
          refunded
            ? `Removed ${removeTarget.name} and refunded ₹${amount.toLocaleString()}`
            : `Removed ${removeTarget.name} (no refund)`,
        );
        setRemoveTarget(null);
      } catch {
        /* Apollo error handler */
      }
    },
    [removeTarget, pod, removeAttendeeMutation],
  );

  const handleSavePod = useCallback(
    async (input: AdminUpdatePodInput) => {
      if (!id) return;
      try {
        await adminUpdatePod({
          variables: { id, input },
          refetchQueries: [{ query: GET_POD, variables: { id } }],
        });
        setSnackMsg('Pod updated successfully');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update pod';
        setSnackMsg(message);
      }
    },
    [id, adminUpdatePod],
  );

  const formatDateTime = (d: string) =>
    new Date(d).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  if (loading)
    return (
      <Box display="flex" justifyContent="center" py={10}>
        <CircularProgress />
      </Box>
    );
  if (error) return <Alert severity="error">{error.message}</Alert>;
  if (!pod) return <Alert severity="warning">Pod not found</Alert>;

  const fillPercent = Math.round((pod.currentSeats / pod.maxSeats) * 100);

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          underline="hover"
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          color="inherit"
          onClick={() => navigate('/dashboard')}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" /> Dashboard
        </Link>
        <Link
          underline="hover"
          color="inherit"
          sx={{ cursor: 'pointer' }}
          onClick={() => navigate('/pods')}
        >
          Pods
        </Link>
        <Typography color="text.primary" fontWeight={600}>
          {pod.title}
        </Typography>
      </Breadcrumbs>

      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/pods')}>
          Back
        </Button>
        <Typography variant="h5" fontWeight={700}>
          Pod Detail
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Image + Basic Info */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Avatar
                variant="rounded"
                src={pod.imageUrl}
                sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
              />
              <Typography variant="h6" fontWeight={700}>
                {pod.title}
              </Typography>
              <Box display="flex" justifyContent="center" gap={1} mt={1}>
                <Chip label={pod.category} size="small" variant="outlined" />
                <Chip
                  label={pod.status}
                  size="small"
                  color={statusColor[pod.status] || 'default'}
                />
              </Box>
              <Typography variant="body2" color="text.secondary" mt={2}>
                {pod.description}
              </Typography>
            </CardContent>
          </Card>

          {/* Media Gallery */}
          {pod.mediaUrls.length > 0 && (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" mb={1}>
                  Media ({pod.mediaUrls.length})
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap">
                  {pod.mediaUrls.map((url, i) => (
                    <Avatar key={i} variant="rounded" src={url} sx={{ width: 60, height: 60 }} />
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Info Card */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" mb={1}>
                Details
              </Typography>
              <Divider sx={{ mb: 1 }} />
              <InfoRow label="Pod ID" value={pod.id} />
              <InfoRow label="Fee Per Person" value={`₹${pod.feePerPerson.toLocaleString()}`} />
              <InfoRow label="Date & Time" value={formatDateTime(pod.dateTime)} />
              <InfoRow label="Location" value={pod.location} />
              <InfoRow label="Location Detail" value={pod.locationDetail || '—'} />
              <InfoRow label="Rating" value={`${pod.rating} (${pod.reviewCount} reviews)`} />
              <InfoRow label="Refund Policy" value={pod.refundPolicy || '—'} />
              <InfoRow label="Views" value={String(pod.viewCount)} />
              <InfoRow label="Created" value={formatDateTime(pod.createdAt)} />

              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" mb={1}>
                Seats: {pod.currentSeats}/{pod.maxSeats} ({fillPercent}%)
              </Typography>
              <LinearProgress
                variant="determinate"
                value={fillPercent}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column: Edit Form + Host + Attendees */}
        <Grid size={{ xs: 12, md: 8 }}>
          <PodEditForm pod={pod} saving={saving} onSave={handleSavePod} />

          {/* Host */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" mb={1}>
                Host
              </Typography>
              <Box display="flex" alignItems="center" gap={1.5}>
                <Avatar src={pod.host.avatar} sx={{ width: 36, height: 36 }}>
                  {pod.host.name?.[0]}
                </Avatar>
                <Link
                  underline="hover"
                  sx={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/users/${pod.host.id}`)}
                >
                  <Typography variant="body2" fontWeight={600}>
                    {pod.host.name}
                  </Typography>
                </Link>
              </Box>
            </CardContent>
          </Card>

          {/* Attendees */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" mb={1}>
                Attendees ({pod.attendees.length})
              </Typography>
              {pod.attendees.length > 0 ? (
                <List dense disablePadding>
                  {pod.attendees.map((a) => (
                    <ListItem
                      key={a.id}
                      secondaryAction={
                        <Tooltip title="Remove attendee">
                          <IconButton
                            edge="end"
                            color="warning"
                            size="small"
                            onClick={() => setRemoveTarget(a)}
                          >
                            <PersonRemoveIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      }
                      sx={{ px: 0 }}
                    >
                      <ListItemAvatar>
                        <Avatar src={a.avatar} sx={{ width: 32, height: 32 }}>
                          {a.name?.[0]}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Link
                            underline="hover"
                            sx={{ cursor: 'pointer' }}
                            onClick={() => navigate(`/users/${a.id}`)}
                          >
                            {a.name}
                          </Link>
                        }
                        primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No attendees yet
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <RemoveAttendeeDialog
        open={!!removeTarget}
        attendee={removeTarget}
        podTitle={pod.title}
        feePerPerson={pod.feePerPerson}
        loading={removing}
        onClose={() => setRemoveTarget(null)}
        onConfirm={handleRemoveConfirm}
      />

      <Snackbar
        open={!!snackMsg}
        autoHideDuration={4000}
        onClose={() => setSnackMsg('')}
        message={snackMsg}
      />
    </Box>
  );
};

export default PodDetailPage;
