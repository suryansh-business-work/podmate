import React, { Component } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { lightColors } from '../colors';
import { spacing, borderRadius } from '../theme';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallbackMessage?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Production logging - can be sent to a remote service
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.error('[ErrorBoundary]', error.message, errorInfo.componentStack);
    }
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <MaterialIcons
            name="error-outline"
            size={64}
            color={lightColors.error}
            style={styles.icon}
          />
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            {this.props.fallbackMessage ?? 'An unexpected error occurred. Please try again.'}
          </Text>
          {__DEV__ && this.state.error && (
            <Text style={styles.devError}>{this.state.error.message}</Text>
          )}
          <TouchableOpacity style={styles.retryBtn} onPress={this.handleRetry} activeOpacity={0.7}>
            <MaterialIcons name="refresh" size={20} color={lightColors.white} />
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxxl,
    backgroundColor: lightColors.background,
  },
  icon: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: lightColors.text,
    marginBottom: spacing.sm,
  },
  message: {
    fontSize: 14,
    color: lightColors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.xl,
  },
  devError: {
    fontSize: 12,
    color: lightColors.error,
    fontFamily: 'monospace',
    padding: spacing.md,
    backgroundColor: lightColors.surfaceVariant,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.lg,
    maxWidth: '100%',
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: lightColors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  retryText: {
    color: lightColors.white,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ErrorBoundary;
