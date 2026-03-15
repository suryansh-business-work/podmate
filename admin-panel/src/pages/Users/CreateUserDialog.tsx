import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Box from '@mui/material/Box';
import { useMutation } from '@apollo/client';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ADMIN_CREATE_USER } from '../../graphql/mutations';
import type { MediaItem } from '../../components/AdminMediaUploader';
import type { CreateUserFormValues } from './CreateUser.types';
import { CREATE_USER_STEPS } from './CreateUser.types';
import StepAccountInfo from './components/StepAccountInfo';
import StepProfileDetails from './components/StepProfileDetails';

interface CreateUserDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const validationSchema = Yup.object({
  phone: Yup.string()
    .matches(/^\+?\d{10,15}$/, 'Enter a valid phone number')
    .required('Phone is required'),
  name: Yup.string().min(2, 'At least 2 characters').required('Name is required'),
  roles: Yup.array()
    .of(Yup.string().oneOf(['USER', 'VENUE_OWNER', 'HOST', 'ADMIN']))
    .min(1, 'At least one role is required')
    .required('Roles are required'),
  email: Yup.string().email('Enter a valid email'),
});

const INITIAL_VALUES: CreateUserFormValues = {
  phone: '',
  name: '',
  roles: ['USER'],
  email: '',
};

const CreateUserDialog: React.FC<CreateUserDialogProps> = ({ open, onClose, onCreated }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState('');
  const [avatarItems, setAvatarItems] = useState<MediaItem[]>([]);
  const [adminCreateUser, { loading }] = useMutation(ADMIN_CREATE_USER);

  const formik = useFormik<CreateUserFormValues>({
    initialValues: INITIAL_VALUES,
    validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      setError('');
      try {
        await adminCreateUser({
          variables: {
            phone: values.phone.trim(),
            name: values.name.trim(),
            roles: values.roles,
          },
        });
        handleReset();
        onClose();
        onCreated();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create user');
      }
    },
  });

  const handleReset = () => {
    setActiveStep(0);
    setError('');
    setAvatarItems([]);
    formik.resetForm();
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const canProceed = (): boolean => {
    if (activeStep === 0) {
      return Boolean(
        formik.values.phone.trim() &&
        formik.values.name.trim() &&
        !formik.errors.phone &&
        !formik.errors.name,
      );
    }
    return true;
  };

  const handleNext = () => {
    if (activeStep < CREATE_USER_STEPS.length - 1) {
      setActiveStep((prev) => prev + 1);
    } else {
      formik.handleSubmit();
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create User</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3, mt: 1 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {CREATE_USER_STEPS.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ minHeight: 180 }}>
          {activeStep === 0 && <StepAccountInfo formik={formik} />}
          {activeStep === 1 && (
            <StepProfileDetails
              formik={formik}
              avatarItems={avatarItems}
              onAvatarChange={setAvatarItems}
            />
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        {activeStep > 0 && (
          <Button onClick={handleBack} disabled={loading}>
            Back
          </Button>
        )}
        <Button
          variant="contained"
          onClick={handleNext}
          disabled={loading || !canProceed()}
          startIcon={loading ? <CircularProgress size={16} /> : undefined}
        >
          {activeStep === CREATE_USER_STEPS.length - 1
            ? loading
              ? 'Creating…'
              : 'Create User'
            : 'Next'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateUserDialog;
