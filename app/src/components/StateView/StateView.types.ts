import { ComponentProps } from 'react';
import { MaterialIcons } from '@expo/vector-icons';

type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];

export interface EmptyStateProps {
  /** Icon to display – defaults to "inbox" */
  icon?: MaterialIconName;
  /** Title text */
  title: string;
  /** Optional subtitle text */
  subtitle?: string;
  /** Optional action button label */
  actionLabel?: string;
  /** Action button handler */
  onAction?: () => void;
  /** Test ID */
  testID?: string;
}

export interface ErrorStateProps {
  /** Error message to display */
  message?: string;
  /** Retry handler */
  onRetry?: () => void;
  /** Test ID */
  testID?: string;
}

export interface LoadingStateProps {
  /** Optional text displayed below the spinner */
  message?: string;
  /** Test ID */
  testID?: string;
}

export interface OfflineStateProps {
  /** Retry handler */
  onRetry?: () => void;
  /** Test ID */
  testID?: string;
}
