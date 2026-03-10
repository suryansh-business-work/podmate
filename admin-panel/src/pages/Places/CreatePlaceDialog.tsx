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
import { ADMIN_CREATE_PLACE } from '../../graphql/mutations';
import type { MediaItem } from '../../components/AdminMediaUploader';
import type { CreatePlaceFormValues } from './CreatePlace.types';
import { CREATE_PLACE_STEPS } from './CreatePlace.types';
import StepVenueDetails from './components/StepVenueDetails';
import StepVenueMedia from './components/StepVenueMedia';
import StepContactOwner from './components/StepContactOwner';

interface CreatePlaceDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const validationSchema = Yup.object({
  name: Yup.string().min(2, 'At least 2 characters').required('Name is required'),
  description: Yup.string().min(10, 'At least 10 characters').required('Description is required'),
  category: Yup.string().required('Category is required'),
  address: Yup.string().required('Address is required'),
  city: Yup.string().required('City is required'),
  phone: Yup.string(),
  email: Yup.string().email('Enter a valid email'),
  ownerId: Yup.string().required('Owner ID is required'),
});

const INITIAL_VALUES: CreatePlaceFormValues = {
  name: '',
  description: '',
  category: 'Restaurant',
  address: '',
  city: '',
  phone: '',
  email: '',
  ownerId: '',
  imageUrl: '',
  mediaUrls: [],
};

const CreatePlaceDialog: React.FC<CreatePlaceDialogProps> = ({ open, onClose, onCreated }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState('');
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [adminCreatePlace, { loading }] = useMutation(ADMIN_CREATE_PLACE);

  const formik = useFormik<CreatePlaceFormValues>({
    initialValues: INITIAL_VALUES,
    validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      setError('');
      try {
        const imageUrls = mediaItems.map((m) => m.url);
        await adminCreatePlace({
          variables: {
            input: {
              name: values.name.trim(),
              description: values.description.trim(),
              address: values.address.trim(),
              city: values.city.trim(),
              category: values.category,
              phone: values.phone.trim() || undefined,
              email: values.email.trim() || undefined,
              imageUrl: imageUrls[0] || undefined,
              mediaUrls: imageUrls,
            },
            ownerId: values.ownerId.trim(),
          },
        });
        handleReset();
        onClose();
        onCreated();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create place');
      }
    },
  });

  const handleReset = () => {
    setActiveStep(0);
    setError('');
    setMediaItems([]);
    formik.resetForm();
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const canProceed = (): boolean => {
    if (activeStep === 0) {
      return Boolean(
        formik.values.name.trim() &&
        formik.values.description.trim() &&
        formik.values.address.trim() &&
        formik.values.city.trim() &&
        formik.values.category &&
        !formik.errors.name &&
        !formik.errors.description &&
        !formik.errors.address &&
        !formik.errors.city,
      );
    }
    if (activeStep === 1) {
      return mediaItems.length > 0;
    }
    if (activeStep === 2) {
      return Boolean(formik.values.ownerId.trim() && !formik.errors.ownerId);
    }
    return true;
  };

  const handleNext = () => {
    if (activeStep < CREATE_PLACE_STEPS.length - 1) {
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
      <DialogTitle>Create Venue</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3, mt: 1 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {CREATE_PLACE_STEPS.map((label) => (
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

        <Box sx={{ minHeight: 200 }}>
          {activeStep === 0 && <StepVenueDetails formik={formik} />}
          {activeStep === 1 && (
            <StepVenueMedia mediaItems={mediaItems} onMediaChange={setMediaItems} />
          )}
          {activeStep === 2 && <StepContactOwner formik={formik} />}
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
          {activeStep === CREATE_PLACE_STEPS.length - 1
            ? loading
              ? 'Creating…'
              : 'Create Venue'
            : 'Next'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreatePlaceDialog;
