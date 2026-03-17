import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery, useMutation } from '@apollo/client';
import { MaterialIcons } from '@expo/vector-icons';

import { GET_ME, GET_MY_BANK_ACCOUNT } from '../../graphql/queries';
import { ADD_BANK_ACCOUNT, DELETE_BANK_ACCOUNT } from '../../graphql/mutations';
import { WithdrawalScreenProps, TransactionFilter, TRANSACTION_FILTERS } from './Withdrawal.types';
import { createStyles } from './Withdrawal.styles';
import { useThemedStyles, useAppColors } from '../../hooks/useThemedStyles';

interface BankAccountData {
  id: string;
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  isVerified: boolean;
}

const WithdrawalScreen: React.FC<WithdrawalScreenProps> = () => {
  const styles = useThemedStyles(createStyles);
  const colors = useAppColors();
  const [activeFilter, setActiveFilter] = useState<TransactionFilter>('ALL');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
  });

  const { data } = useQuery(GET_ME, { fetchPolicy: 'cache-first' });
  const user = data?.me;
  const isHost = user?.activeRole === 'HOST';

  const {
    data: bankData,
    loading: bankLoading,
    refetch: refetchBank,
  } = useQuery<{ myBankAccount: BankAccountData | null }>(GET_MY_BANK_ACCOUNT, {
    fetchPolicy: 'cache-and-network',
  });

  const bankAccount = bankData?.myBankAccount ?? null;

  const [addBankAccount, { loading: addingBank }] = useMutation(ADD_BANK_ACCOUNT, {
    refetchQueries: [{ query: GET_MY_BANK_ACCOUNT }],
  });

  const [deleteBankAccount, { loading: deletingBank }] = useMutation(DELETE_BANK_ACCOUNT, {
    refetchQueries: [{ query: GET_MY_BANK_ACCOUNT }],
  });

  const handleAddBank = async () => {
    const { accountHolderName, bankName, accountNumber, ifscCode } = formData;
    if (!accountHolderName.trim() || !bankName.trim() || !accountNumber.trim() || !ifscCode.trim()) {
      Alert.alert('Validation', 'Please fill all fields');
      return;
    }
    try {
      await addBankAccount({
        variables: {
          input: {
            accountHolderName: accountHolderName.trim(),
            bankName: bankName.trim(),
            accountNumber: accountNumber.trim(),
            ifscCode: ifscCode.trim().toUpperCase(),
          },
        },
      });
      setShowAddForm(false);
      setFormData({ accountHolderName: '', bankName: '', accountNumber: '', ifscCode: '' });
      Alert.alert('Success', 'Bank account added successfully');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to add bank account';
      Alert.alert('Error', message);
    }
  };

  const handleDeleteBank = () => {
    Alert.alert('Remove Bank Account', 'Are you sure you want to remove your bank account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteBankAccount();
            await refetchBank();
          } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to remove bank account';
            Alert.alert('Error', message);
          }
        },
      },
    ]);
  };

  const maskedAccountNumber = (num: string): string => {
    if (num.length <= 4) return num;
    return '••••' + num.slice(-4);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Withdrawal</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
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
          {bankLoading && !bankAccount && (
            <ActivityIndicator size="small" color={colors.primary} />
          )}
          {bankAccount ? (
            <View>
              <View style={styles.bankRow}>
                <MaterialIcons name="account-balance" size={20} color={colors.success} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.bankText, { color: colors.text, fontWeight: '600' }]}>
                    {bankAccount.bankName}
                  </Text>
                  <Text style={styles.bankText}>
                    {bankAccount.accountHolderName} • {maskedAccountNumber(bankAccount.accountNumber)}
                  </Text>
                  <Text style={styles.bankText}>IFSC: {bankAccount.ifscCode}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.addBankBtn}
                onPress={handleDeleteBank}
                disabled={deletingBank}
              >
                <MaterialIcons name="delete-outline" size={18} color={colors.error} />
                <Text style={[styles.addBankText, { color: colors.error }]}>
                  {deletingBank ? 'Removing...' : 'Remove Bank Account'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : !showAddForm ? (
            <View>
              <View style={styles.bankRow}>
                <MaterialIcons name="account-balance" size={20} color={colors.textTertiary} />
                <Text style={styles.bankText}>No bank account linked</Text>
              </View>
              <TouchableOpacity style={styles.addBankBtn} onPress={() => setShowAddForm(true)}>
                <MaterialIcons name="add-circle-outline" size={18} color={colors.primary} />
                <Text style={styles.addBankText}>Add Bank Account</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.bankForm}>
              <TextInput
                style={styles.bankInput}
                placeholder="Account Holder Name"
                placeholderTextColor={colors.textTertiary}
                value={formData.accountHolderName}
                onChangeText={(v) => setFormData((p) => ({ ...p, accountHolderName: v }))}
              />
              <TextInput
                style={styles.bankInput}
                placeholder="Bank Name"
                placeholderTextColor={colors.textTertiary}
                value={formData.bankName}
                onChangeText={(v) => setFormData((p) => ({ ...p, bankName: v }))}
              />
              <TextInput
                style={styles.bankInput}
                placeholder="Account Number"
                placeholderTextColor={colors.textTertiary}
                keyboardType="number-pad"
                value={formData.accountNumber}
                onChangeText={(v) => setFormData((p) => ({ ...p, accountNumber: v }))}
              />
              <TextInput
                style={styles.bankInput}
                placeholder="IFSC Code"
                placeholderTextColor={colors.textTertiary}
                autoCapitalize="characters"
                value={formData.ifscCode}
                onChangeText={(v) => setFormData((p) => ({ ...p, ifscCode: v }))}
              />
              <View style={styles.bankFormActions}>
                <TouchableOpacity
                  style={styles.bankFormCancelBtn}
                  onPress={() => {
                    setShowAddForm(false);
                    setFormData({ accountHolderName: '', bankName: '', accountNumber: '', ifscCode: '' });
                  }}
                >
                  <Text style={styles.bankFormCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.bankFormSubmitBtn}
                  onPress={handleAddBank}
                  disabled={addingBank}
                >
                  {addingBank ? (
                    <ActivityIndicator size="small" color={colors.white} />
                  ) : (
                    <Text style={styles.bankFormSubmitText}>Add Account</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
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
