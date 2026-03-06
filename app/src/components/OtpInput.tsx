import React, { useRef, useState, memo } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from 'react-native';
import { borderRadius } from '../theme';
import { useThemedStyles, useAppColors, ThemeUtils } from '../hooks/useThemedStyles';

interface OtpInputProps {
  length?: number;
  onComplete: (otp: string) => void;
  testID?: string;
}

export const OtpInput: React.FC<OtpInputProps> = memo(function OtpInput({ length = 6, onComplete, testID }) {
  const styles = useThemedStyles(createStyles);
  const colors = useAppColors();
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(''));
  const inputs = useRef<(TextInput | null)[]>([]);

  const handleChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }

    if (newOtp.every((digit) => digit !== '')) {
      onComplete(newOtp.join(''));
    }
  };

  const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
    }
  };

  return (
    <View style={styles.container} testID={testID} accessibilityRole="none" accessibilityLabel="OTP input">
      {otp.map((digit, index) => (
        <TextInput
          key={index}
          ref={(ref) => {
            inputs.current[index] = ref;
          }}
          style={[styles.input, digit ? styles.inputFilled : null]}
          maxLength={1}
          keyboardType="number-pad"
          value={digit}
          onChangeText={(text) => handleChange(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          autoFocus={index === 0}
          testID={testID ? `${testID}-${index}` : undefined}
          accessibilityLabel={`Digit ${index + 1} of ${length}`}
          accessibilityHint="Enter a single digit"
        />
      ))}
    </View>
  );
});

const createStyles = ({ colors, spacing, borderRadius }: ThemeUtils) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 12,
    },
    input: {
      width: 48,
      height: 56,
      borderRadius: borderRadius.md,
      borderWidth: 2,
      borderColor: colors.border,
      textAlign: 'center',
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
      backgroundColor: colors.surface,
    },
    inputFilled: {
      borderColor: colors.primary,
      backgroundColor: colors.surface,
    },
  });
