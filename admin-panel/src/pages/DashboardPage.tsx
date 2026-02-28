import React from 'react';
import { Box, Typography, Grid, Card, CardContent } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
          <Typography variant="h4" fontWeight={700} mt={1}>
            {value}
          </Typography>
        </Box>
        <Box
          sx={{
            bgcolor: `${color}15`,
            borderRadius: 2,
            p: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const DashboardPage: React.FC = () => {
  const stats = [
    { title: 'Total Users', value: '1,254', icon: <PeopleIcon sx={{ color: '#5b4cdb', fontSize: 32 }} />, color: '#5b4cdb' },
    { title: 'Active Pods', value: '48', icon: <EventIcon sx={{ color: '#f97316', fontSize: 32 }} />, color: '#f97316' },
    { title: 'Monthly Revenue', value: '₹2.4L', icon: <AttachMoneyIcon sx={{ color: '#10b981', fontSize: 32 }} />, color: '#10b981' },
    { title: 'Growth', value: '+18%', icon: <TrendingUpIcon sx={{ color: '#6366f1', fontSize: 32 }} />, color: '#6366f1' },
  ];

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={3}>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        {stats.map((stat) => (
          <Grid key={stat.title} size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard {...stat} />
          </Grid>
        ))}
      </Grid>

      <Box mt={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} mb={2}>
              Recent Activity
            </Typography>
            <Typography color="text.secondary">
              No recent activity to display. Create pods and invite users to see activity here.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default DashboardPage;
