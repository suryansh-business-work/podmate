import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import VerifiedIcon from '@mui/icons-material/Verified';
import type { UserDetail } from './UserDetail.types';

interface UserProfileCardProps {
  user: UserDetail;
}

const roleColors: Record<string, 'error' | 'warning' | 'default' | 'info'> = {
  ADMIN: 'error',
  VENUE_OWNER: 'warning',
  HOST: 'info',
  USER: 'default',
};

const formatDate = (dateStr: string): string =>
  new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

const UserProfileCard: React.FC<UserProfileCardProps> = ({ user }) => (
  <Card>
    <CardContent sx={{ textAlign: 'center', py: 4 }}>
      <Avatar src={user.avatar} sx={{ width: 96, height: 96, mx: 'auto', mb: 2 }}>
        {user.name?.[0] || '?'}
      </Avatar>
      <Typography variant="h6" fontWeight={700}>
        {user.name}
      </Typography>
      {user.username && (
        <Typography variant="body2" color="text.secondary">
          @{user.username}
        </Typography>
      )}
      <Typography variant="body2" color="text.secondary" mt={0.5}>
        {user.phone}
      </Typography>

      <Stack direction="row" justifyContent="center" spacing={1} mt={1.5} flexWrap="wrap">
        {user.roles.map((r) => (
          <Chip
            key={r}
            label={r.replace('_', ' ')}
            size="small"
            color={roleColors[r] ?? 'default'}
          />
        ))}
        <Chip
          label={user.isActive ? 'Active' : 'Disabled'}
          size="small"
          color={user.isActive ? 'success' : 'error'}
          variant="outlined"
        />
      </Stack>

      {user.isVerifiedHost && (
        <Chip
          icon={<VerifiedIcon />}
          label="Verified Host"
          color="success"
          size="small"
          variant="outlined"
          sx={{ mt: 1 }}
        />
      )}

      <Divider sx={{ my: 2 }} />

      <Box textAlign="left" px={1}>
        <InfoLine label="User ID" value={user.id} />
        <InfoLine label="Email" value={user.email || '—'} />
        <InfoLine label="DOB" value={user.dob || '—'} />
        <InfoLine label="Pod Count" value={String(user.podCount ?? 0)} />
        <InfoLine label="Theme" value={user.themePreference ?? 'light'} />
        <InfoLine label="Joined" value={formatDate(user.createdAt)} />
        {!user.isActive && user.disableReason && (
          <InfoLine label="Disable Reason" value={user.disableReason} isError />
        )}
      </Box>
    </CardContent>
  </Card>
);

const InfoLine: React.FC<{ label: string; value: string; isError?: boolean }> = ({
  label,
  value,
  isError,
}) => (
  <Box display="flex" justifyContent="space-between" py={0.5}>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    <Typography
      variant="caption"
      fontWeight={600}
      color={isError ? 'error' : 'text.primary'}
      sx={{ maxWidth: '60%', wordBreak: 'break-all', textAlign: 'right' }}
    >
      {value}
    </Typography>
  </Box>
);

export default UserProfileCard;
