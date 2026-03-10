import React from 'react';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import type { FormikProps } from 'formik';
import type { CreatePlaceFormValues } from '../CreatePlace.types';

interface StepContactOwnerProps {
  formik: FormikProps<CreatePlaceFormValues>;
}

const StepContactOwner: React.FC<StepContactOwnerProps> = ({ formik }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
    <Box sx={{ display: 'flex', gap: 2 }}>
      <TextField
        label="Phone"
        name="phone"
        value={formik.values.phone}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.phone && Boolean(formik.errors.phone)}
        helperText={formik.touched.phone && formik.errors.phone}
        fullWidth
      />
      <TextField
        label="Email"
        name="email"
        type="email"
        value={formik.values.email}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.email && Boolean(formik.errors.email)}
        helperText={formik.touched.email && formik.errors.email}
        fullWidth
      />
    </Box>
    <TextField
      label="Owner ID"
      name="ownerId"
      value={formik.values.ownerId}
      onChange={formik.handleChange}
      onBlur={formik.handleBlur}
      error={formik.touched.ownerId && Boolean(formik.errors.ownerId)}
      helperText={
        (formik.touched.ownerId && formik.errors.ownerId) ||
        'Enter the user ID of the venue owner'
      }
      fullWidth
    />
    <Alert severity="info">
      The owner must be an existing user. You can find user IDs on the Users page.
    </Alert>
  </Box>
);

export default StepContactOwner;
