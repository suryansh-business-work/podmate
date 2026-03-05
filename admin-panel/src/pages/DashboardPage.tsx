import React from 'react';
import {
  Box,
  Typography,
  Grid2 as Grid,
  Card,
  CardContent,
  CircularProgress,
  Breadcrumbs,
  Alert,
  Skeleton,
} from '@mui/material';
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
            <Skeleton variant="text" width={80} height={40} />
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
  const { data, loading, error } = useQuery<DashboardStatsData>(GET_DASHBOARD_STATS, {
    fetchPolicy: 'cache-and-network',
  });

  const statsData = data?.dashboardStats;

  const stats = [
    {
      title: 'Total Users',
      value: statsData ? statsData.totalUsers.toLocaleString() : '0',
      icon: <PeopleIcon sx={{ color: '#F50247', fontSize: 32 }} />,
      color: '#F50247',
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
      icon: <TrendingUpIcon sx={{ color: '#9333EA', fontSize: 32 }} />,
      color: '#9333EA',
    },
  ];

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Typography color="text.primary">Dashboard</Typography>
      </Breadcrumbs>

      <Typography variant="h5" fontWeight={700} mb={3}>
        Dashboard
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error.message}</Alert>}

      <Grid container spacing={3}>
        {stats.map((stat) => (
          <Grid key={stat.title} size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard {...stat} loading={loading} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default DashboardPage;
