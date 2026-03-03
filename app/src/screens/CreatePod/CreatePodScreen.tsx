import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Alert, Platform, KeyboardAvoidingView, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation } from '@apollo/client';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { colors } from '../../theme';
import ContactPicker from '../../components/ContactPicker';
import { MediaItem } from '../../components/MediaUploader';
import { CREATE_POD } from '../../graphql/mutations';
import { GET_PODS } from '../../graphql/queries';
import { PodFormValues, CATEGORIES } from './CreatePod.types';
import PodFormBody from './PodFormBody';
import styles from './CreatePod.styles';

interface CreatePodScreenProps {
  onClose: () => void;
}

const podSchema = Yup.object().shape({
  title: Yup.string().min(3, 'Title must be at least 3 characters').required('Title is required'),
  description: Yup.string().min(10, 'Describe your pod in at least 10 characters').required('Description is required'),
  fee: Yup.number().typeError('Must be a number').min(0, 'Fee cannot be negative').required('Fee is required'),
  location: Yup.string().required('Location is required'),
  locationDetail: Yup.string(),
  category: Yup.string().oneOf(CATEGORIES).required('Category is required'),
});

const initialValues: PodFormValues = {
  title: '',
  description: '',
  fee: '1200',
  maxSeats: 10,
  placeId: '',
  location: '',
  locationDetail: '',
  latitude: 0,
  longitude: 0,
  category: 'Social',
};

const CreatePodScreen: React.FC<CreatePodScreenProps> = ({ onClose }) => {
  const [showInvite, setShowInvite] = useState(false);
  const [createdPodId, setCreatedPodId] = useState('');
  const [createdTitle, setCreatedTitle] = useState('');
  const [dateTime, setDateTime] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);

  const [createPod, { loading }] = useMutation(CREATE_POD, {
    refetchQueries: [{ query: GET_PODS, variables: { page: 1, limit: 20 } }],
  });

  const handleDateChange = useCallback((date: Date | undefined) => {
    if (date) {
      setDateTime((prev) => {
        const nd = new Date(prev);
        nd.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
        return nd;
      });
      if (Platform.OS === 'android') setTimeout(() => setShowTimePicker(true), 300);
    }
  }, []);

  const handleTimeChange = useCallback((time: Date | undefined) => {
    if (time) {
      setDateTime((prev) => {
        const nd = new Date(prev);
        nd.setHours(time.getHours(), time.getMinutes());
        return nd;
      });
    }
  }, []);

  const handleCreate = async (values: PodFormValues) => {
    const feeNum = parseInt(values.fee, 10) || 0;
    const mediaUrls = mediaItems.map((m) => m.url);
    try {
      const result = await createPod({
        variables: {
          input: {
            title: values.title.trim(),
            description: values.description.trim(),
            category: values.category,
            imageUrl: mediaItems[0]?.url || undefined,
            mediaUrls,
            placeId: values.placeId || undefined,
            feePerPerson: feeNum,
            maxSeats: values.maxSeats,
            dateTime: dateTime.toISOString(),
            location: values.location.trim(),
            locationDetail: values.locationDetail.trim() || 'TBD',
            latitude: values.latitude || undefined,
            longitude: values.longitude || undefined,
          },
        },
      });
      const newPodId = result?.data?.createPod?.id as string | undefined;
      if (newPodId) {
        setCreatedPodId(newPodId);
        setCreatedTitle(values.title);
        Alert.alert('Pod Created!', 'Would you like to invite friends?', [
          { text: 'Skip', onPress: onClose },
          { text: 'Invite Friends', onPress: () => setShowInvite(true) },
        ]);
      } else {
        Alert.alert('Pod Created!', 'Your pod has been created successfully.', [
          { text: 'OK', onPress: onClose },
        ]);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create pod';
      Alert.alert('Error', errorMessage);
    }
  };

  if (showInvite && createdPodId) {
    return <ContactPicker podId={createdPodId} podTitle={createdTitle} onDone={onClose} onSkip={onClose} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={{ flex: 1 }}>
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose}>
                <MaterialIcons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Host a Pod</Text>
              <View style={{ width: 24 }} />
            </View>

            <Formik initialValues={initialValues} validationSchema={podSchema} onSubmit={handleCreate}>
              {(formik) => (
                <PodFormBody
                  formik={formik}
                  dateTime={dateTime}
                  showDatePicker={showDatePicker}
                  showTimePicker={showTimePicker}
                  mediaItems={mediaItems}
                  loading={loading}
                  onMediaChange={setMediaItems}
                  onShowDatePicker={() => setShowDatePicker(true)}
                  onDateChange={handleDateChange}
                  onTimeChange={handleTimeChange}
                  onDismissDatePicker={() => setShowDatePicker(false)}
                  onDismissTimePicker={() => setShowTimePicker(false)}
                />
              )}
            </Formik>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CreatePodScreen;
