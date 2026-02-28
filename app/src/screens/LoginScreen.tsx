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
import { colors, spacing, borderRadius } from '../theme';
import { GradientButton } from '../components/GradientButton';

interface LoginScreenProps {
  onSendOtp: (phone: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onSendOtp }) => {
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');

  const handleContinue = () => {
    if (phone.length >= 10) {
      onSendOtp(countryCode + phone);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.topSection}>
          {/* Logo */}
          <LinearGradient
            colors={[colors.primaryLight, colors.primary]}
            style={styles.logoBox}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.logoIcon}>👥</Text>
          </LinearGradient>

          {/* Welcome Text */}
          <Text style={styles.title}>Welcome to PartyWings</Text>
          <Text style={styles.subtitle}>Enter your phone number to join or create your Pod.</Text>

          {/* Phone Input */}
          <Text style={styles.inputLabel}>PHONE NUMBER</Text>
          <View style={styles.phoneInputRow}>
            <TouchableOpacity style={styles.countryCodeBox}>
              <Text style={styles.countryCodeText}>{countryCode}</Text>
              <Text style={styles.dropdownArrow}>▾</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.phoneInput}
              placeholder="555 000-0000"
              placeholderTextColor={colors.textTertiary}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              maxLength={10}
            />
          </View>

          {/* Secure Badge */}
          <View style={styles.secureBadge}>
            <Text style={styles.secureIcon}>🛡️</Text>
            <Text style={styles.secureText}>Secure, passwordless login</Text>
          </View>
        </View>

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          <GradientButton title="Continue" onPress={handleContinue} disabled={phone.length < 10} />
          <Text style={styles.termsText}>
            By continuing, you agree to our <Text style={styles.termsLink}>Terms of Service</Text>{' '}
            and <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>
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
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
  },
  topSection: {
    paddingTop: 60,
  },
  logoBox: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  logoIcon: {
    fontSize: 26,
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
    marginBottom: spacing.md,
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
  dropdownArrow: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    fontSize: 16,
    color: colors.text,
  },
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  secureIcon: {
    fontSize: 16,
  },
  secureText: {
    fontSize: 14,
    color: colors.success,
    fontWeight: '500',
  },
  bottomSection: {
    paddingBottom: 40,
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
