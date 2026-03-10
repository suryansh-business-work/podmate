import React from 'react';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import type { FormikProps } from 'formik';
import type { CreatePlaceFormValues } from '../CreatePlace.types';
import { PLACE_CATEGORIES } from '../CreatePlace.types';

interface StepVenueDetailsProps {
  formik: FormikProps<CreatePlaceFormValues>;
}

const StepVenueDetails: React.FC<StepVenueDetailsProps> = ({ formik }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
    <TextField
      label="Venue Name"
      name="name"
      value={formik.values.name}
      onChange={formik.handleChange}
      onBlur={formik.handleBlur}
      error={formik.touched.name && Boolean(formik.errors.name)}
      helperText={formik.touched.name && formik.errors.name}
      fullWidth
      autoFocus
    />
    <TextField
      label="Description"
      name="description"
      value={formik.values.description}
      onChange={formik.handleChange}
      onBlur={formik.handleBlur}
      error={formik.touched.description && Boolean(formik.errors.description)}
      helperText={formik.touched.description && formik.errors.description}
      multiline
      rows={3}
      fullWidth
    />
    <FormControl fullWidth>
      <InputLabel>Category</InputLabel>
      <Select
        name="category"
        value={formik.values.category}
        label="Category"
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
      >
        {PLACE_CATEGORIES.map((cat) => (
          <MenuItem key={cat} value={cat}>
            {cat}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
    <Box sx={{ display: 'flex', gap: 2 }}>
      <TextField
        label="Address"
        name="address"
        value={formik.values.address}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.address && Boolean(formik.errors.address)}
        helperText={formik.touched.address && formik.errors.address}
        fullWidth
      />
      <TextField
        label="City"
        name="city"
        value={formik.values.city}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.city && Boolean(formik.errors.city)}
        helperText={formik.touched.city && formik.errors.city}
        fullWidth
      />
    </Box>
  </Box>
);

export default StepVenueDetails;
