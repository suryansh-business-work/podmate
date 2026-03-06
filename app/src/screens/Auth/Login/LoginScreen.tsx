import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Formik } from 'formik';

import { GradientButton } from '../../../components/GradientButton';
import { LoginScreenProps, LoginFormValues, loginSchema } from './Login.types';
import { createStyles } from './Login.styles';
import PolicyModal from './PolicyModal';
import { useThemedStyles, useAppColors } from '../../../hooks/useThemedStyles';

const LoginScreen: React.FC<LoginScreenProps> = ({ onSendOtp, loading, error }) => {
  const styles = useThemedStyles(createStyles);
  const colors = useAppColors();
  const [countryCode] = useState('+91');
  const [policyModal, setPolicyModal] = useState<'USER' | 'VENUE' | 'HOST' | null>(null);
  const initialValues: LoginFormValues = { phone: '' };

  const handleSubmit = (values: LoginFormValues) => {
    onSendOtp(countryCode + values.phone);
  };

  return (
    <SafeAreaView style={styles.container} testID="login-screen">
      <KeyboardAvoidingView style={styles.content} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.topSection}>
          <LinearGradient colors={[colors.primaryLight, colors.primary]} style={styles.logoBox} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <MaterialCommunityIcons name="account-group" size={26} color={colors.white} />
          </LinearGradient>

          <Text style={styles.title}>Welcome to PartyWings</Text>
          <Text style={styles.subtitle}>Enter your phone number to join or create your Pod.</Text>

          <Formik initialValues={initialValues} validationSchema={loginSchema} onSubmit={handleSubmit}>
            {({ handleChange, handleBlur, handleSubmit: formSubmit, values, errors, touched, isValid, dirty }) => (
              <View>
                <Text style={styles.inputLabel}>PHONE NUMBER</Text>
                <View style={styles.phoneInputRow}>
                  <TouchableOpacity style={styles.countryCodeBox} testID="country-code-button">
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
                    testID="phone-input"
                    accessibilityLabel="Phone number input"
                  />
                </View>
                {touched.phone && errors.phone && (
                  <Text style={styles.errorText} testID="phone-error">
                    {errors.phone}
                  </Text>
                )}

                {error && (
                  <Text style={styles.errorText} testID="api-error">
                    {error}
                  </Text>
                )}

                <View style={styles.secureBadge}>
                  <MaterialIcons name="verified-user" size={16} color={colors.success} />
                  <Text style={styles.secureText}>Secure, passwordless login</Text>
                </View>

                <View style={styles.bottomSection}>
                  <GradientButton
                    title={loading ? '' : 'Continue'}
                    onPress={() => formSubmit()}
                    disabled={!isValid || !dirty || loading}
                    testID="send-otp-button"
                  >
                    {loading && <ActivityIndicator color={colors.white} size="small" testID="loading-indicator" />}
                  </GradientButton>
                  <Text style={styles.termsText}>
                    By continuing, you agree to our{' '}
                    <Text style={styles.termsLink} onPress={() => setPolicyModal('USER')}>Terms of Service</Text> and{' '}
                    <Text style={styles.termsLink} onPress={() => setPolicyModal('USER')}>Privacy Policy</Text>
                  </Text>
                  <View style={styles.policyLinksRow}>
                    <TouchableOpacity onPress={() => setPolicyModal('VENUE')}>
                      <Text style={styles.policyLinkSmall}>Venue Policy</Text>
                    </TouchableOpacity>
                    <Text style={styles.policyDot}>•</Text>
                    <TouchableOpacity onPress={() => setPolicyModal('HOST')}>
                      <Text style={styles.policyLinkSmall}>Host Policy</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          </Formik>
        </View>
      </KeyboardAvoidingView>

      <PolicyModal policyType={policyModal} onClose={() => setPolicyModal(null)} />
    </SafeAreaView>
  );
};

export default LoginScreen;
