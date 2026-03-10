import React from 'react';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid2';
import { FormikProps } from 'formik';
import type { CreatePodFormValues } from '../CreatePod.types';

interface StepLogisticsProps {
  formik: FormikProps<CreatePodFormValues>;
}

const StepLogistics: React.FC<StepLogisticsProps> = ({ formik }) => (
  <Stack spacing={2}>
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          label="Fee Per Person (₹)"
          name="feePerPerson"
          type="number"
          value={formik.values.feePerPerson}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.feePerPerson && Boolean(formik.errors.feePerPerson)}
          helperText={
            (formik.touched.feePerPerson && formik.errors.feePerPerson) || 'Set 0 for free events'
          }
          fullWidth
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          label="Max Seats"
          name="maxSeats"
          type="number"
          value={formik.values.maxSeats}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.maxSeats && Boolean(formik.errors.maxSeats)}
          helperText={
            (formik.touched.maxSeats && formik.errors.maxSeats) || 'Maximum number of attendees'
          }
          fullWidth
        />
      </Grid>
    </Grid>
    <TextField
      label="Date & Time"
      name="dateTime"
      type="datetime-local"
      value={formik.values.dateTime}
      onChange={formik.handleChange}
      onBlur={formik.handleBlur}
      error={formik.touched.dateTime && Boolean(formik.errors.dateTime)}
      helperText={
        (formik.touched.dateTime && formik.errors.dateTime) || 'When will this pod take place?'
      }
      fullWidth
      slotProps={{ inputLabel: { shrink: true } }}
    />
    <TextField
      label="Location"
      name="location"
      value={formik.values.location}
      onChange={formik.handleChange}
      onBlur={formik.handleBlur}
      error={formik.touched.location && Boolean(formik.errors.location)}
      helperText={
        (formik.touched.location && formik.errors.location) || 'City or area name'
      }
      fullWidth
    />
    <TextField
      label="Location Detail"
      name="locationDetail"
      value={formik.values.locationDetail}
      onChange={formik.handleChange}
      onBlur={formik.handleBlur}
      helperText="Specific venue or address (optional)"
      fullWidth
    />
  </Stack>
);

export default StepLogistics;
