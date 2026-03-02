import React from 'react';
import { Box, Typography, Grid2 as Grid, Card, CardContent, CircularProgress } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { useQuery } from '@apollo/client';
import { GET_DASHBOARD_STATS } from '../graphql/queries';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, loading }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
          {loading ? (
            <CircularProgress size={28} sx={{ mt: 1 }} />
          ) : (
            <Typography variant="h4" fontWeight={700} mt={1}>
              {value}
            </Typography>
          )}
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

interface DashboardStatsData {
  dashboardStats: {
    totalUsers: number;
    totalPods: number;
    activePods: number;
    totalRevenue: number;
  };
}

const DashboardPage: React.FC = () => {
  const { data, loading } = useQuery<DashboardStatsData>(GET_DASHBOARD_STATS, {
    fetchPolicy: 'cache-and-network',
  });

  const statsData = data?.dashboardStats;

  const stats = [
    {
      title: 'Total Users',
      value: statsData ? statsData.totalUsers.toLocaleString() : '0',
      icon: <PeopleIcon sx={{ color: '#5b4cdb', fontSize: 32 }} />,
      color: '#5b4cdb',
    },
    {
      title: 'Active Pods',
      value: statsData ? statsData.activePods.toString() : '0',
      icon: <EventIcon sx={{ color: '#f97316', fontSize: 32 }} />,
      color: '#f97316',
    },
    {
      title: 'Total Revenue',
      value: statsData ? `₹${statsData.totalRevenue.toLocaleString()}` : '₹0',
      icon: <AttachMoneyIcon sx={{ color: '#10b981', fontSize: 32 }} />,
      color: '#10b981',
    },
    {
      title: 'Total Pods',
      value: statsData ? statsData.totalPods.toString() : '0',
      icon: <TrendingUpIcon sx={{ color: '#6366f1', fontSize: 32 }} />,
      color: '#6366f1',
    },
  ];

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={3}>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        {stats.map((stat) => (
          <Grid key={stat.title} size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard {...stat} loading={loading} />
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
