import React from 'react';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import type { FormikProps } from 'formik';
import type { MediaItem } from '../../../components/AdminMediaUploader';
import AdminMediaUploader from '../../../components/AdminMediaUploader';
import type { CreateUserFormValues } from '../CreateUser.types';

interface StepProfileDetailsProps {
  formik: FormikProps<CreateUserFormValues>;
  avatarItems: MediaItem[];
  onAvatarChange: (items: MediaItem[]) => void;
}

const StepProfileDetails: React.FC<StepProfileDetailsProps> = ({
  formik,
  avatarItems,
  onAvatarChange,
}) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
    <TextField
      label="Email (optional)"
      name="email"
      type="email"
      value={formik.values.email}
      onChange={formik.handleChange}
      onBlur={formik.handleBlur}
      error={formik.touched.email && Boolean(formik.errors.email)}
      helperText={formik.touched.email && formik.errors.email}
      fullWidth
    />
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Avatar
      </Typography>
      <AdminMediaUploader
        folder="/avatars"
        maxItems={1}
        label="Upload Avatar"
        mediaItems={avatarItems}
        onMediaChange={onAvatarChange}
      />
      <Alert severity="info" sx={{ mt: 1 }}>
        Upload a profile picture for the user. Supported formats: JPG, PNG, WebP.
      </Alert>
    </Box>
  </Box>
);

export default StepProfileDetails;
