import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import type { PlatformFeeOverride, OverrideFormValues } from './Finance.types';

interface OverrideDialogProps {
  open: boolean;
  editing: PlatformFeeOverride | null;
  saving: boolean;
  onClose: () => void;
  onSave: (values: OverrideFormValues) => Promise<void>;
}

const validationSchema = Yup.object<OverrideFormValues>({
  pincode: Yup.string()
    .required('Pincode is required')
    .min(4, 'Min 4 characters')
    .max(10, 'Max 10 characters'),
  feePercent: Yup.number().required().min(2, 'Min 2%').max(15, 'Max 15%'),
  label: Yup.string().max(100, 'Max 100 characters'),
});

const OverrideDialog: React.FC<OverrideDialogProps> = ({
  open,
  editing,
  saving,
  onClose,
  onSave,
}) => {
  const formik = useFormik<OverrideFormValues>({
    enableReinitialize: true,
    initialValues: {
      pincode: editing?.pincode ?? '',
      feePercent: editing?.feePercent ?? 5,
      label: editing?.label ?? '',
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      await onSave(values);
      resetForm();
    },
  });

  const handleClose = () => {
    if (!saving) {
      formik.resetForm();
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <form onSubmit={formik.handleSubmit}>
        <DialogTitle>{editing ? 'Edit Override' : 'Add Pincode Override'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Pincode"
              name="pincode"
              value={formik.values.pincode}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.pincode && Boolean(formik.errors.pincode)}
              helperText={formik.touched.pincode && formik.errors.pincode}
              disabled={Boolean(editing)}
              fullWidth
              autoFocus
            />
            <TextField
              label="Label (optional)"
              name="label"
              value={formik.values.label}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.label && Boolean(formik.errors.label)}
              helperText={formik.touched.label && formik.errors.label}
              placeholder="e.g. Mumbai Central"
              fullWidth
            />
            <Box>
              <Typography gutterBottom>
                Fee: <strong>{formik.values.feePercent}%</strong>
              </Typography>
              <Slider
                name="feePercent"
                value={formik.values.feePercent}
                onChange={(_, v) => formik.setFieldValue('feePercent', v as number)}
                min={2}
                max={15}
                step={0.5}
                marks={[
                  { value: 2, label: '2%' },
                  { value: 15, label: '15%' },
                ]}
                valueLabelDisplay="auto"
                valueLabelFormat={(v) => `${v}%`}
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={saving || !formik.isValid || !formik.dirty}
            startIcon={saving ? <CircularProgress size={16} /> : undefined}
          >
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default OverrideDialog;
