import React from 'react';
import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { spacing } from '../../theme';
import { createStyles } from './CreatePod.styles';
import { useThemedStyles, useAppColors } from '../../hooks/useThemedStyles';

interface PayoutCardProps {
  feePerPerson: number;
  maxSeats: number;
}

const PayoutCard: React.FC<PayoutCardProps> = ({ feePerPerson, maxSeats }) => {
  const styles = useThemedStyles(createStyles);
  const colors = useAppColors();
  const grossRevenue = feePerPerson * maxSeats;
  const platformFee = grossRevenue * 0.05;
  const netRevenue = grossRevenue - platformFee;

  return (
    <View style={styles.payoutCardWrap}>
      <View style={styles.payoutHeader}>
        <MaterialIcons name="attach-money" size={20} color={colors.primary} />
        <Text style={styles.payoutTitle}>Potential Payout</Text>
      </View>
      <View style={styles.payoutRow}>
        <Text style={styles.payoutLabel}>
          Gross (₹{feePerPerson.toLocaleString()} × {maxSeats} seats)
        </Text>
        <Text style={styles.payoutValue}>₹{grossRevenue.toLocaleString()}</Text>
      </View>
      <View style={styles.payoutRow}>
        <Text style={[styles.payoutValue, { color: colors.error }]}>Platform Fee (5%)</Text>
        <Text style={[styles.payoutValue, { color: colors.error }]}>
          - ₹{platformFee.toLocaleString()}
        </Text>
      </View>
      <View style={{ height: 1, backgroundColor: colors.border, marginVertical: spacing.md }} />
      <View style={styles.payoutRow}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>You Receive</Text>
        <Text style={{ fontSize: 24, fontWeight: '700', color: colors.primary }}>
          ₹{netRevenue.toLocaleString()}
        </Text>
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          marginTop: spacing.md,
        }}
      >
        <MaterialIcons name="lock" size={14} color={colors.textSecondary} />
        <Text style={{ fontSize: 12, color: colors.textSecondary, flex: 1 }}>
          Funds held securely in escrow until event completion.
        </Text>
      </View>
    </View>
  );
};

export default PayoutCard;
