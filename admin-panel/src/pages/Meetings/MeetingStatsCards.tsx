import React from 'react';
import { Box, Card, Typography } from '@mui/material';

interface MeetingCounts {
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
}

interface MeetingStatsCardsProps {
  counts: MeetingCounts;
}

const STATS = [
  { key: 'pending' as const, label: 'Pending', color: '#f59e0b' },
  { key: 'confirmed' as const, label: 'Confirmed', color: '#3b82f6' },
  { key: 'completed' as const, label: 'Completed', color: '#10b981' },
  { key: 'cancelled' as const, label: 'Cancelled', color: '#6b7280' },
];

const MeetingStatsCards: React.FC<MeetingStatsCardsProps> = ({ counts }) => (
  <Box display="flex" gap={2} mb={3} flexWrap="wrap">
    {STATS.map((s) => (
      <Card key={s.label} sx={{ flex: '1 1 120px', p: 2, borderLeft: `4px solid ${s.color}` }}>
        <Typography variant="caption" color="text.secondary">
          {s.label}
        </Typography>
        <Typography variant="h5" fontWeight={700}>
          {counts[s.key]}
        </Typography>
      </Card>
    ))}
  </Box>
);

export default MeetingStatsCards;
