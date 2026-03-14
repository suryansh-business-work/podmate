import React from 'react';
import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import type { CheckoutPodData } from './Checkout.types';
import { createStyles } from './Checkout.styles';
import { useThemedStyles, useAppColors } from '../../hooks/useThemedStyles';

interface OrderSummaryProps {
  pod: CheckoutPodData;
  podFeePercent: number;
  podFeeSource: string;
  platformFeeAmount: number;
  totalAmount: number;
  totalSubscriptionCost: number;
  billingLabel: string;
  isOccurrence: boolean;
  formattedDate: string;
  formattedTime: string;
  spotsLeft: number;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  pod,
  podFeePercent,
  podFeeSource,
  platformFeeAmount,
  totalAmount,
  totalSubscriptionCost,
  billingLabel,
  isOccurrence,
  formattedDate,
  formattedTime,
  spotsLeft,
}) => {
  const styles = useThemedStyles(createStyles);
  const colors = useAppColors();

  return (
    <>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>
            {isOccurrence ? `Fee per ${billingLabel}` : 'Pod Fee (1 person)'}
          </Text>
          <Text style={styles.rowValue}>₹{pod.feePerPerson.toLocaleString()}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>
            Platform Fee ({podFeePercent}%)
            {podFeeSource !== 'GLOBAL' ? ' ✦' : ''}
          </Text>
          <Text style={styles.rowValue}>₹{platformFeeAmount.toLocaleString()}</Text>
        </View>
        {isOccurrence && (
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Billing Cycles</Text>
            <Text style={styles.rowValue}>
              {pod.occurrenceCount || 1} × {billingLabel}ly
            </Text>
          </View>
        )}
        <View style={styles.divider} />
        {isOccurrence ? (
          <>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Due Today</Text>
              <Text style={styles.totalValue}>₹{totalAmount.toLocaleString()}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Total over subscription</Text>
              <Text style={styles.rowValue}>₹{totalSubscriptionCost.toLocaleString()}</Text>
            </View>
          </>
        ) : (
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₹{totalAmount.toLocaleString()}</Text>
          </View>
        )}
      </View>

      {isOccurrence && (
        <View style={styles.subscriptionBadge}>
          <MaterialIcons name="autorenew" size={20} color={colors.primary} />
          <Text style={styles.subscriptionText}>
            This is a recurring pod. You will be charged ₹{totalAmount.toLocaleString()} per{' '}
            {billingLabel} for {pod.occurrenceCount || 1} cycles. You can cancel anytime.
          </Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Event Details</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Date & Time</Text>
          <Text style={styles.rowValue}>
            {formattedDate}, {formattedTime}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Host</Text>
          <Text style={styles.rowValue}>{pod.host.name}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Spots Left</Text>
          <Text style={styles.rowValue}>
            {spotsLeft} / {pod.maxSeats}
          </Text>
        </View>
        {isOccurrence && pod.recurrence && (
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Recurrence</Text>
            <Text style={styles.rowValue}>{pod.recurrence}</Text>
          </View>
        )}
      </View>
    </>
  );
};

export default OrderSummary;
