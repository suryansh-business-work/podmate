import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Alert, Platform, KeyboardAvoidingView, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation } from '@apollo/client';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../theme';
import { GET_POLICIES } from '../../graphql/queries';
import { CREATE_PLACE } from '../../graphql/mutations';
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

  const [createPlaceMutation, { loading: submitting }] = useMutation(CREATE_PLACE);

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

  const handleFinalSubmit = useCallback(async () => {
    try {
      const mediaUrls = venueMedia.map((m) => m.url);
      const imageUrl = businessLicenseUrl || (mediaUrls.length > 0 ? mediaUrls[0] : '');

      await createPlaceMutation({
        variables: {
          input: {
            name: formValues.name,
            description: formValues.description,
            address: formValues.address,
            city: formValues.city,
            category: formValues.category,
            imageUrl,
            mediaUrls,
          },
        },
      });

      Alert.alert(
        'Registration Submitted',
        `Your venue "${formValues.name}" has been submitted for review. We'll notify you once approved.`,
        [{ text: 'OK', onPress: onClose }],
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit venue registration';
      Alert.alert('Error', message);
    }
  }, [formValues, businessLicenseUrl, venueMedia, createPlaceMutation, onClose]);

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
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={{ flex: 1 }}>
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
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RegisterPlaceScreen;
