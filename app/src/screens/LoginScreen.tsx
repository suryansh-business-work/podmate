import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { colors, spacing, borderRadius } from '../theme';
import { GradientButton } from '../components/GradientButton';

interface LoginScreenProps {
  onSendOtp: (phone: string) => void;
}

interface LoginFormValues {
  phone: string;
}

const loginSchema = Yup.object().shape({
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number')
    .required('Phone number is required'),
});

const LoginScreen: React.FC<LoginScreenProps> = ({ onSendOtp }) => {
  const [countryCode] = useState('+91');
  const initialValues: LoginFormValues = { phone: '' };

  const handleSubmit = (values: LoginFormValues) => {
    onSendOtp(countryCode + values.phone);
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
            <MaterialCommunityIcons name="account-group" size={26} color={colors.white} />
          </LinearGradient>

          <Text style={styles.title}>Welcome to PartyWings</Text>
          <Text style={styles.subtitle}>Enter your phone number to join or create your Pod.</Text>

          <Formik
            initialValues={initialValues}
            validationSchema={loginSchema}
            onSubmit={handleSubmit}
          >
            {({ handleChange, handleBlur, handleSubmit: formSubmit, values, errors, touched, isValid, dirty }) => (
              <View>
                <Text style={styles.inputLabel}>PHONE NUMBER</Text>
                <View style={styles.phoneInputRow}>
                  <TouchableOpacity style={styles.countryCodeBox}>
                    <Text style={styles.countryCodeText}>{countryCode}</Text>
                    <MaterialIcons name="arrow-drop-down" size={18} color={colors.textSecondary} />
                  </TouchableOpacity>
                  <TextInput
                    style={styles.phoneInput}
                    placeholder="555 000-0000"
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="phone-pad"
                    value={values.phone}
                    onChangeText={handleChange('phone')}
                    onBlur={handleBlur('phone')}
                    maxLength={10}
                  />
                </View>
                {touched.phone && errors.phone && (
                  <Text style={styles.errorText}>{errors.phone}</Text>
                )}

                <View style={styles.secureBadge}>
                  <MaterialIcons name="verified-user" size={16} color={colors.success} />
                  <Text style={styles.secureText}>Secure, passwordless login</Text>
                </View>

                <View style={styles.bottomSection}>
                  <GradientButton
                    title="Continue"
                    onPress={() => formSubmit()}
                    disabled={!isValid || !dirty}
                  />
                  <Text style={styles.termsText}>
                    By continuing, you agree to our{' '}
                    <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                    <Text style={styles.termsLink}>Privacy Policy</Text>
                  </Text>
                </View>
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
    flex: 1,
  },
  logoBox: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  title: {
    fontSize: 32,
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
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  countryCodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    backgroundColor: colors.surface,
  },
  countryCodeText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    fontSize: 16,
    color: colors.text,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  secureText: {
    fontSize: 14,
    color: colors.success,
    fontWeight: '500',
  },
  bottomSection: {
    marginTop: 'auto',
    paddingBottom: 40,
    paddingTop: spacing.xxxl,
  },
  termsText: {
    textAlign: 'center',
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: spacing.lg,
    lineHeight: 20,
  },
  termsLink: {
    color: colors.primary,
    fontWeight: '600',
  },
});

export default LoginScreen;
