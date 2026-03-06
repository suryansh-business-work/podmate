import React, { useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { spacing } from '../../theme';
import { GradientButton } from '../../components/GradientButton';
import { PolicyItem } from './RegisterPlace.types';
import { createStyles } from './RegisterPlace.styles';
import { useThemedStyles, useAppColors } from '../../hooks/useThemedStyles';

interface StepPoliciesProps {
  policies: PolicyItem[];
  policiesLoading: boolean;
  policiesAccepted: boolean;
  hasScrolledPolicies: boolean;
  submitting?: boolean;
  onToggleAccepted: () => void;
  onScrolledToBottom: () => void;
  onSubmit: () => void;
}

const StepPolicies: React.FC<StepPoliciesProps> = ({
  policies,
  policiesLoading,
  policiesAccepted,
  hasScrolledPolicies,
  submitting,
  onToggleAccepted,
  onScrolledToBottom,
  onSubmit,
}) => {
  const styles = useThemedStyles(createStyles);
  const colors = useAppColors();
  const layoutHeightRef = useRef(0);

  return (
    <ScrollView
      style={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      onLayout={(e) => {
        layoutHeightRef.current = e.nativeEvent.layout.height;
      }}
      onContentSizeChange={(_, contentHeight) => {
        /* If content is shorter than the viewport, no scroll is possible — unlock immediately */
        if (layoutHeightRef.current > 0 && contentHeight <= layoutHeightRef.current) {
          onScrolledToBottom();
        }
      }}
      onScroll={({ nativeEvent }) => {
        const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
        const isCloseToBottom =
          layoutMeasurement.height + contentOffset.y >= contentSize.height - 40;
        if (isCloseToBottom) onScrolledToBottom();
      }}
      scrollEventThrottle={400}
    >
      <Text style={styles.sectionTitle}>Venue Policies</Text>
      <Text style={styles.helperText}>
        Please read and accept all venue policies before registering.
      </Text>
      {policiesLoading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing.xxl }} />
      ) : policies.length === 0 ? (
        <View style={styles.emptyPolicies}>
          <MaterialIcons name="policy" size={40} color={colors.textTertiary} />
          <Text style={styles.emptyPoliciesText}>No policies available at this time.</Text>
        </View>
      ) : (
        policies.map((policy) => (
          <View key={policy.id} style={styles.policyCard}>
            <View style={styles.policyHeader}>
              <MaterialIcons name="article" size={18} color={colors.primary} />
              <Text style={styles.policyTitle}>{policy.title}</Text>
            </View>
            <Text style={styles.policyContent}>{policy.content}</Text>
          </View>
        ))
      )}
      {!policiesLoading && policies.length > 0 && (
        <>
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => hasScrolledPolicies && onToggleAccepted()}
            activeOpacity={hasScrolledPolicies ? 0.7 : 1}
          >
            <View style={[styles.checkbox, policiesAccepted && styles.checkboxActive]}>
              {policiesAccepted && <MaterialIcons name="check" size={16} color={colors.white} />}
            </View>
            <Text style={[styles.checkboxLabel, !hasScrolledPolicies && styles.checkboxDisabled]}>
              I have read and accept all venue policies
            </Text>
          </TouchableOpacity>
          {!hasScrolledPolicies && (
            <Text style={styles.scrollHint}>
              <MaterialIcons name="info-outline" size={13} color={colors.textTertiary} /> Scroll to
              the bottom to enable acceptance
            </Text>
          )}
        </>
      )}
      <View style={styles.btnContainer}>
        <GradientButton
          title={submitting ? 'Submitting…' : 'Submit Registration'}
          onPress={onSubmit}
          disabled={(!policiesAccepted && policies.length > 0) || submitting}
        />
      </View>
    </ScrollView>
  );
};

export default StepPolicies;
