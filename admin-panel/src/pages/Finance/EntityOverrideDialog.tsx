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
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import type {
  EntityFeeOverride,
  EntityFeeOverrideFormValues,
  EntityOverrideType,
} from './Finance.types';

interface EntityOverrideDialogProps {
  open: boolean;
  editing: EntityFeeOverride | null;
  saving: boolean;
  onClose: () => void;
  onSave: (values: EntityFeeOverrideFormValues) => Promise<void>;
}

const validationSchema = Yup.object<EntityFeeOverrideFormValues>({
  entityType: Yup.string()
    .oneOf(['USER', 'POD', 'PLACE'] as const)
    .required('Entity type is required'),
  entityId: Yup.string().required('Entity ID is required'),
  feePercent: Yup.number().required().min(2, 'Min 2%').max(15, 'Max 15%'),
  enabled: Yup.boolean().required(),
});

const ENTITY_TYPE_LABELS: Record<EntityOverrideType, string> = {
  USER: 'User',
  POD: 'Pod',
  PLACE: 'Venue',
};

const EntityOverrideDialog: React.FC<EntityOverrideDialogProps> = ({
  open,
  editing,
  saving,
  onClose,
  onSave,
}) => {
  const formik = useFormik<EntityFeeOverrideFormValues>({
    enableReinitialize: true,
    initialValues: {
      entityType: editing?.entityType ?? 'USER',
      entityId: editing?.entityId ?? '',
      feePercent: editing?.feePercent ?? 5,
      enabled: editing?.enabled ?? true,
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
        <DialogTitle>
          {editing ? 'Edit Entity Fee Override' : 'Add Entity Fee Override'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Alert severity="info" variant="outlined">
              When enabled, this override replaces the global platform fee for the selected entity.
            </Alert>

            <FormControl fullWidth>
              <InputLabel>Entity Type</InputLabel>
              <Select
                name="entityType"
                value={formik.values.entityType}
                label="Entity Type"
                onChange={formik.handleChange}
                disabled={Boolean(editing)}
              >
                {(['USER', 'POD', 'PLACE'] as const).map((t) => (
                  <MenuItem key={t} value={t}>
                    {ENTITY_TYPE_LABELS[t]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label={`${ENTITY_TYPE_LABELS[formik.values.entityType]} ID`}
              name="entityId"
              value={formik.values.entityId}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.entityId && Boolean(formik.errors.entityId)}
              helperText={
                (formik.touched.entityId && formik.errors.entityId) ||
                `Enter the ${ENTITY_TYPE_LABELS[formik.values.entityType].toLowerCase()} ID to override`
              }
              disabled={Boolean(editing)}
              fullWidth
              autoFocus={!editing}
            />

            <Box>
              <Typography gutterBottom>
                Override Fee: <strong>{formik.values.feePercent}%</strong>
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

            <FormControlLabel
              control={
                <Switch
                  checked={formik.values.enabled}
                  onChange={(e) => formik.setFieldValue('enabled', e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    Override Enabled
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formik.values.enabled
                      ? 'Global fee will be overridden for this entity'
                      : 'Global fee will apply (override disabled)'}
                  </Typography>
                </Box>
              }
            />
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

export default EntityOverrideDialog;
