import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors, spacing } from '../theme';
import { OtpInput } from '../components/OtpInput';
import { GradientButton } from '../components/GradientButton';

interface OtpScreenProps {
  phone: string;
  onVerify: (otp: string) => Promise<void> | void;
  onBack: () => void;
  onResend: () => Promise<void> | void;
  loading?: boolean;
  error?: string;
}

const OtpScreen: React.FC<OtpScreenProps> = ({ phone, onVerify, onBack, onResend, loading, error }) => {
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleResend = async () => {
    setResending(true);
    try {
      await onResend();
    } finally {
      setResending(false);
    }
    setTimer(30);
    setCanResend(false);
  };

  const maskedPhone = phone.replace(/(\d{2})(\d+)(\d{4})/, '$1****$3');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <Text style={styles.title}>Verify your number</Text>
        <Text style={styles.subtitle}>
          We sent a 6-digit code to{'\n'}
          <Text style={styles.phoneHighlight}>{maskedPhone}</Text>
        </Text>

        <View style={styles.otpContainer}>
          <OtpInput
            onComplete={(code) => {
              setOtp(code);
              onVerify(code);
            }}
          />
        </View>

        <View style={styles.resendContainer}>
          {canResend ? (
            <TouchableOpacity onPress={handleResend} disabled={resending}>
              <Text style={styles.resendActive}>{resending ? 'Sending...' : 'Resend Code'}</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.resendTimer}>
              Resend code in <Text style={styles.timerHighlight}>{timer}s</Text>
            </Text>
          )}
        </View>

        {error ? (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={16} color={colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <GradientButton title={loading ? '' : 'Verify'} onPress={() => onVerify(otp)} disabled={otp.length < 6 || loading}>
          {loading && <ActivityIndicator color={colors.white} size="small" />}
        </GradientButton>
      </View>
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
    paddingTop: spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: spacing.xxxl,
  },
  phoneHighlight: {
    color: colors.text,
    fontWeight: '600',
  },
  otpContainer: {
    marginBottom: spacing.xxxl,
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  resendTimer: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  timerHighlight: {
    color: colors.primary,
    fontWeight: '600',
  },
  resendActive: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.lg,
  },
  errorText: {
    fontSize: 13,
    color: colors.error,
    flex: 1,
  },
});

export default OtpScreen;
