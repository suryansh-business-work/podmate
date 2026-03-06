import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { Formik } from 'formik';
import * as Yup from 'yup';
import DateTimePicker from '@react-native-community/datetimepicker';

import { GradientButton } from '../../components/GradientButton';
import { createStyles } from './CompleteProfile.styles';
import { useThemedStyles, useAppColors } from '../../hooks/useThemedStyles';

interface CompleteProfileScreenProps {
  onComplete: (username: string, name: string, dob: string) => void | Promise<void>;
}

interface ProfileFormValues {
  username: string;
  name: string;
  dob: string;
}

const profileSchema = Yup.object().shape({
  username: Yup.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be under 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers and underscores')
    .required('Username is required'),
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be under 50 characters')
    .required('Name is required'),
  dob: Yup.string().required('Date of birth is required'),
});

const initialValues: ProfileFormValues = { username: '', name: '', dob: '' };

const formatDob = (date: Date): string =>
  date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

const CompleteProfileScreen: React.FC<CompleteProfileScreenProps> = ({ onComplete }) => {
  const styles = useThemedStyles(createStyles);
  const colors = useAppColors();
  const [submitting, setSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSubmit = async (values: ProfileFormValues) => {
    setSubmitting(true);
    try {
      await onComplete(values.username.trim(), values.name.trim(), values.dob);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to complete profile';
      Alert.alert('Error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'web' ? undefined : Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
          >
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

              <Formik
                initialValues={initialValues}
                validationSchema={profileSchema}
                onSubmit={handleSubmit}
              >
                {({
                  handleChange,
                  handleBlur,
                  handleSubmit: formSubmit,
                  values,
                  errors,
                  touched,
                  isValid,
                  dirty,
                  setFieldValue,
                }) => (
                  <View>
                    <Text style={styles.inputLabel}>USERNAME</Text>
                    <TextInput
                      style={[
                        styles.textInput,
                        touched.username && errors.username ? styles.textInputError : undefined,
                      ]}
                      placeholder="Choose a unique username"
                      placeholderTextColor={colors.textTertiary}
                      value={values.username}
                      onChangeText={handleChange('username')}
                      onBlur={handleBlur('username')}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    {touched.username && errors.username && (
                      <Text style={styles.errorText}>{errors.username}</Text>
                    )}

                    <Text style={styles.inputLabel}>YOUR NAME</Text>
                    <TextInput
                      style={[
                        styles.textInput,
                        touched.name && errors.name ? styles.textInputError : undefined,
                      ]}
                      placeholder="Enter your full name"
                      placeholderTextColor={colors.textTertiary}
                      value={values.name}
                      onChangeText={handleChange('name')}
                      onBlur={handleBlur('name')}
                      autoCapitalize="words"
                    />
                    {touched.name && errors.name && (
                      <Text style={styles.errorText}>{errors.name}</Text>
                    )}

                    <Text style={styles.inputLabel}>DATE OF BIRTH</Text>
                    <TouchableOpacity
                      style={[
                        styles.textInput,
                        touched.dob && errors.dob ? styles.textInputError : undefined,
                      ]}
                      onPress={() => setShowDatePicker(true)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          color: values.dob ? colors.text : colors.textTertiary,
                        }}
                      >
                        {values.dob ? formatDob(new Date(values.dob)) : 'Select your date of birth'}
                      </Text>
                    </TouchableOpacity>
                    {touched.dob && errors.dob && (
                      <Text style={styles.errorText}>{errors.dob}</Text>
                    )}

                    {showDatePicker && (
                      <DateTimePicker
                        value={values.dob ? new Date(values.dob) : new Date(2000, 0, 1)}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        maximumDate={new Date()}
                        minimumDate={new Date(1920, 0, 1)}
                        onChange={(_, selectedDate) => {
                          setShowDatePicker(Platform.OS === 'ios');
                          if (selectedDate) {
                            setFieldValue('dob', selectedDate.toISOString());
                          }
                        }}
                      />
                    )}

                    <View style={styles.infoRow}>
                      <MaterialIcons name="info-outline" size={16} color={colors.primary} />
                      <Text style={styles.infoText}>
                        This information helps us personalize your experience.
                      </Text>
                    </View>

                    <GradientButton
                      title={submitting ? 'Saving...' : 'Get Started'}
                      onPress={() => formSubmit()}
                      disabled={!isValid || !dirty || submitting}
                    />
                  </View>
                )}
              </Formik>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CompleteProfileScreen;
