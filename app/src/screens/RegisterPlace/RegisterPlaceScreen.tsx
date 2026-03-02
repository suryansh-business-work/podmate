import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@apollo/client';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../theme';
import { GET_POLICIES } from '../../graphql/queries';
import { MediaItem } from '../../components/MediaUploader';
import { useImageKitUpload } from '../../hooks/useImageKitUpload';
import { VenueFormValues, PolicyItem } from './RegisterPlace.types';
import StepIndicator from './StepIndicator';
import StepVenueDetails from './StepVenueDetails';
import StepDocuments from './StepDocuments';
import StepPolicies from './StepPolicies';
import styles from './RegisterPlace.styles';

interface RegisterPlaceScreenProps {
  onClose: () => void;
}

const RegisterPlaceScreen: React.FC<RegisterPlaceScreenProps> = ({ onClose }) => {
  const [step, setStep] = useState(0);
  const [formValues, setFormValues] = useState<VenueFormValues>({
    name: '', category: '', description: '', address: '', city: '', capacity: '',
  });
  const [policiesAccepted, setPoliciesAccepted] = useState(false);
  const [hasScrolledPolicies, setHasScrolledPolicies] = useState(false);
  const [businessLicenseUrl, setBusinessLicenseUrl] = useState('');
  const [permitsUrl, setPermitsUrl] = useState('');
  const [venueMedia, setVenueMedia] = useState<MediaItem[]>([]);

  const { pickAndUploadImage, uploading, progress } = useImageKitUpload();

  const { data: policiesData, loading: policiesLoading } = useQuery(GET_POLICIES, {
    variables: { type: 'VENUE' },
    fetchPolicy: 'cache-and-network',
  });

  const policies: PolicyItem[] = (policiesData?.policies ?? []).filter(
    (p: PolicyItem) => p.isActive,
  );

  const handleStepOneSubmit = useCallback((values: VenueFormValues) => {
    setFormValues(values);
    setStep(1);
  }, []);

  const handleFinalSubmit = useCallback(() => {
    Alert.alert(
      'Registration Submitted',
      `Your venue "${formValues.name}" has been submitted for review. We'll notify you once approved.`,
      [{ text: 'OK', onPress: onClose }],
    );
  }, [formValues.name, onClose]);

  const handleUploadLicense = useCallback(async () => {
    const result = await pickAndUploadImage('/venues/licenses');
    if (result) setBusinessLicenseUrl(result.url);
  }, [pickAndUploadImage]);

  const handleUploadPermits = useCallback(async () => {
    const result = await pickAndUploadImage('/venues/permits');
    if (result) setPermitsUrl(result.url);
  }, [pickAndUploadImage]);

  const goBack = () => {
    if (step > 0) setStep(step - 1);
    else onClose();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.headerBtn}>
          <MaterialIcons name={step === 0 ? 'close' : 'arrow-back'} size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Register Venue</Text>
        <View style={styles.headerBtn} />
      </View>
      <StepIndicator step={step} />
      {step === 0 && <StepVenueDetails formValues={formValues} onSubmit={handleStepOneSubmit} />}
      {step === 1 && (
        <StepDocuments
          businessLicenseUrl={businessLicenseUrl}
          permitsUrl={permitsUrl}
          venueMedia={venueMedia}
          uploading={uploading}
          progress={progress}
          onUploadLicense={handleUploadLicense}
          onUploadPermits={handleUploadPermits}
          onMediaChange={setVenueMedia}
          onContinue={() => setStep(2)}
        />
      )}
      {step === 2 && (
        <StepPolicies
          policies={policies}
          policiesLoading={policiesLoading}
          policiesAccepted={policiesAccepted}
          hasScrolledPolicies={hasScrolledPolicies}
          onToggleAccepted={() => setPoliciesAccepted(!policiesAccepted)}
          onScrolledToBottom={() => setHasScrolledPolicies(true)}
          onSubmit={handleFinalSubmit}
        />
      )}
    </SafeAreaView>
  );
};

export default RegisterPlaceScreen;
