import React, { useState } from 'react';
import { View, Text, TextInput, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { colors } from '../../theme';
import { GradientButton } from '../../components/GradientButton';
import styles from './CompleteProfile.styles';

interface CompleteProfileScreenProps {
  onComplete: (name: string, age: number) => void | Promise<void>;
}

interface ProfileFormValues {
  name: string;
  age: string;
}

const profileSchema = Yup.object().shape({
  name: Yup.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be under 50 characters').required('Name is required'),
  age: Yup.number().typeError('Age must be a number').min(13, 'You must be at least 13 years old').max(120, 'Please enter a valid age').required('Age is required'),
});

const initialValues: ProfileFormValues = { name: '', age: '' };

const CompleteProfileScreen: React.FC<CompleteProfileScreenProps> = ({ onComplete }) => {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values: ProfileFormValues) => {
    setSubmitting(true);
    try {
      await onComplete(values.name.trim(), parseInt(values.age, 10));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to complete profile';
      Alert.alert('Error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={styles.content} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.topSection}>
          <LinearGradient
            colors={[colors.primaryLight, colors.primary]}
            style={styles.logoBox}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <MaterialIcons name="person-add" size={30} color={colors.white} />
          </LinearGradient>

          <Text style={styles.title}>Complete Your Profile</Text>
          <Text style={styles.subtitle}>Tell us a bit about yourself to get started.</Text>

          <Formik initialValues={initialValues} validationSchema={profileSchema} onSubmit={handleSubmit}>
            {({ handleChange, handleBlur, handleSubmit: formSubmit, values, errors, touched, isValid, dirty }) => (
              <View>
                <Text style={styles.inputLabel}>YOUR NAME</Text>
                <TextInput
                  style={[styles.textInput, touched.name && errors.name ? styles.textInputError : undefined]}
                  placeholder="Enter your full name"
                  placeholderTextColor={colors.textTertiary}
                  value={values.name}
                  onChangeText={handleChange('name')}
                  onBlur={handleBlur('name')}
                  autoCapitalize="words"
                />
                {touched.name && errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

                <Text style={styles.inputLabel}>YOUR AGE</Text>
                <TextInput
                  style={[styles.textInput, touched.age && errors.age ? styles.textInputError : undefined]}
                  placeholder="Enter your age"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="number-pad"
                  value={values.age}
                  onChangeText={handleChange('age')}
                  onBlur={handleBlur('age')}
                  maxLength={3}
                />
                {touched.age && errors.age && <Text style={styles.errorText}>{errors.age}</Text>}

                <View style={styles.infoRow}>
                  <MaterialIcons name="info-outline" size={16} color={colors.primary} />
                  <Text style={styles.infoText}>This information helps us personalize your experience.</Text>
                </View>

                <GradientButton title={submitting ? 'Saving...' : 'Get Started'} onPress={() => formSubmit()} disabled={!isValid || !dirty || submitting} />
              </View>
            )}
          </Formik>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CompleteProfileScreen;
