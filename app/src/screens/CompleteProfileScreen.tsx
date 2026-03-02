import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { colors, spacing, borderRadius } from '../theme';
import { GradientButton } from '../components/GradientButton';

interface CompleteProfileScreenProps {
  onComplete: (name: string, age: number) => void;
}

interface ProfileFormValues {
  name: string;
  age: string;
}

const profileSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be under 50 characters')
    .required('Name is required'),
  age: Yup.number()
    .typeError('Age must be a number')
    .min(13, 'You must be at least 13 years old')
    .max(120, 'Please enter a valid age')
    .required('Age is required'),
});

const CompleteProfileScreen: React.FC<CompleteProfileScreenProps> = ({ onComplete }) => {
  const initialValues: ProfileFormValues = { name: '', age: '' };

  const handleSubmit = (values: ProfileFormValues) => {
    onComplete(values.name.trim(), parseInt(values.age, 10));
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
          <Text style={styles.subtitle}>
            Tell us a bit about yourself to get started.
          </Text>

          <Formik
            initialValues={initialValues}
            validationSchema={profileSchema}
            onSubmit={handleSubmit}
          >
            {({ handleChange, handleBlur, handleSubmit: formSubmit, values, errors, touched, isValid, dirty }) => (
              <View>
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

                <Text style={styles.inputLabel}>YOUR AGE</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    touched.age && errors.age ? styles.textInputError : undefined,
                  ]}
                  placeholder="Enter your age"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="number-pad"
                  value={values.age}
                  onChangeText={handleChange('age')}
                  onBlur={handleBlur('age')}
                  maxLength={3}
                />
                {touched.age && errors.age && (
                  <Text style={styles.errorText}>{errors.age}</Text>
                )}

                <View style={styles.infoRow}>
                  <MaterialIcons name="info-outline" size={16} color={colors.primary} />
                  <Text style={styles.infoText}>
                    This information helps us personalize your experience.
                  </Text>
                </View>

                <GradientButton
                  title="Get Started"
                  onPress={() => formSubmit()}
                  disabled={!isValid || !dirty}
                />
              </View>
            )}
          </Formik>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  topSection: {
    paddingTop: 60,
  },
  logoBox: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: spacing.xxxl,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: 1,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  textInput: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.white,
  },
  textInputError: {
    borderColor: colors.error,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xxl,
    marginBottom: spacing.xxl,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});

export default CompleteProfileScreen;
