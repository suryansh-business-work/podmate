import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import { OtpInput } from '../../../components/OtpInput';
import { GradientButton } from '../../../components/GradientButton';
import { useThemedStyles, useAppColors } from '../../../hooks/useThemedStyles';
import { OtpScreenProps } from './Otp.types';
import { createStyles } from './Otp.styles';

const RESEND_TIMER_SECONDS = 30;

const OtpScreen: React.FC<OtpScreenProps> = ({
  phone,
  onVerify,
  onBack,
  onResend,
  loading,
  error,
}) => {
  const styles = useThemedStyles(createStyles);
  const colors = useAppColors();
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(RESEND_TIMER_SECONDS);
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
    setTimer(RESEND_TIMER_SECONDS);
    setCanResend(false);
  };

  const handleVerify = () => {
    if (otp.length >= 6) {
      onVerify(otp);
    }
  };

  const maskedPhone = phone.replace(/(\d{2})(\d+)(\d{4})/, '$1****$3');

  return (
    <SafeAreaView style={styles.container} testID="otp-screen">
      <View style={styles.content}>
        <TouchableOpacity onPress={onBack} style={styles.backButton} testID="back-button">
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <Text style={styles.title} testID="otp-title">
          Verify your number
        </Text>
        <Text style={styles.subtitle} testID="otp-subtitle">
          We sent a 6-digit code to{'\n'}
          <Text style={styles.phoneHighlight} testID="masked-phone">
            {maskedPhone}
          </Text>
        </Text>

        <View style={styles.otpContainer} testID="otp-input-container">
          <OtpInput
            onComplete={(code) => {
              setOtp(code);
              onVerify(code);
            }}
            testID="otp-input"
          />
        </View>

        <View style={styles.resendContainer}>
          {canResend ? (
            <TouchableOpacity
              onPress={handleResend}
              disabled={resending}
              testID="resend-otp-button"
            >
              <Text style={styles.resendActive}>{resending ? 'Sending...' : 'Resend Code'}</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.resendTimer} testID="resend-timer">
              Resend code in{' '}
              <Text style={styles.timerHighlight} testID="timer-value">
                {timer}s
              </Text>
            </Text>
          )}
        </View>

        {error ? (
          <View style={styles.errorContainer} testID="otp-error-container">
            <MaterialIcons name="error-outline" size={16} color={colors.error} />
            <Text style={styles.errorText} testID="otp-error">
              {error}
            </Text>
          </View>
        ) : null}

        <GradientButton
          title={loading ? '' : 'Verify'}
          onPress={handleVerify}
          disabled={otp.length < 6 || loading}
          testID="verify-otp-button"
        >
          {loading && (
            <ActivityIndicator color={colors.white} size="small" testID="otp-loading-indicator" />
          )}
        </GradientButton>
      </View>
    </SafeAreaView>
  );
};

export default OtpScreen;
