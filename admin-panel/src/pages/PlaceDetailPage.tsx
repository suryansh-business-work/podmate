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
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VerifiedIcon from '@mui/icons-material/Verified';
import { useQuery } from '@apollo/client';
import { GET_PLACE } from '../graphql/queries';

interface Owner {
  id: string;
  name: string;
  phone: string;
}

interface PlaceDetail {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  imageUrl: string;
  mediaUrls: string[];
  owner: Owner;
  category: string;
  phone: string;
  email: string;
  status: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

const statusColor: Record<string, 'warning' | 'success' | 'error' | 'default'> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'error',
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

const PlaceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, loading, error } = useQuery<{ place: PlaceDetail }>(GET_PLACE, {
    variables: { id },
    skip: !id,
  });

  const place = data?.place;

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  if (loading)
    return (
      <Box display="flex" justifyContent="center" py={10}>
        <CircularProgress />
      </Box>
    );
  if (error) return <Alert severity="error">{error.message}</Alert>;
  if (!place) return <Alert severity="warning">Place not found</Alert>;

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
          onClick={() => navigate('/places')}
        >
          Places
        </Link>
        <Typography color="text.primary" fontWeight={600}>
          {place.name}
        </Typography>
      </Breadcrumbs>

      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/places')}>
          Back
        </Button>
        <Typography variant="h5" fontWeight={700}>
          Place Detail
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Image + Basic Info */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Avatar
                variant="rounded"
                src={place.imageUrl}
                sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
              />
              <Typography variant="h6" fontWeight={700}>
                {place.name}
              </Typography>
              <Box display="flex" justifyContent="center" gap={1} mt={1}>
                <Chip label={place.category} size="small" variant="outlined" />
                <Chip
                  label={place.status}
                  size="small"
                  color={statusColor[place.status] || 'default'}
                />
                {place.isVerified && (
                  <Chip
                    icon={<VerifiedIcon />}
                    label="Verified"
                    size="small"
                    color="success"
                    variant="outlined"
                  />
                )}
              </Box>
              <Typography variant="body2" color="text.secondary" mt={2}>
                {place.description}
              </Typography>
            </CardContent>
          </Card>

          {/* Media Gallery */}
          {place.mediaUrls.length > 0 && (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" mb={1}>
                  Media ({place.mediaUrls.length})
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap">
                  {place.mediaUrls.map((url, i) => (
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
              <Typography variant="h6" mb={2}>
                Details
              </Typography>
              <Divider sx={{ mb: 1 }} />
              <InfoRow label="Place ID" value={place.id} />
              <InfoRow label="Address" value={place.address} />
              <InfoRow label="City" value={place.city} />
              <InfoRow label="Phone" value={place.phone || '—'} />
              <InfoRow label="Email" value={place.email || '—'} />
              <InfoRow label="Registered" value={formatDate(place.createdAt)} />
              <InfoRow label="Last Updated" value={formatDate(place.updatedAt)} />

              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" mb={1}>
                Owner
              </Typography>
              <Box display="flex" alignItems="center" gap={1.5}>
                <Avatar sx={{ width: 36, height: 36 }}>{place.owner?.name?.[0] || '?'}</Avatar>
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    {place.owner?.name || 'Unknown'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {place.owner?.phone || ''}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PlaceDetailPage;
