import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation } from '@apollo/client';
import { MaterialIcons } from '@expo/vector-icons';

import { GET_POD } from '../../graphql/queries';
import { CHECKOUT_POD, CHECKOUT_OCCURRENCE_POD } from '../../graphql/mutations';
import {
  CheckoutScreenProps,
  CheckoutPodData,
  CheckoutResultData,
  CheckoutOccurrenceResultData,
} from './Checkout.types';
import { createStyles } from './Checkout.styles';
import { useThemedStyles, useAppColors } from '../../hooks/useThemedStyles';
import { useEffectiveFee } from '../../hooks/useEffectiveFee';
import OrderSummary from './OrderSummary';

const CheckoutScreen: React.FC<CheckoutScreenProps> = ({ podId, onBack, onSuccess }) => {
  const styles = useThemedStyles(createStyles);
  const colors = useAppColors();
  const [checkoutDone, setCheckoutDone] = useState(false);

  const { data, loading: podLoading } = useQuery<{ pod: CheckoutPodData }>(GET_POD, {
    variables: { id: podId },
    skip: !podId,
  });

  const [checkoutPod, { loading: checking }] = useMutation<CheckoutResultData>(CHECKOUT_POD);
  const [checkoutOccurrence, { loading: checkingOccurrence }] =
    useMutation<CheckoutOccurrenceResultData>(CHECKOUT_OCCURRENCE_POD);

  const pod = data?.pod;
  const isOccurrence = pod?.podType === 'OCCURRENCE';

  const { feePercent: podFeePercent, source: podFeeSource } = useEffectiveFee({
    entityType: 'POD',
    entityId: podId,
    skip: !podId,
  });

  const platformFeeAmount = pod ? Math.round(pod.feePerPerson * (podFeePercent / 100)) : 0;
  const totalAmount = pod ? pod.feePerPerson + platformFeeAmount : 0;
  const totalSubscriptionCost = pod && isOccurrence
    ? totalAmount * (pod.occurrenceCount || 1)
    : totalAmount;

  const billingLabel = pod?.recurrence
    ? ({ DAILY: 'day', WEEKLY: 'week', MONTHLY: 'month' }[pod.recurrence] ?? pod.recurrence) : '';

  const processingPayment = checking || checkingOccurrence;

  const handleCheckout = async () => {
    try {
      if (isOccurrence) {
        const result = await checkoutOccurrence({ variables: { podId } });
        if (result.data?.checkoutOccurrencePod.success) {
          setCheckoutDone(true);
        }
      } else {
        const result = await checkoutPod({ variables: { podId } });
        if (result.data?.checkoutPod.success) {
          setCheckoutDone(true);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Checkout failed';
      Alert.alert('Payment Failed', msg);
    }
  };

  if (checkoutDone) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successContainer}>
          <MaterialIcons name="check-circle" size={80} color={colors.success} />
          <Text style={styles.successTitle}>You&apos;re In!</Text>
          <Text style={styles.successSubtitle}>
            {isOccurrence
              ? `Subscription started! You'll be billed ₹${totalAmount.toLocaleString()} per ${billingLabel} for ${pod?.occurrenceCount || 1} cycles.`
              : 'Payment successful. You have joined the pod.'}
          </Text>
          <TouchableOpacity style={styles.successBtn} onPress={onSuccess}>
            <Text style={styles.successBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (podLoading || !pod) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack}>
            <MaterialIcons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Checkout</Text>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const date = new Date(pod.dateTime);
  const dateOpts: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };
  const timeOpts: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
  const formattedDate = date.toLocaleDateString('en-IN', dateOpts);
  const formattedTime = date.toLocaleTimeString('en-IN', timeOpts);
  const spotsLeft = pod.maxSeats - pod.currentSeats;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.podCard}>
          {pod.imageUrl ? (
            <Image source={{ uri: pod.imageUrl }} style={styles.podImage} />
          ) : (
            <View style={styles.podImagePlaceholder}>
              <MaterialIcons name="celebration" size={36} color={colors.textTertiary} />
            </View>
          )}
          <View style={styles.podInfo}>
            <Text style={styles.podTitle} numberOfLines={2}>{pod.title}</Text>
            <Text style={styles.podMeta}>{pod.category} · {formattedDate}</Text>
            <Text style={styles.podMeta}>{pod.location}</Text>
          </View>
        </View>

        <View style={styles.dummyBadge}>
          <MaterialIcons name="info" size={20} color="#856404" />
          <Text style={styles.dummyText}>
            This is a simulated checkout. No real charges will be made.
          </Text>
        </View>

        <OrderSummary
          pod={pod}
          podFeePercent={podFeePercent}
          podFeeSource={podFeeSource}
          platformFeeAmount={platformFeeAmount}
          totalAmount={totalAmount}
          totalSubscriptionCost={totalSubscriptionCost}
          billingLabel={billingLabel}
          isOccurrence={isOccurrence}
          formattedDate={formattedDate}
          formattedTime={formattedTime}
          spotsLeft={spotsLeft}
        />
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.payBtn, processingPayment && styles.payBtnDisabled]}
          onPress={handleCheckout}
          disabled={processingPayment}
          activeOpacity={0.8}
        >
          {processingPayment ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <>
              <MaterialIcons name="lock" size={18} color={colors.white} />
              <Text style={styles.payBtnText}>
                {isOccurrence
                  ? `Subscribe ₹${totalAmount.toLocaleString()}/${billingLabel}`
                  : `Pay ₹${totalAmount.toLocaleString()}`}
              </Text>
            </>
          )}
        </TouchableOpacity>
        <View style={{ height: 16 }} />
      </View>
    </SafeAreaView>
  );
};

export default CheckoutScreen;
