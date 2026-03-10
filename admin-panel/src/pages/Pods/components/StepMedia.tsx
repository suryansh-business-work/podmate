import React from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import { AdminMediaUploader, type MediaItem } from '../../../components/AdminMediaUploader';

interface StepMediaProps {
  mediaItems: MediaItem[];
  onMediaChange: (items: MediaItem[]) => void;
}

const StepMedia: React.FC<StepMediaProps> = ({ mediaItems, onMediaChange }) => (
  <Stack spacing={2}>
    <Alert severity="info" variant="outlined">
      Upload at least one image for your pod. Images help attract attendees.
    </Alert>
    <AdminMediaUploader
      mediaItems={mediaItems}
      onMediaChange={onMediaChange}
      folder="/pods"
      maxItems={10}
      label="Pod Images & Videos"
    />
    <Typography variant="caption" color="text.secondary">
      Supported formats: JPG, PNG, GIF, MP4. Max 20MB per file.
    </Typography>
  </Stack>
);

export default StepMedia;
