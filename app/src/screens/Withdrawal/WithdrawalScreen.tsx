import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@apollo/client';
import { MaterialIcons } from '@expo/vector-icons';

import { GET_ME } from '../../graphql/queries';
import {
  WithdrawalScreenProps,
  TransactionFilter,
  TRANSACTION_FILTERS,
} from './Withdrawal.types';
import { createStyles } from './Withdrawal.styles';
import { useThemedStyles, useAppColors } from '../../hooks/useThemedStyles';

const WithdrawalScreen: React.FC<WithdrawalScreenProps> = ({ onBack }) => {
  const styles = useThemedStyles(createStyles);
  const colors = useAppColors();
  const [activeFilter, setActiveFilter] = useState<TransactionFilter>('ALL');

  const { data } = useQuery(GET_ME, { fetchPolicy: 'cache-first' });
  const user = data?.me;
  const isHost = user?.activeRole === 'HOST';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Withdrawal</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Earnings card */}
        <View style={styles.earningsCard}>
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.earningsGradient}
          >
            <View style={styles.earningsRow}>
              <View style={styles.earningItem}>
                <Text style={styles.earningValue}>₹0</Text>
                <Text style={styles.earningLabel}>Total Earned</Text>
              </View>
              <View style={styles.earningItem}>
                <Text style={styles.earningValue}>₹0</Text>
                <Text style={styles.earningLabel}>Available</Text>
              </View>
            </View>
            <View style={styles.earningsRow}>
              <View style={styles.earningItem}>
                <Text style={styles.earningValue}>₹0</Text>
                <Text style={styles.earningLabel}>Pending</Text>
              </View>
              <View style={styles.earningItem}>
                <Text style={styles.earningValue}>₹0</Text>
                <Text style={styles.earningLabel}>Withdrawn</Text>
              </View>
            </View>
            <TouchableOpacity style={[styles.withdrawBtn, styles.withdrawBtnDisabled]} disabled>
              <Text style={styles.withdrawBtnText}>Withdraw Funds</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Bank section */}
        <View style={styles.bankSection}>
          <Text style={styles.bankTitle}>Bank Account</Text>
          <View style={styles.bankRow}>
            <MaterialIcons name="account-balance" size={20} color={colors.textTertiary} />
            <Text style={styles.bankText}>No bank account linked</Text>
          </View>
          <TouchableOpacity style={styles.addBankBtn}>
            <MaterialIcons name="add-circle-outline" size={18} color={colors.primary} />
            <Text style={styles.addBankText}>Add Bank Account</Text>
          </TouchableOpacity>
        </View>

        {/* Filters */}
        <View style={styles.filterRow}>
          {TRANSACTION_FILTERS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.filterChip, activeFilter === tab.key && styles.filterChipActive]}
              onPress={() => setActiveFilter(tab.key)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  activeFilter === tab.key && styles.filterChipTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Transaction History</Text>

        {/* Empty state */}
        <View style={[styles.centered, { flex: 0, paddingVertical: 60 }]}>
          <MaterialIcons name="savings" size={56} color={colors.textTertiary} />
          <Text style={styles.emptyTitle}>No transactions yet</Text>
          <Text style={styles.emptySubtitle}>
            {isHost
              ? 'Start earning by hosting pods! Your earnings and withdrawals will appear here.'
              : 'Start earning by hosting events at your venues! Your earnings and withdrawals will appear here.'}
          </Text>
          <View style={styles.comingSoonBadge}>
            <Text style={styles.comingSoonText}>Withdrawal Coming Soon</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default WithdrawalScreen;
