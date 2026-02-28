import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius } from '../theme';
import { GradientButton } from '../components/GradientButton';

interface CreatePodScreenProps {
  onClose: () => void;
  onCreate: (data: {
    title: string;
    description: string;
    feePerPerson: number;
    maxSeats: number;
  }) => void;
}

const CreatePodScreen: React.FC<CreatePodScreenProps> = ({ onClose, onCreate }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fee, setFee] = useState('1200');
  const [maxSeats, setMaxSeats] = useState(10);

  const feeNum = parseInt(fee, 10) || 0;
  const grossRevenue = feeNum * maxSeats;
  const platformFee = grossRevenue * 0.05;
  const netRevenue = grossRevenue - platformFee;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Host a Pod</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '33%' }]} />
        </View>
        <View style={styles.stepRow}>
          <Text style={styles.stepActive}>STEP 1 OF 3</Text>
          <Text style={styles.stepLabel}>Details & Pricing</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Intro */}
        <Text style={styles.title}>Let's set up your Pod.</Text>
        <Text style={styles.subtitle}>Create a space for your micro-community event.</Text>

        {/* Pod Title */}
        <Text style={styles.inputLabel}>POD TITLE</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Sushi Masterclass"
          placeholderTextColor={colors.textTertiary}
          value={title}
          onChangeText={setTitle}
        />

        {/* Description */}
        <Text style={styles.inputLabel}>THE PLAN</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          placeholder="Describe what you'll be doing..."
          placeholderTextColor={colors.textTertiary}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          value={description}
          onChangeText={setDescription}
        />

        {/* Logistics */}
        <Text style={styles.sectionTitle}>Logistics</Text>

        <View style={styles.logisticsRow}>
          <View style={styles.logisticsItem}>
            <Text style={styles.inputLabel}>FEE PER PERSON</Text>
            <View style={styles.feeInput}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                style={styles.feeTextInput}
                keyboardType="number-pad"
                value={fee}
                onChangeText={setFee}
              />
            </View>
          </View>

          <View style={styles.logisticsItem}>
            <Text style={styles.inputLabel}>MAX SEATS</Text>
            <View style={styles.counterRow}>
              <TouchableOpacity
                style={styles.counterButton}
                onPress={() => setMaxSeats(Math.max(1, maxSeats - 1))}
              >
                <Text style={styles.counterButtonText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.counterValue}>{maxSeats}</Text>
              <TouchableOpacity
                style={styles.counterButton}
                onPress={() => setMaxSeats(maxSeats + 1)}
              >
                <Text style={styles.counterButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Date Picker */}
        <Text style={styles.inputLabel}>WHEN</Text>
        <TouchableOpacity style={styles.datePickerRow}>
          <Text style={styles.dateIcon}>📅</Text>
          <Text style={styles.dateText}>Select Date & Time</Text>
          <Text style={styles.dateArrow}>›</Text>
        </TouchableOpacity>

        {/* Payout Calculator */}
        <View style={styles.payoutCard}>
          <View style={styles.payoutHeader}>
            <Text style={styles.payoutIcon}>💰</Text>
            <Text style={styles.payoutTitle}>Potential Payout</Text>
          </View>

          <View style={styles.payoutRow}>
            <Text style={styles.payoutLabel}>
              Gross (₹{feeNum.toLocaleString()} × {maxSeats} seats)
            </Text>
            <Text style={styles.payoutValue}>₹{grossRevenue.toLocaleString()}</Text>
          </View>

          <View style={styles.payoutRow}>
            <Text style={styles.payoutLabel}>Platform Fee (5%)</Text>
            <Text style={[styles.payoutValue, styles.payoutFee]}>
              - ₹{platformFee.toLocaleString()}
            </Text>
          </View>

          <View style={styles.payoutDivider} />

          <View style={styles.payoutRow}>
            <Text style={styles.payoutNetLabel}>You Receive</Text>
            <Text style={styles.payoutNetValue}>₹{netRevenue.toLocaleString()}</Text>
          </View>

          <View style={styles.escrowNote}>
            <Text style={styles.escrowIcon}>🔒</Text>
            <Text style={styles.escrowText}>
              Funds held securely in escrow until event completion.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom */}
      <View style={styles.bottom}>
        <GradientButton
          title="Continue →"
          onPress={() => onCreate({ title, description, feePerPerson: feeNum, maxSeats })}
          disabled={!title}
        />
        <View style={styles.verifiedRow}>
          <Text style={styles.verifiedIcon}>✓</Text>
          <Text style={styles.verifiedText}>Verified Host Status Required</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  closeIcon: {
    fontSize: 20,
    color: colors.text,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  progressContainer: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 2,
    marginBottom: spacing.md,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  stepRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepActive: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  stepLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: spacing.xxl,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: 1,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.white,
  },
  textArea: {
    minHeight: 100,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.xxl,
    marginBottom: spacing.sm,
  },
  logisticsRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  logisticsItem: {
    flex: 1,
  },
  feeInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  currencySymbol: {
    fontSize: 16,
    color: colors.textSecondary,
    marginRight: spacing.xs,
  },
  feeTextInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  counterButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
  },
  counterButtonText: {
    fontSize: 18,
    color: colors.textSecondary,
  },
  counterValue: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  datePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    gap: spacing.md,
  },
  dateIcon: {
    fontSize: 18,
  },
  dateText: {
    flex: 1,
    fontSize: 15,
    color: colors.textSecondary,
  },
  dateArrow: {
    fontSize: 20,
    color: colors.textTertiary,
  },
  payoutCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    marginTop: spacing.xxl,
    marginBottom: spacing.xxxl,
  },
  payoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  payoutIcon: {
    fontSize: 18,
  },
  payoutTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  payoutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  payoutLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  payoutValue: {
    fontSize: 14,
    color: colors.text,
  },
  payoutFee: {
    color: colors.error,
  },
  payoutDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  payoutNetLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  payoutNetValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
  },
  escrowNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  escrowIcon: {
    fontSize: 14,
  },
  escrowText: {
    fontSize: 12,
    color: colors.textSecondary,
    flex: 1,
  },
  bottom: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
    paddingTop: spacing.md,
  },
  verifiedRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  verifiedIcon: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  verifiedText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
});

export default CreatePodScreen;
