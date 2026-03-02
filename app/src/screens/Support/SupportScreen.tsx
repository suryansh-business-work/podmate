import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation } from '@apollo/client';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../theme';
import { GET_MY_SUPPORT_TICKETS } from '../../graphql/queries';
import { CREATE_SUPPORT_TICKET } from '../../graphql/mutations';
import { SupportTicket, SupportScreenProps } from './Support.types';
import TicketForm from './TicketForm';
import TicketCard from './TicketCard';
import styles from './Support.styles';

const SupportScreen: React.FC<SupportScreenProps> = ({ onBack }) => {
  const [showForm, setShowForm] = useState(false);

  const { data, loading, refetch } = useQuery<{ mySupportTickets: SupportTicket[] }>(
    GET_MY_SUPPORT_TICKETS,
    { fetchPolicy: 'cache-and-network' },
  );

  const [createTicket, { loading: creating }] = useMutation(CREATE_SUPPORT_TICKET);

  const tickets = data?.mySupportTickets ?? [];

  const handleCreate = async (values: { subject: string; message: string }) => {
    try {
      await createTicket({ variables: { input: values } });
      await refetch();
      setShowForm(false);
      Alert.alert('Submitted', 'Your support ticket has been created. We will respond shortly.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit';
      Alert.alert('Error', msg);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Support</Text>
        <TouchableOpacity onPress={() => setShowForm(!showForm)} style={styles.addBtn}>
          <MaterialIcons name={showForm ? 'close' : 'add'} size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => refetch()} />}
      >
        {showForm && <TicketForm creating={creating} onSubmit={handleCreate} />}

        {loading && tickets.length === 0 && (
          <View style={styles.centeredWrap}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}

        {!loading && tickets.length === 0 && !showForm && (
          <View style={styles.centeredWrap}>
            <MaterialIcons name="support-agent" size={48} color={colors.textTertiary} />
            <Text style={styles.emptyTitle}>No tickets yet</Text>
            <Text style={styles.emptySubtitle}>
              Tap + to create a support ticket and our team will get back to you.
            </Text>
          </View>
        )}

        {tickets.map((ticket) => (
          <TicketCard key={ticket.id} ticket={ticket} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default SupportScreen;
