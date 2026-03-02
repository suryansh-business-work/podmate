import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useQuery } from '@apollo/client';
import { colors, spacing, borderRadius } from '../theme';
import { GradientButton } from '../components/GradientButton';
import { GET_POLICIES } from '../graphql/queries';

interface Policy {
  id: string;
  type: string;
  title: string;
  content: string;
  isActive: boolean;
}

interface LoginScreenProps {
  onSendOtp: (phone: string) => Promise<void> | void;
  loading?: boolean;
}

interface LoginFormValues {
  phone: string;
}

const loginSchema = Yup.object().shape({
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number')
    .required('Phone number is required'),
});

const LoginScreen: React.FC<LoginScreenProps> = ({ onSendOtp, loading }) => {
  const [countryCode] = useState('+91');
  const [policyModal, setPolicyModal] = useState<'USER' | 'VENUE' | 'HOST' | null>(null);
  const initialValues: LoginFormValues = { phone: '' };

  const { data: policyData, loading: loadingPolicies } = useQuery<{ policies: Policy[] }>(
    GET_POLICIES,
    {
      variables: { type: policyModal },
      skip: !policyModal,
      fetchPolicy: 'cache-and-network',
    },
  );

  const handleSubmit = (values: LoginFormValues) => {
    onSendOtp(countryCode + values.phone);
  };

  const policyModalTitle = policyModal === 'USER'
    ? 'Terms of Service'
    : policyModal === 'VENUE'
      ? 'Venue Policy'
      : policyModal === 'HOST'
        ? 'Host Policy'
        : '';

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
                    title={loading ? '' : 'Continue'}
                    onPress={() => formSubmit()}
                    disabled={!isValid || !dirty || loading}
                  >
                    {loading && <ActivityIndicator color={colors.white} size="small" />}
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

      {/* Policy Modal */}
      <Modal visible={!!policyModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{policyModalTitle}</Text>
              <TouchableOpacity onPress={() => setPolicyModal(null)} style={styles.modalCloseBtn}>
                <MaterialIcons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent}>
              {loadingPolicies ? (
                <View style={styles.modalLoading}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={styles.modalLoadingText}>Loading policy…</Text>
                </View>
              ) : policyData?.policies && policyData.policies.length > 0 ? (
                policyData.policies.map((p) => (
                  <View key={p.id} style={styles.policyCard}>
                    <Text style={styles.policyCardTitle}>{p.title}</Text>
                    <Text style={styles.policyCardContent}>{p.content}</Text>
                  </View>
                ))
              ) : (
                <View style={styles.modalLoading}>
                  <MaterialIcons name="info-outline" size={40} color={colors.textTertiary} />
                  <Text style={styles.modalLoadingText}>No policy content available yet.</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  policyLinksRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  policyLinkSmall: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  policyDot: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    minHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceVariant,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  modalCloseBtn: {
    padding: spacing.xs,
  },
  modalScroll: {
    flex: 1,
  },
  modalScrollContent: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    paddingBottom: 40,
  },
  modalLoading: {
    paddingVertical: spacing.xxxl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  modalLoadingText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  policyCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceVariant,
  },
  policyCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  policyCardContent: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
});

export default LoginScreen;
