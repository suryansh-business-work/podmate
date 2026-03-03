import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@apollo/client';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../theme';
import { GET_MY_PAYMENTS } from '../../graphql/queries';
import { PaymentItem, PaymentsScreenProps } from './Payments.types';
import styles from './Payments.styles';

interface PaymentsResponse {
  myPayments: {
    items: PaymentItem[];
    total: number;
    page: number;
    totalPages: number;
  };
}

const TYPE_CONFIG: Record<string, { icon: string; label: string; color: string; bgColor: string }> = {
  PAYMENT: { icon: 'arrow-upward', label: 'Payment', color: colors.primary, bgColor: colors.primary + '15' },
  REFUND: { icon: 'arrow-downward', label: 'Refund', color: colors.success, bgColor: colors.success + '15' },
  PARTIAL_REFUND: { icon: 'swap-vert', label: 'Partial Refund', color: colors.warning, bgColor: colors.warning + '15' },
};

const STATUS_CONFIG: Record<string, { bg: string; color: string }> = {
  COMPLETED: { bg: colors.success + '20', color: colors.success },
  PENDING: { bg: colors.warning + '20', color: colors.warning },
  FAILED: { bg: colors.error + '20', color: colors.error },
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const PaymentsScreen: React.FC<PaymentsScreenProps> = ({ onBack }) => {
  const [page] = useState(1);

  const { data, loading, error, refetch } = useQuery<PaymentsResponse>(
    GET_MY_PAYMENTS,
    {
      variables: { page, limit: 50 },
      fetchPolicy: 'cache-and-network',
    },
  );

  const payments = data?.myPayments?.items ?? [];

  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const renderPaymentCard = ({ item }: { item: PaymentItem }) => {
    const typeConf = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.PAYMENT;
    const statusConf = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.PENDING;
    const isRefund = item.type === 'REFUND' || item.type === 'PARTIAL_REFUND';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTypeRow}>
            <View style={[styles.typeIcon, { backgroundColor: typeConf.bgColor }]}>
              <MaterialIcons name={typeConf.icon} size={18} color={typeConf.color} />
            </View>
            <View>
              <Text style={styles.cardType}>{typeConf.label}</Text>
              <Text style={styles.cardDate}>{formatDate(item.createdAt)}</Text>
            </View>
          </View>
          <Text style={[styles.cardAmount, { color: isRefund ? colors.success : colors.text }]}>
            {isRefund ? '+' : '-'}₹{item.amount.toLocaleString()}
          </Text>
        </View>

        <View style={styles.cardFooter}>
          <View style={[styles.statusBadge, { backgroundColor: statusConf.bg }]}>
            <Text style={[styles.statusText, { color: statusConf.color }]}>{item.status}</Text>
          </View>
          {item.transactionId ? (
            <Text style={styles.txnId}>TXN: {item.transactionId}</Text>
          ) : null}
        </View>

        {item.notes ? (
          <View style={styles.notesRow}>
            <Text style={styles.notesText}>{item.notes}</Text>
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment History</Text>
        <View style={styles.headerRight} />
      </View>

      {loading && payments.length === 0 && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      {error && payments.length === 0 && (
        <View style={styles.centered}>
          <MaterialIcons name="cloud-off" size={48} color={colors.error} />
          <Text style={styles.emptyTitle}>Failed to load</Text>
          <Text style={styles.emptySubtitle}>{error.message}</Text>
        </View>
      )}

      <FlatList
        data={payments}
        keyExtractor={(item) => item.id}
        renderItem={renderPaymentCard}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          !loading && !error ? (
            <View style={styles.centered}>
              <MaterialIcons name="receipt-long" size={48} color={colors.textTertiary} />
              <Text style={styles.emptyTitle}>No payments yet</Text>
              <Text style={styles.emptySubtitle}>
                Your payment history will appear here once you join a pod.
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

export default PaymentsScreen;
