import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { GradientButton } from '../../components/GradientButton';
import MediaUploader, { MediaItem } from '../../components/MediaUploader';
import { VenueFormValues, CATEGORIES } from './RegisterPlace.types';
import InputField from './InputField';
import VenueLocationPicker from './VenueLocationPicker';
import { createStyles } from './RegisterPlace.styles';
import { useThemedStyles } from '../../hooks/useThemedStyles';

const venueSchema = Yup.object().shape({
  name: Yup.string().min(3, 'Min 3 characters').required('Venue name required'),
  category: Yup.string().required('Category required'),
  description: Yup.string().min(10, 'Min 10 characters').required('Description required'),
  address: Yup.string().min(5, 'Min 5 characters').required('Address required'),
  city: Yup.string().required('City required'),
  capacity: Yup.number()
    .typeError('Must be a number')
    .min(1, 'Min 1')
    .max(10000, 'Max 10000')
    .required('Capacity required'),
});

interface StepVenueDetailsProps {
  formValues: VenueFormValues;
  venueMedia: MediaItem[];
  googleMapsApiKey: string;
  onMediaChange: (items: MediaItem[]) => void;
  onSubmit: (values: VenueFormValues) => void;
}

const StepVenueDetails: React.FC<StepVenueDetailsProps> = ({
  formValues,
  venueMedia,
  googleMapsApiKey,
  onMediaChange,
  onSubmit,
}) => {
  const styles = useThemedStyles(createStyles);
  return (
  <Formik
    initialValues={formValues}
    validationSchema={venueSchema}
    onSubmit={onSubmit}
    enableReinitialize
  >
    {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
      <ScrollView
        style={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Basic Info ── */}
        <Text style={styles.sectionTitle}>Basic Information</Text>
        <InputField
          label="Venue Name"
          icon="store"
          value={values.name}
          onChangeText={handleChange('name')}
          onBlur={handleBlur('name')}
          error={touched.name ? errors.name : undefined}
          placeholder="e.g. Sky Lounge"
        />

        <Text style={styles.fieldLabel}>Category</Text>
        <View style={styles.categoryContainer}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryBtn, values.category === cat && styles.categoryBtnActive]}
              onPress={() => handleChange('category')(cat)}
            >
              <Text
                style={[styles.categoryBtnText, values.category === cat && styles.categoryBtnTextActive]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {touched.category && errors.category ? (
          <Text style={styles.errorText}>{errors.category}</Text>
        ) : null}

        <InputField
          label="Description"
          icon="description"
          value={values.description}
          onChangeText={handleChange('description')}
          onBlur={handleBlur('description')}
          error={touched.description ? errors.description : undefined}
          placeholder="Describe your venue..."
          multiline
          numberOfLines={3}
        />

        <InputField
          label="Max Capacity"
          icon="people"
          value={values.capacity}
          onChangeText={handleChange('capacity')}
          onBlur={handleBlur('capacity')}
          error={touched.capacity ? errors.capacity : undefined}
          placeholder="e.g. 200"
          keyboardType="numeric"
        />

        {/* ── Images & Videos ── */}
        <Text style={styles.sectionTitle}>Images &amp; Videos</Text>
        <Text style={styles.helperText}>
          Upload photos and videos of your venue to attract guests. At least one image is recommended.
        </Text>
        <MediaUploader
          mediaItems={venueMedia}
          onMediaChange={onMediaChange}
          folder="/venues/photos"
          maxItems={10}
        />

        {/* ── Location ── */}
        <Text style={styles.sectionTitle}>Location</Text>
        <VenueLocationPicker
          address={values.address}
          city={values.city}
          latitude={values.latitude}
          longitude={values.longitude}
          googleMapsApiKey={googleMapsApiKey}
          onLocationChange={({ address, city, latitude, longitude, placeId }) => {
            setFieldValue('address', address);
            setFieldValue('city', city);
            if (latitude !== undefined) setFieldValue('latitude', latitude);
            if (longitude !== undefined) setFieldValue('longitude', longitude);
            if (placeId !== undefined) setFieldValue('placeId', placeId);
          }}
        />
        {touched.address && errors.address ? (
          <Text style={styles.errorText}>{errors.address}</Text>
        ) : null}
        {touched.city && errors.city ? (
          <Text style={styles.errorText}>{errors.city}</Text>
        ) : null}

        <View style={styles.btnContainer}>
          <GradientButton title="Continue" onPress={handleSubmit as () => void} />
        </View>
      </ScrollView>
    )}
  </Formik>
  );
};

export default StepVenueDetails;
