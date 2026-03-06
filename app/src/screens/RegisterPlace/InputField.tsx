import React from 'react';
import { View, Text, TextInput } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { spacing } from '../../theme';
import { createStyles } from './RegisterPlace.styles';
import { useThemedStyles, useAppColors } from '../../hooks/useThemedStyles';

interface InputFieldProps {
  label: string;
  icon: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: (e: unknown) => void;
  error?: string;
  placeholder?: string;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: 'default' | 'numeric';
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  icon,
  value,
  onChangeText,
  onBlur,
  error,
  placeholder,
  multiline,
  numberOfLines,
  keyboardType,
}) => {
  const styles = useThemedStyles(createStyles);
  const colors = useAppColors();
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.inputRow, error ? styles.inputRowError : null]}>
        <MaterialIcons
          name={icon}
          size={18}
          color={colors.textTertiary}
          style={{ marginRight: spacing.sm }}
        />
        <TextInput
          style={[styles.input, multiline && styles.inputMultiline]}
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur as () => void}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          multiline={multiline}
          numberOfLines={numberOfLines}
          keyboardType={keyboardType}
        />
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

export default InputField;
