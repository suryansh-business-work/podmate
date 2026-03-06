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
import { GET_USER } from '../graphql/queries';

interface UserDetail {
  id: string;
  phone: string;
  email: string;
  name: string;
  age: number;
  avatar: string;
  role: string;
  isVerifiedHost: boolean;
  isActive: boolean;
  disableReason: string;
  podCount: number;
  createdAt: string;
}

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

const UserDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, loading, error } = useQuery<{ user: UserDetail }>(GET_USER, {
    variables: { id },
    skip: !id,
  });

  const user = data?.user;

  const formatDate = (dateStr: string): string =>
    new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={10}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  if (!user) {
    return <Alert severity="warning">User not found</Alert>;
  }

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
          onClick={() => navigate('/users')}
        >
          Users
        </Link>
        <Typography color="text.primary" fontWeight={600}>
          {user.name}
        </Typography>
      </Breadcrumbs>

      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/users')}>
          Back
        </Button>
        <Typography variant="h5" fontWeight={700}>
          User Detail
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Profile Card */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Avatar src={user.avatar} sx={{ width: 80, height: 80, mx: 'auto', mb: 2 }}>
                {user.name?.[0] || '?'}
              </Avatar>
              <Typography variant="h6" fontWeight={700}>
                {user.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={1}>
                {user.phone}
              </Typography>
              <Box display="flex" justifyContent="center" gap={1} mb={1}>
                <Chip
                  label={user.role.replace('_', ' ')}
                  size="small"
                  color={
                    user.role === 'ADMIN'
                      ? 'error'
                      : user.role === 'PLACE_OWNER'
                        ? 'warning'
                        : 'default'
                  }
                />
                <Chip
                  label={user.isActive ? 'Active' : 'Disabled'}
                  size="small"
                  color={user.isActive ? 'success' : 'error'}
                  variant="outlined"
                />
              </Box>
              {user.isVerifiedHost && (
                <Chip
                  icon={<VerifiedIcon />}
                  label="Verified Host"
                  color="success"
                  size="small"
                  variant="outlined"
                />
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Info Card */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>
                Information
              </Typography>
              <Divider sx={{ mb: 1 }} />
              <InfoRow label="User ID" value={user.id} />
              <InfoRow label="Email" value={user.email || '—'} />
              <InfoRow label="Age" value={user.age || '—'} />
              <InfoRow label="Pod Count" value={user.podCount ?? 0} />
              <InfoRow label="Joined" value={formatDate(user.createdAt)} />
              {!user.isActive && (
                <>
                  <Divider sx={{ my: 1 }} />
                  <InfoRow
                    label="Disable Reason"
                    value={
                      <Typography variant="body2" color="error">
                        {user.disableReason}
                      </Typography>
                    }
                  />
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserDetailPage;
