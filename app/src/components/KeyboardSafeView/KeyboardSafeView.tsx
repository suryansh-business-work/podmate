import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  type ViewStyle,
  type StyleProp,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface KeyboardSafeViewProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Extra offset to add on iOS (e.g. for headers) */
  keyboardVerticalOffset?: number;
}

/**
 * Reusable wrapper that handles keyboard avoidance on both iOS and Android.
 * - iOS: uses `padding` behavior with configurable offset
 * - Android: uses `height` behavior to prevent inputs from being covered
 */
const KeyboardSafeView: React.FC<KeyboardSafeViewProps> = ({
  children,
  style,
  keyboardVerticalOffset,
}) => {
  const insets = useSafeAreaInsets();
  const defaultOffset = Platform.OS === 'ios' ? insets.top + 10 : 0;

  return (
    <KeyboardAvoidingView
      style={[styles.container, style]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={keyboardVerticalOffset ?? defaultOffset}
    >
      {children}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default KeyboardSafeView;
