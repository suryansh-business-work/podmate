import React, { useCallback, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Grid from '@mui/material/Grid2';
import HomeIcon from '@mui/icons-material/Home';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useQuery, useMutation } from '@apollo/client';
import { GET_USER, GET_USER_HOSTED_PODS, GET_USER_JOINED_PODS } from '../../graphql/queries';
import { ADMIN_UPDATE_USER } from '../../graphql/mutations';
import UserProfileCard from './UserProfileCard';
import UserEditForm from './UserEditForm';
import UserPodsTable from './UserPodsTable';
import type { UserDetail, AdminUpdateUserInput, PodSummary } from './UserDetail.types';

const UserDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [snack, setSnack] = useState('');

  const { data, loading, error } = useQuery<{ user: UserDetail }>(GET_USER, {
    variables: { id },
    skip: !id,
  });

  const { data: hostedData, loading: hostedLoading } = useQuery<{
    userHostedPods: PodSummary[];
  }>(GET_USER_HOSTED_PODS, {
    variables: { userId: id },
    skip: !id,
  });

  const { data: joinedData, loading: joinedLoading } = useQuery<{
    userJoinedPods: PodSummary[];
  }>(GET_USER_JOINED_PODS, {
    variables: { userId: id },
    skip: !id,
  });

  const [adminUpdateUser, { loading: saving }] = useMutation(ADMIN_UPDATE_USER);

  const user = data?.user;
  const hostedPods: PodSummary[] = hostedData?.userHostedPods ?? [];
  const joinedPods: PodSummary[] = joinedData?.userJoinedPods ?? [];

  const handleSave = useCallback(
    async (values: AdminUpdateUserInput) => {
      if (!id) return;
      try {
        await adminUpdateUser({
          variables: { userId: id, input: values },
          refetchQueries: [{ query: GET_USER, variables: { id } }],
        });
        setSnack('User updated successfully');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update user';
        setSnack(message);
      }
    },
    [id, adminUpdateUser],
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={10}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) return <Alert severity="error">{error.message}</Alert>;
  if (!user) return <Alert severity="warning">User not found</Alert>;

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
        {/* Left column: Profile Card */}
        <Grid size={{ xs: 12, md: 4 }}>
          <UserProfileCard user={user} />
        </Grid>

        {/* Right column: Edit Form */}
        <Grid size={{ xs: 12, md: 8 }}>
          <UserEditForm user={user} saving={saving} onSave={handleSave} />
        </Grid>

        {/* Hosted Pods */}
        <Grid size={{ xs: 12, md: 6 }}>
          <UserPodsTable title="Hosted Pods" pods={hostedPods} loading={hostedLoading} />
        </Grid>

        {/* Joined Pods */}
        <Grid size={{ xs: 12, md: 6 }}>
          <UserPodsTable
            title="Joined Pods"
            pods={joinedPods}
            loading={joinedLoading}
            showHost
          />
        </Grid>
      </Grid>

      <Snackbar
        open={!!snack}
        autoHideDuration={4000}
        onClose={() => setSnack('')}
        message={snack}
      />
    </Box>
  );
};

export default UserDetailPage;
