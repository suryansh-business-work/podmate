import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { GradientButton } from '../../components/GradientButton';
import { VenueFormValues, CATEGORIES } from './RegisterPlace.types';
import InputField from './InputField';
import styles from './RegisterPlace.styles';

const venueSchema = Yup.object().shape({
  name: Yup.string().min(3, 'Min 3 characters').required('Venue name required'),
  category: Yup.string().required('Category required'),
  description: Yup.string().min(10, 'Min 10 characters').required('Description required'),
  address: Yup.string().min(5, 'Min 5 characters').required('Address required'),
  city: Yup.string().required('City required'),
  capacity: Yup.number().typeError('Must be a number').min(1, 'Min 1').max(10000, 'Max 10000').required('Capacity required'),
});

interface StepVenueDetailsProps {
  formValues: VenueFormValues;
  onSubmit: (values: VenueFormValues) => void;
}

const StepVenueDetails: React.FC<StepVenueDetailsProps> = ({ formValues, onSubmit }) => (
  <Formik initialValues={formValues} validationSchema={venueSchema} onSubmit={onSubmit} enableReinitialize>
    {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
      <ScrollView style={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Basic Information</Text>
        <InputField label="Venue Name" icon="store" value={values.name}
          onChangeText={handleChange('name')} onBlur={handleBlur('name')}
          error={touched.name ? errors.name : undefined} placeholder="e.g. Sky Lounge" />
        <Text style={styles.fieldLabel}>Category</Text>
        <View style={styles.categoryContainer}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity key={cat}
              style={[styles.categoryBtn, values.category === cat && styles.categoryBtnActive]}
              onPress={() => handleChange('category')(cat)}>
              <Text style={[styles.categoryBtnText, values.category === cat && styles.categoryBtnTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {touched.category && errors.category ? <Text style={styles.errorText}>{errors.category}</Text> : null}
        <InputField label="Description" icon="description" value={values.description}
          onChangeText={handleChange('description')} onBlur={handleBlur('description')}
          error={touched.description ? errors.description : undefined}
          placeholder="Describe your venue..." multiline numberOfLines={3} />
        <Text style={styles.sectionTitle}>Location</Text>
        <InputField label="Address" icon="place" value={values.address}
          onChangeText={handleChange('address')} onBlur={handleBlur('address')}
          error={touched.address ? errors.address : undefined} placeholder="Full address" />
        <InputField label="City" icon="location-city" value={values.city}
          onChangeText={handleChange('city')} onBlur={handleBlur('city')}
          error={touched.city ? errors.city : undefined} placeholder="City" />
        <InputField label="Max Capacity" icon="people" value={values.capacity}
          onChangeText={handleChange('capacity')} onBlur={handleBlur('capacity')}
          error={touched.capacity ? errors.capacity : undefined} placeholder="e.g. 200" keyboardType="numeric" />
        <View style={styles.btnContainer}>
          <GradientButton title="Continue" onPress={handleSubmit as () => void} />
        </View>
      </ScrollView>
    )}
  </Formik>
);

export default StepVenueDetails;
