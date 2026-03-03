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
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../theme';
import { GET_POD } from '../../graphql/queries';
import { CHECKOUT_POD } from '../../graphql/mutations';
import { CheckoutScreenProps, CheckoutPodData, CheckoutResultData } from './Checkout.types';
import { styles } from './Checkout.styles';

const CheckoutScreen: React.FC<CheckoutScreenProps> = ({ podId, onBack, onSuccess }) => {
  const [checkoutDone, setCheckoutDone] = useState(false);

  const { data, loading: podLoading } = useQuery<{ pod: CheckoutPodData }>(GET_POD, {
    variables: { id: podId },
    skip: !podId,
  });

  const [checkoutPod, { loading: checking }] = useMutation<CheckoutResultData>(CHECKOUT_POD);

  const pod = data?.pod;

  const handleCheckout = async () => {
    try {
      const result = await checkoutPod({ variables: { podId } });
      if (result.data?.checkoutPod.success) {
        setCheckoutDone(true);
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
            Payment successful. You have joined the pod. Check your chat to connect with other members.
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
  const formattedDate = date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const formattedTime = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  const spotsLeft = pod.maxSeats - pod.currentSeats;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Pod Info */}
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

        {/* Dummy badge */}
        <View style={styles.dummyBadge}>
          <MaterialIcons name="info" size={20} color="#856404" />
          <Text style={styles.dummyText}>
            This is a simulated checkout. No real charges will be made.
          </Text>
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Pod Fee (1 person)</Text>
            <Text style={styles.rowValue}>₹{pod.feePerPerson.toLocaleString()}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Platform Fee</Text>
            <Text style={styles.rowValue}>₹0</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₹{pod.feePerPerson.toLocaleString()}</Text>
          </View>
        </View>

        {/* Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Event Details</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Date & Time</Text>
            <Text style={styles.rowValue}>{formattedDate}, {formattedTime}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Host</Text>
            <Text style={styles.rowValue}>{pod.host.name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Spots Left</Text>
            <Text style={styles.rowValue}>{spotsLeft} / {pod.maxSeats}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.payBtn, checking && styles.payBtnDisabled]}
          onPress={handleCheckout}
          disabled={checking}
          activeOpacity={0.8}
        >
          {checking ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <>
              <MaterialIcons name="lock" size={18} color={colors.white} />
              <Text style={styles.payBtnText}>Pay ₹{pod.feePerPerson.toLocaleString()}</Text>
            </>
          )}
        </TouchableOpacity>
        <View style={{ height: 16 }} />
      </View>
    </SafeAreaView>
  );
};

export default CheckoutScreen;
