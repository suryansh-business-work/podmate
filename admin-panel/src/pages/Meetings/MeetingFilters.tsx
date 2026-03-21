import React from 'react';
import { Box, TextField, MenuItem, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface MeetingFiltersProps {
  searchInput: string;
  statusFilter: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

const MeetingFilters: React.FC<MeetingFiltersProps> = ({
  searchInput,
  statusFilter,
  onSearchChange,
  onStatusChange,
}) => (
  <Box display="flex" gap={2} mb={3} flexWrap="wrap">
    <TextField
      size="small"
      placeholder="Search by email or date…"
      value={searchInput}
      onChange={(e) => onSearchChange(e.target.value)}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        },
      }}
      sx={{ minWidth: 250 }}
    />
    <TextField
      select
      size="small"
      label="Status"
      value={statusFilter}
      onChange={(e) => onStatusChange(e.target.value)}
      sx={{ minWidth: 150 }}
    >
      <MenuItem value="">All</MenuItem>
      <MenuItem value="PENDING">Pending</MenuItem>
      <MenuItem value="CONFIRMED">Confirmed</MenuItem>
      <MenuItem value="COMPLETED">Completed</MenuItem>
      <MenuItem value="CANCELLED">Cancelled</MenuItem>
    </TextField>
  </Box>
);

export default MeetingFilters;
