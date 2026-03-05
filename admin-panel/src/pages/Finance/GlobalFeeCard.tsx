import React, { useState, useEffect } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import Skeleton from '@mui/material/Skeleton';
import SaveIcon from '@mui/icons-material/Save';

interface GlobalFeeCardProps {
  currentFee: number;
  loading: boolean;
  saving: boolean;
  onSave: (value: number) => Promise<void>;
}

const marks = [
  { value: 2, label: '2%' },
  { value: 5, label: '5%' },
  { value: 10, label: '10%' },
  { value: 15, label: '15%' },
];

const GlobalFeeCard: React.FC<GlobalFeeCardProps> = ({ currentFee, loading, saving, onSave }) => {
  const [value, setValue] = useState(currentFee);

  useEffect(() => {
    setValue(currentFee);
  }, [currentFee]);

  const hasChanged = value !== currentFee;

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Skeleton variant="text" width={200} height={32} />
          <Skeleton variant="rectangular" height={60} sx={{ mt: 2, borderRadius: 1 }} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Global Platform Fee
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          This fee applies to all transactions platform-wide unless overridden by a pincode-specific fee.
        </Typography>

        <Box sx={{ px: 1 }}>
          <Typography variant="h3" fontWeight={700} color="primary.main" textAlign="center" sx={{ mb: 2 }}>
            {value}%
          </Typography>
          <Slider
            value={value}
            onChange={(_, v) => setValue(v as number)}
            min={2}
            max={15}
            step={0.5}
            marks={marks}
            valueLabelDisplay="auto"
            valueLabelFormat={(v) => `${v}%`}
            sx={{ mb: 2 }}
          />
        </Box>

        <Stack direction="row" justifyContent="flex-end">
          <Button
            variant="contained"
            disabled={!hasChanged || saving}
            onClick={() => onSave(value)}
            startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
          >
            {saving ? 'Saving…' : 'Save Fee'}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default GlobalFeeCard;
