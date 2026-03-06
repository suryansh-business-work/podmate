import { ComponentProps } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];

export interface IconButtonProps {
  /** MaterialIcons icon name */
  icon: MaterialIconName;
  /** Press handler */
  onPress: () => void;
  /** Icon size – defaults to 24 */
  size?: number;
  /** Explicit icon color; defaults to theme textSecondary */
  color?: string;
  /** Overall wrapper style */
  style?: StyleProp<ViewStyle>;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Accessibility label, announced by screen readers */
  accessibilityLabel: string;
  /** Optional accessibility hint for additional context */
  accessibilityHint?: string;
  /** Test ID for testing */
  testID?: string;
}
