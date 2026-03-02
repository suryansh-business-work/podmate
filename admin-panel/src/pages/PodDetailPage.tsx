import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link,
  Button,
  Divider,
  Grid2 as Grid,
  LinearProgress,
  AvatarGroup,
  Tooltip,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useQuery } from '@apollo/client';
import { GET_POD } from '../graphql/queries';

interface Host {
  id: string;
  name: string;
  avatar: string;
  isVerifiedHost: boolean;
}

interface Attendee {
  id: string;
  name: string;
  avatar: string;
}

interface PodDetail {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  mediaUrls: string[];
  feePerPerson: number;
  maxSeats: number;
  currentSeats: number;
  dateTime: string;
  location: string;
  locationDetail: string;
  rating: number;
  reviewCount: number;
  status: string;
  refundPolicy: string;
  createdAt: string;
  host: Host;
  attendees: Attendee[];
}

const statusColor: Record<string, 'success' | 'warning' | 'info' | 'default' | 'error'> = {
  NEW: 'info', CONFIRMED: 'success', PENDING: 'warning', COMPLETED: 'default', CANCELLED: 'error',
};

const InfoRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <Box display="flex" justifyContent="space-between" py={1}>
    <Typography variant="body2" color="text.secondary" fontWeight={500}>{label}</Typography>
    <Typography variant="body2" fontWeight={600}>{value}</Typography>
  </Box>
);

const PodDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, loading, error } = useQuery<{ pod: PodDetail }>(GET_POD, {
    variables: { id },
    skip: !id,
  });

  const pod = data?.pod;

  const formatDateTime = (d: string) => new Date(d).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  if (loading) return <Box display="flex" justifyContent="center" py={10}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error.message}</Alert>;
  if (!pod) return <Alert severity="warning">Pod not found</Alert>;

  const fillPercent = Math.round((pod.currentSeats / pod.maxSeats) * 100);

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} color="inherit" onClick={() => navigate('/dashboard')}>
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" /> Dashboard
        </Link>
        <Link underline="hover" color="inherit" sx={{ cursor: 'pointer' }} onClick={() => navigate('/pods')}>Pods</Link>
        <Typography color="text.primary" fontWeight={600}>{pod.title}</Typography>
      </Breadcrumbs>

      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/pods')}>Back</Button>
        <Typography variant="h5" fontWeight={700}>Pod Detail</Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Image + Basic Info */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Avatar variant="rounded" src={pod.imageUrl} sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }} />
              <Typography variant="h6" fontWeight={700}>{pod.title}</Typography>
              <Box display="flex" justifyContent="center" gap={1} mt={1}>
                <Chip label={pod.category} size="small" variant="outlined" />
                <Chip label={pod.status} size="small" color={statusColor[pod.status] || 'default'} />
              </Box>
              <Typography variant="body2" color="text.secondary" mt={2}>{pod.description}</Typography>
            </CardContent>
          </Card>

          {/* Media Gallery */}
          {pod.mediaUrls.length > 0 && (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" mb={1}>Media ({pod.mediaUrls.length})</Typography>
                <Box display="flex" gap={1} flexWrap="wrap">
                  {pod.mediaUrls.map((url, i) => (
                    <Avatar key={i} variant="rounded" src={url} sx={{ width: 60, height: 60 }} />
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Details */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>Details</Typography>
              <Divider sx={{ mb: 1 }} />
              <InfoRow label="Pod ID" value={pod.id} />
              <InfoRow label="Fee Per Person" value={`₹${pod.feePerPerson.toLocaleString()}`} />
              <InfoRow label="Date & Time" value={formatDateTime(pod.dateTime)} />
              <InfoRow label="Location" value={pod.location} />
              <InfoRow label="Location Detail" value={pod.locationDetail || '—'} />
              <InfoRow label="Rating" value={`${pod.rating} (${pod.reviewCount} reviews)`} />
              <InfoRow label="Refund Policy" value={pod.refundPolicy || '—'} />
              <InfoRow label="Created" value={formatDateTime(pod.createdAt)} />

              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" mb={1}>
                Seats: {pod.currentSeats}/{pod.maxSeats} ({fillPercent}%)
              </Typography>
              <LinearProgress variant="determinate" value={fillPercent} sx={{ height: 8, borderRadius: 4, mb: 2 }} />

              {/* Host */}
              <Typography variant="subtitle2" mb={1}>Host</Typography>
              <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                <Avatar src={pod.host.avatar} sx={{ width: 36, height: 36 }}>{pod.host.name?.[0]}</Avatar>
                <Typography variant="body2" fontWeight={600}>{pod.host.name}</Typography>
              </Box>

              {/* Attendees */}
              <Typography variant="subtitle2" mb={1}>Attendees ({pod.attendees.length})</Typography>
              {pod.attendees.length > 0 ? (
                <AvatarGroup max={10} sx={{ justifyContent: 'flex-start', '& .MuiAvatar-root': { width: 32, height: 32, fontSize: 13 } }}>
                  {pod.attendees.map((a) => (
                    <Tooltip key={a.id} title={a.name}>
                      <Avatar src={a.avatar}>{a.name?.[0]}</Avatar>
                    </Tooltip>
                  ))}
                </AvatarGroup>
              ) : (
                <Typography variant="body2" color="text.secondary">No attendees yet</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PodDetailPage;
