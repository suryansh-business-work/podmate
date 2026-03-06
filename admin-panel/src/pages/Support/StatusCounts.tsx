import React from 'react';
import { Box, Card, Typography, useTheme } from '@mui/material';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArchiveIcon from '@mui/icons-material/Archive';

interface StatusCountsProps {
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
}

const cards = [
  { key: 'open' as const, label: 'Open', Icon: ReportProblemIcon, color: '#ed6c02' },
  { key: 'inProgress' as const, label: 'In Progress', Icon: HourglassTopIcon, color: '#0288d1' },
  { key: 'resolved' as const, label: 'Resolved', Icon: CheckCircleIcon, color: '#2e7d32' },
  { key: 'closed' as const, label: 'Closed', Icon: ArchiveIcon, color: '#757575' },
];

const StatusCounts: React.FC<StatusCountsProps> = (counts) => {
  const theme = useTheme();

  return (
    <Box display="flex" gap={2} mb={3} flexWrap="wrap">
      {cards.map(({ key, label, Icon, color }) => (
        <Card
          key={key}
          sx={{
            flex: '1 1 180px',
            p: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            borderLeft: `4px solid ${color}`,
            bgcolor: theme.palette.mode === 'dark' ? undefined : '#fff',
          }}
        >
          <Icon sx={{ fontSize: 36, color }} />
          <Box>
            <Typography variant="h5" fontWeight={700}>
              {counts[key]}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {label}
            </Typography>
          </Box>
        </Card>
      ))}
    </Box>
  );
};

export default StatusCounts;
