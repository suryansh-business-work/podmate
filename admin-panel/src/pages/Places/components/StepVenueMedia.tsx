import React from 'react';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import type { MediaItem } from '../../../components/AdminMediaUploader';
import AdminMediaUploader from '../../../components/AdminMediaUploader';

interface StepVenueMediaProps {
  mediaItems: MediaItem[];
  onMediaChange: (items: MediaItem[]) => void;
}

const StepVenueMedia: React.FC<StepVenueMediaProps> = ({ mediaItems, onMediaChange }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
    <Alert severity="info">
      Upload images of the venue. The first image will be the cover photo.
    </Alert>
    <Typography variant="subtitle2">Venue Photos</Typography>
    <AdminMediaUploader
      folder="/places"
      maxItems={6}
      label="Upload Venue Photos"
      mediaItems={mediaItems}
      onMediaChange={onMediaChange}
    />
    <Typography variant="caption" color="text.secondary">
      Supported formats: JPG, PNG, WebP. Maximum 6 photos.
    </Typography>
  </Box>
);

export default StepVenueMedia;
