import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation } from '@apollo/client';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { colors, spacing, borderRadius } from '../theme';
import { GET_MY_SUPPORT_TICKETS } from '../graphql/queries';
import { CREATE_SUPPORT_TICKET } from '../graphql/mutations';

interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  adminReply: string;
  createdAt: string;
  updatedAt: string;
}

interface SupportScreenProps {
  onBack: () => void;
}

const ticketSchema = Yup.object().shape({
  subject: Yup.string().min(3, 'Min 3 characters').max(200).required('Subject is required'),
  message: Yup.string().min(10, 'Min 10 characters').max(5000).required('Message is required'),
});

const STATUS_COLORS: Record<string, string> = {
  OPEN: colors.warning,
  IN_PROGRESS: colors.accent,
  RESOLVED: colors.success,
  CLOSED: colors.textTertiary,
};

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
      {/* Header */}
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
        {/* Create ticket form */}
        {showForm && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>New Support Ticket</Text>
            <Formik
              initialValues={{ subject: '', message: '' }}
              validationSchema={ticketSchema}
              onSubmit={handleCreate}
            >
              {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isValid, dirty }) => (
                <>
                  <Text style={styles.label}>Subject</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Brief description of your issue"
                    placeholderTextColor={colors.textTertiary}
                    value={values.subject}
                    onChangeText={handleChange('subject')}
                    onBlur={handleBlur('subject')}
                    maxLength={200}
                  />
                  {touched.subject && errors.subject && (
                    <Text style={styles.errorText}>{errors.subject}</Text>
                  )}

                  <Text style={styles.label}>Message</Text>
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    placeholder="Describe your issue in detail..."
                    placeholderTextColor={colors.textTertiary}
                    value={values.message}
                    onChangeText={handleChange('message')}
                    onBlur={handleBlur('message')}
                    multiline
                    numberOfLines={5}
                    textAlignVertical="top"
                    maxLength={5000}
                  />
                  {touched.message && errors.message && (
                    <Text style={styles.errorText}>{errors.message}</Text>
                  )}

                  <TouchableOpacity
                    style={[styles.submitBtn, (!isValid || !dirty || creating) && styles.submitBtnDisabled]}
                    onPress={() => handleSubmit()}
                    disabled={!isValid || !dirty || creating}
                  >
                    {creating ? (
                      <ActivityIndicator color={colors.white} size="small" />
                    ) : (
                      <Text style={styles.submitText}>Submit Ticket</Text>
                    )}
                  </TouchableOpacity>
                </>
              )}
            </Formik>
          </View>
        )}

        {/* Tickets list */}
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
          <View key={ticket.id} style={styles.ticketCard}>
            <View style={styles.ticketHeader}>
              <View style={styles.ticketTitleRow}>
                <Text style={styles.ticketSubject} numberOfLines={1}>{ticket.subject}</Text>
                <View style={[styles.statusBadge, { backgroundColor: (STATUS_COLORS[ticket.status] ?? colors.textTertiary) + '20' }]}>
                  <Text style={[styles.statusText, { color: STATUS_COLORS[ticket.status] ?? colors.textTertiary }]}>
                    {ticket.status.replace('_', ' ')}
                  </Text>
                </View>
              </View>
              <Text style={styles.ticketDate}>
                {new Date(ticket.createdAt).toLocaleDateString()}
              </Text>
            </View>
            <Text style={styles.ticketMessage} numberOfLines={3}>{ticket.message}</Text>
            {ticket.adminReply ? (
              <View style={styles.replyBox}>
                <MaterialIcons name="support-agent" size={14} color={colors.primary} />
                <Text style={styles.replyText}>{ticket.adminReply}</Text>
              </View>
            ) : null}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceVariant,
  },
  backBtn: { padding: spacing.xs },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  addBtn: { padding: spacing.xs },
  scrollContent: { padding: spacing.xl, paddingBottom: 100 },
  centeredWrap: { paddingVertical: spacing.xxxl, alignItems: 'center', gap: spacing.sm },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: colors.text },
  emptySubtitle: { fontSize: 14, color: colors.textSecondary, textAlign: 'center' },

  /* Form */
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.surfaceVariant,
  },
  formTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: spacing.lg },
  label: { fontSize: 12, fontWeight: '600', color: colors.text, letterSpacing: 0.5, marginBottom: spacing.xs, marginTop: spacing.md },
  textInput: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 15,
    color: colors.text,
  },
  textArea: { minHeight: 100 },
  errorText: { fontSize: 12, color: colors.error, marginTop: spacing.xs },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitText: { fontSize: 16, fontWeight: '600', color: colors.white },

  /* Ticket card */
  ticketCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceVariant,
  },
  ticketHeader: { marginBottom: spacing.sm },
  ticketTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ticketSubject: { fontSize: 15, fontWeight: '600', color: colors.text, flex: 1, marginRight: spacing.sm },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  statusText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  ticketDate: { fontSize: 12, color: colors.textTertiary, marginTop: 2 },
  ticketMessage: { fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
  replyBox: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.primary + '08',
    borderRadius: borderRadius.sm,
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  replyText: { fontSize: 14, color: colors.text, flex: 1, lineHeight: 20 },
});

export default SupportScreen;
