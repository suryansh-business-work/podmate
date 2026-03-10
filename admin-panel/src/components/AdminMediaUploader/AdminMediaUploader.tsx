import React, { useRef } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DeleteIcon from '@mui/icons-material/Delete';
import { useImageKitUpload } from '../../hooks/useImageKitUpload';

export interface MediaItem {
  url: string;
  type: 'image' | 'video';
}

interface AdminMediaUploaderProps {
  mediaItems: MediaItem[];
  onMediaChange: (items: MediaItem[]) => void;
  folder?: string;
  maxItems?: number;
  label?: string;
}

const AdminMediaUploader: React.FC<AdminMediaUploaderProps> = ({
  mediaItems,
  onMediaChange,
  folder = '/admin-uploads',
  maxItems = 10,
  label = 'Media',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, uploading, progress, error } = useImageKitUpload();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const isVideo = file.type.startsWith('video/');
    const result = await uploadFile(file, folder);

    if (result) {
      onMediaChange([...mediaItems, { url: result.url, type: isVideo ? 'video' : 'image' }]);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = (index: number) => {
    onMediaChange(mediaItems.filter((_, i) => i !== index));
  };

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        {label} ({mediaItems.length}/{maxItems})
      </Typography>

      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, mb: 1 }}>
        {mediaItems.map((item, idx) => (
          <Box
            key={`media-${idx}`}
            sx={{
              position: 'relative',
              width: 80,
              height: 80,
              borderRadius: 1,
              overflow: 'hidden',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            {item.type === 'image' ? (
              <Box
                component="img"
                src={item.url}
                alt={`Media ${idx + 1}`}
                sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'action.hover',
                }}
              >
                <Typography variant="caption">Video</Typography>
              </Box>
            )}
            <IconButton
              size="small"
              onClick={() => handleRemove(idx)}
              sx={{
                position: 'absolute',
                top: 2,
                right: 2,
                bgcolor: 'error.main',
                color: 'white',
                width: 20,
                height: 20,
                '&:hover': { bgcolor: 'error.dark' },
              }}
            >
              <DeleteIcon sx={{ fontSize: 12 }} />
            </IconButton>
          </Box>
        ))}

        {uploading && (
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: 1,
              border: '2px dashed',
              borderColor: 'primary.main',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CircularProgress size={20} />
            <Typography variant="caption" sx={{ mt: 0.5 }}>
              {Math.round(progress * 100)}%
            </Typography>
          </Box>
        )}
      </Stack>

      {!uploading && mediaItems.length < maxItems && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            hidden
            onChange={handleFileSelect}
          />
          <Button
            variant="outlined"
            size="small"
            startIcon={<AddPhotoAlternateIcon />}
            onClick={() => fileInputRef.current?.click()}
          >
            Add Media
          </Button>
        </>
      )}

      {error && (
        <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default AdminMediaUploader;
