import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../theme';
import { OtpInput } from '../components/OtpInput';
import { GradientButton } from '../components/GradientButton';

interface OtpScreenProps {
  phone: string;
  onVerify: (otp: string) => void;
  onBack: () => void;
}

const OtpScreen: React.FC<OtpScreenProps> = ({ phone, onVerify, onBack }) => {
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

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

  const handleResend = () => {
    setTimer(30);
    setCanResend(false);
  };

  const maskedPhone = phone.replace(/(\d{2})(\d+)(\d{4})/, '$1****$3');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Back Button */}
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        {/* Header */}
        <Text style={styles.title}>Verify your number</Text>
        <Text style={styles.subtitle}>
          We sent a 6-digit code to{'\n'}
          <Text style={styles.phoneHighlight}>{maskedPhone}</Text>
        </Text>

        {/* OTP Input */}
        <View style={styles.otpContainer}>
          <OtpInput
            onComplete={(code) => {
              setOtp(code);
              onVerify(code);
            }}
          />
        </View>

        {/* Resend */}
        <View style={styles.resendContainer}>
          {canResend ? (
            <TouchableOpacity onPress={handleResend}>
              <Text style={styles.resendActive}>Resend Code</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.resendTimer}>
              Resend code in <Text style={styles.timerHighlight}>{timer}s</Text>
            </Text>
          )}
        </View>

        {/* Verify Button */}
        <GradientButton title="Verify" onPress={() => onVerify(otp)} disabled={otp.length < 6} />
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
  backArrow: {
    fontSize: 24,
    color: colors.text,
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
});

export default OtpScreen;
