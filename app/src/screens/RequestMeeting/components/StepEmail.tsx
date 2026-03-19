import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useMutation } from '@apollo/client';

import { SEND_EMAIL_OTP, VERIFY_EMAIL_OTP } from '../../../graphql/mutations';
import { createStyles } from '../RequestMeeting.styles';
import { useThemedStyles, useAppColors } from '../../../hooks/useThemedStyles';

interface StepEmailProps {
  userEmail: string;
  isEmailVerified: boolean;
  email: string;
  updateProfileEmail: boolean;
  onEmailChange: (email: string) => void;
  onUpdateProfileChange: (value: boolean) => void;
  onEmailVerified: (email: string) => void;
  onContinue: () => void;
}

const StepEmail: React.FC<StepEmailProps> = ({
  userEmail,
  isEmailVerified,
  email,
  updateProfileEmail,
  onEmailChange,
  onUpdateProfileChange,
  onEmailVerified,
  onContinue,
}) => {
  const styles = useThemedStyles(createStyles);
  const colors = useAppColors();
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [verified, setVerified] = useState(isEmailVerified && userEmail === email);

  const [sendOtp, { loading: sendingOtp }] = useMutation(SEND_EMAIL_OTP);
  const [verifyOtp, { loading: verifyingOtp }] = useMutation(VERIFY_EMAIL_OTP);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValidEmail = emailRegex.test(email.trim());

  const handleSendOtp = useCallback(async () => {
    if (!isValidEmail) return;
    try {
      await sendOtp({ variables: { email: email.trim() } });
      setOtpSent(true);
      Alert.alert('OTP Sent', `Verification code sent to ${email.trim()}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send OTP';
      Alert.alert('Error', message);
    }
  }, [email, isValidEmail, sendOtp]);

  const handleVerifyOtp = useCallback(async () => {
    if (otp.length < 6) return;
    try {
      await verifyOtp({ variables: { email: email.trim(), otp } });
      setVerified(true);
      onEmailVerified(email.trim());
      Alert.alert('Verified', 'Email verified successfully!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to verify OTP';
      Alert.alert('Error', message);
    }
  }, [email, otp, verifyOtp, onEmailVerified]);

  const alreadyVerified = isEmailVerified && userEmail === email.trim() && userEmail !== '';

  const canContinue = verified || alreadyVerified;

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Email Verification</Text>
      <Text style={styles.helperText}>
        We need your email to send you the meeting invite. Please verify your email address.
      </Text>

      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Email Address</Text>
        <View style={[styles.inputRow, !isValidEmail && email.length > 0 && styles.inputRowError]}>
          <MaterialIcons
            name="email"
            size={18}
            color={colors.textTertiary}
            style={{ marginRight: 8 }}
          />
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={(val) => {
              onEmailChange(val);
              setVerified(false);
              setOtpSent(false);
              setOtp('');
            }}
            placeholder="Enter your email"
            placeholderTextColor={colors.textTertiary}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!alreadyVerified}
          />
          {alreadyVerified && (
            <MaterialIcons name="check-circle" size={20} color="#2E7D32" />
          )}
        </View>
        {!isValidEmail && email.length > 0 && (
          <Text style={styles.errorText}>Please enter a valid email address</Text>
        )}
      </View>

      {alreadyVerified && (
        <View style={styles.verifiedBadge}>
          <MaterialIcons name="verified" size={18} color="#2E7D32" />
          <Text style={styles.verifiedText}>Email already verified</Text>
        </View>
      )}

      {!alreadyVerified && !verified && (
        <>
          {!otpSent ? (
            <TouchableOpacity
              style={[styles.verifyBtn, (!isValidEmail || sendingOtp) && styles.verifyBtnDisabled]}
              onPress={handleSendOtp}
              disabled={!isValidEmail || sendingOtp}
            >
              {sendingOtp ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <Text style={styles.verifyBtnText}>Send Verification Code</Text>
              )}
            </TouchableOpacity>
          ) : (
            <>
              <View style={styles.otpRow}>
                <TextInput
                  style={styles.otpInput}
                  value={otp}
                  onChangeText={setOtp}
                  placeholder="Enter 6-digit code"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="number-pad"
                  maxLength={6}
                />
              </View>
              <TouchableOpacity
                style={[
                  styles.verifyBtn,
                  (otp.length < 6 || verifyingOtp) && styles.verifyBtnDisabled,
                ]}
                onPress={handleVerifyOtp}
                disabled={otp.length < 6 || verifyingOtp}
              >
                {verifyingOtp ? (
                  <ActivityIndicator color={colors.white} size="small" />
                ) : (
                  <Text style={styles.verifyBtnText}>Verify Email</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSendOtp}
                disabled={sendingOtp}
                style={{ marginTop: 12, alignItems: 'center' }}
              >
                <Text style={{ color: colors.primary, fontSize: 13 }}>Resend Code</Text>
              </TouchableOpacity>
            </>
          )}
        </>
      )}

      {verified && !alreadyVerified && (
        <View style={styles.verifiedBadge}>
          <MaterialIcons name="check-circle" size={18} color="#2E7D32" />
          <Text style={styles.verifiedText}>Email verified successfully</Text>
        </View>
      )}

      {(verified || alreadyVerified) && userEmail !== email.trim() && (
        <TouchableOpacity
          style={[styles.checkboxRow, { marginTop: 16 }]}
          onPress={() => onUpdateProfileChange(!updateProfileEmail)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, updateProfileEmail && styles.checkboxActive]}>
            {updateProfileEmail && <MaterialIcons name="check" size={16} color={colors.white} />}
          </View>
          <Text style={styles.checkboxLabel}>Also update this email in my profile</Text>
        </TouchableOpacity>
      )}

      <View style={styles.btnContainer}>
        <TouchableOpacity
          style={[styles.submitBtn, !canContinue && styles.submitBtnDisabled]}
          onPress={onContinue}
          disabled={!canContinue}
        >
          <Text style={styles.submitBtnText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default StepEmail;
