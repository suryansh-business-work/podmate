import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation } from '@apollo/client';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { MaterialIcons } from '@expo/vector-icons';

import {
  GET_POLICIES,
  GET_MY_SUPPORT_TICKETS,
  GET_MY_CALLBACK_REQUESTS,
} from '../../graphql/queries';
import {
  CREATE_SUPPORT_TICKET,
  REPLY_SUPPORT_TICKET,
  REQUEST_CALLBACK,
} from '../../graphql/mutations';
import { Policy, FaqScreenProps, FAQ_ITEMS, TABS, TabKey } from './Faq.types';
import TicketCard from '../Support/TicketCard';
import { SupportTicket } from '../Support/Support.types';
import { createStyles } from './Faq.styles';
import { useThemedStyles, useAppColors } from '../../hooks/useThemedStyles';

interface CallbackRequest {
  id: string;
  reason: string;
  phone: string;
  preferredTime: string;
  status: string;
  adminNote: string;
  createdAt: string;
}

const callbackSchema = Yup.object().shape({
  reason: Yup.string()
    .min(5, 'Min 5 characters')
    .max(500, 'Max 500 characters')
    .required('Please describe your reason'),
  preferredTime: Yup.string().max(100).optional(),
});

const FaqScreen: React.FC<FaqScreenProps> = ({ onBack, initialTab = 'faq' }) => {
  const styles = useThemedStyles(createStyles);
  const colors = useAppColors();
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);
  const [showTicketForm, setShowTicketForm] = useState(false);

  /* ── Policy Queries ── */
  const {
    data: userPolicyData,
    loading: loadingUser,
    error: errorUser,
  } = useQuery<{ policies: Policy[] }>(GET_POLICIES, {
    variables: { type: 'USER' },
    fetchPolicy: 'cache-and-network',
  });
  const {
    data: venuePolicyData,
    loading: loadingVenue,
    error: errorVenue,
  } = useQuery<{ policies: Policy[] }>(GET_POLICIES, {
    variables: { type: 'VENUE' },
    fetchPolicy: 'cache-and-network',
  });
  const {
    data: hostPolicyData,
    loading: loadingHost,
    error: errorHost,
  } = useQuery<{ policies: Policy[] }>(GET_POLICIES, {
    variables: { type: 'HOST' },
    fetchPolicy: 'cache-and-network',
  });

  /* ── Support Tickets ── */
  const {
    data: ticketsData,
    loading: ticketsLoading,
    refetch: refetchTickets,
  } = useQuery<{ mySupportTickets: SupportTicket[] }>(GET_MY_SUPPORT_TICKETS, {
    fetchPolicy: 'cache-and-network',
  });
  const [createTicket, { loading: creating }] = useMutation(CREATE_SUPPORT_TICKET);
  const tickets = ticketsData?.mySupportTickets ?? [];

  /* ── Callback Requests ── */
  const {
    data: callbackData,
    loading: callbackLoading,
    refetch: refetchCallbacks,
  } = useQuery<{ myCallbackRequests: CallbackRequest[] }>(GET_MY_CALLBACK_REQUESTS, {
    fetchPolicy: 'cache-and-network',
  });
  const [requestCallback, { loading: callbackSubmitting }] = useMutation(REQUEST_CALLBACK);
  const callbackRequests = callbackData?.myCallbackRequests ?? [];

  const handleCreateTicket = async (values: { subject: string; message: string }) => {
    try {
      await createTicket({ variables: { input: values } });
      await refetchTickets();
      setShowTicketForm(false);
      Alert.alert('Submitted', 'Your support ticket has been created.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit';
      Alert.alert('Error', msg);
    }
  };

  const handleRequestCallback = async (values: { reason: string; preferredTime: string }) => {
    try {
      await requestCallback({
        variables: {
          input: { reason: values.reason, preferredTime: values.preferredTime || undefined },
        },
      });
      await refetchCallbacks();
      Alert.alert('Callback Requested', 'Our team will call you back soon.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to request callback';
      Alert.alert('Error', msg);
    }
  };

  const renderPolicyList = (policies: Policy[] | undefined, isLoading: boolean, error?: Error) => {
    if (isLoading)
      return (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    if (error)
      return (
        <View style={styles.emptyWrap}>
          <MaterialIcons name="cloud-off" size={40} color={colors.error} />
          <Text style={styles.emptyText}>Failed to load policies</Text>
        </View>
      );
    if (!policies || policies.length === 0)
      return (
        <View style={styles.emptyWrap}>
          <MaterialIcons name="info-outline" size={40} color={colors.textTertiary} />
          <Text style={styles.emptyText}>No policies available yet.</Text>
        </View>
      );
    return policies.map((p) => (
      <View key={p.id} style={styles.policyCard}>
        <Text style={styles.policyTitle}>{p.title}</Text>
        <Text style={styles.policyContent}>{p.content}</Text>
      </View>
    ));
  };

  const renderSupportSection = () => (
    <>
      <View style={styles.supportHeader}>
        <Text style={styles.supportTitle}>Support Tickets</Text>
        <TouchableOpacity
          style={styles.newTicketBtn}
          onPress={() => setShowTicketForm(!showTicketForm)}
        >
          <MaterialIcons name={showTicketForm ? 'close' : 'add'} size={16} color={colors.white} />
          <Text style={styles.newTicketBtnText}>{showTicketForm ? 'Cancel' : 'New Ticket'}</Text>
        </TouchableOpacity>
      </View>

      {showTicketForm && (
        <View style={styles.callbackCard}>
          <Text style={[styles.callbackTitle, { fontSize: 16 }]}>New Support Ticket</Text>
          <Formik
            initialValues={{ subject: '', message: '' }}
            validationSchema={Yup.object().shape({
              subject: Yup.string()
                .min(3, 'Min 3 characters')
                .max(200)
                .required('Subject is required'),
              message: Yup.string()
                .min(10, 'Min 10 characters')
                .max(5000)
                .required('Message is required'),
            })}
            onSubmit={handleCreateTicket}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
              isValid,
              dirty,
            }) => (
              <>
                <Text style={styles.inputLabel}>Subject</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Brief description"
                  placeholderTextColor={colors.textTertiary}
                  value={values.subject}
                  onChangeText={handleChange('subject')}
                  onBlur={handleBlur('subject')}
                  maxLength={200}
                />
                {touched.subject && errors.subject ? (
                  <Text style={styles.errorText}>{errors.subject}</Text>
                ) : null}
                <Text style={styles.inputLabel}>Message</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="Describe your issue..."
                  placeholderTextColor={colors.textTertiary}
                  value={values.message}
                  onChangeText={handleChange('message')}
                  onBlur={handleBlur('message')}
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                  maxLength={5000}
                />
                {touched.message && errors.message ? (
                  <Text style={styles.errorText}>{errors.message}</Text>
                ) : null}
                <TouchableOpacity
                  style={[
                    styles.callbackBtn,
                    (!isValid || !dirty || creating) && styles.callbackBtnDisabled,
                  ]}
                  onPress={() => handleSubmit()}
                  disabled={!isValid || !dirty || creating}
                >
                  {creating ? (
                    <ActivityIndicator color={colors.white} size="small" />
                  ) : (
                    <Text style={styles.callbackBtnText}>Submit Ticket</Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </Formik>
        </View>
      )}

      {ticketsLoading && tickets.length === 0 && (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
      {!ticketsLoading && tickets.length === 0 && !showTicketForm && (
        <View style={styles.emptyWrap}>
          <MaterialIcons name="support-agent" size={48} color={colors.textTertiary} />
          <Text style={styles.emptyText}>No tickets yet</Text>
        </View>
      )}
      {tickets.map((ticket) => (
        <TicketCard key={ticket.id} ticket={ticket} />
      ))}
    </>
  );

  const CALLBACK_STATUS_COLORS: Record<string, string> = {
    PENDING: colors.warning,
    SCHEDULED: colors.accent,
    COMPLETED: colors.success,
    CANCELLED: colors.textTertiary,
  };

  const renderCallbackSection = () => (
    <>
      <View style={styles.callbackCard}>
        <MaterialIcons name="phone-callback" size={32} color={colors.primary} />
        <Text style={[styles.callbackTitle, { marginTop: 8 }]}>Request a Callback</Text>
        <Text style={styles.callbackSubtitle}>
          Our support team will call you back at your registered phone number. Please describe your
          issue below.
        </Text>
        <Formik
          initialValues={{ reason: '', preferredTime: '' }}
          validationSchema={callbackSchema}
          onSubmit={(values, { resetForm }) => {
            handleRequestCallback(values).then(() => resetForm());
          }}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
            isValid,
            dirty,
          }) => (
            <>
              <Text style={styles.inputLabel}>Reason *</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Describe why you need a callback..."
                placeholderTextColor={colors.textTertiary}
                value={values.reason}
                onChangeText={handleChange('reason')}
                onBlur={handleBlur('reason')}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                maxLength={500}
              />
              {touched.reason && errors.reason ? (
                <Text style={styles.errorText}>{errors.reason}</Text>
              ) : null}
              <Text style={styles.inputLabel}>Preferred Time (optional)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. 10 AM - 12 PM"
                placeholderTextColor={colors.textTertiary}
                value={values.preferredTime}
                onChangeText={handleChange('preferredTime')}
                onBlur={handleBlur('preferredTime')}
                maxLength={100}
              />
              <TouchableOpacity
                style={[
                  styles.callbackBtn,
                  (!isValid || !dirty || callbackSubmitting) && styles.callbackBtnDisabled,
                ]}
                onPress={() => handleSubmit()}
                disabled={!isValid || !dirty || callbackSubmitting}
              >
                {callbackSubmitting ? (
                  <ActivityIndicator color={colors.white} size="small" />
                ) : (
                  <>
                    <MaterialIcons name="phone" size={18} color={colors.white} />
                    <Text style={styles.callbackBtnText}>Request Callback</Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          )}
        </Formik>
      </View>

      {callbackLoading && callbackRequests.length === 0 && (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      {callbackRequests.length > 0 && (
        <>
          <Text style={[styles.supportTitle, { marginBottom: 12 }]}>Previous Requests</Text>
          {callbackRequests.map((req) => (
            <View key={req.id} style={styles.callbackRequestCard}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 8,
                }}
              >
                <View
                  style={[
                    styles.callbackStatusBadge,
                    {
                      backgroundColor:
                        (CALLBACK_STATUS_COLORS[req.status] ?? colors.textTertiary) + '20',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.callbackStatusText,
                      { color: CALLBACK_STATUS_COLORS[req.status] ?? colors.textTertiary },
                    ]}
                  >
                    {req.status}
                  </Text>
                </View>
                <Text style={{ fontSize: 12, color: colors.textTertiary }}>
                  {new Date(req.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <Text style={{ fontSize: 14, color: colors.text, lineHeight: 20 }}>{req.reason}</Text>
              {req.preferredTime ? (
                <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>
                  Preferred: {req.preferredTime}
                </Text>
              ) : null}
              {req.adminNote ? (
                <View
                  style={{
                    marginTop: 8,
                    padding: 8,
                    backgroundColor: colors.primary + '10',
                    borderRadius: 8,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '600',
                      color: colors.primary,
                      marginBottom: 2,
                    }}
                  >
                    Admin Note
                  </Text>
                  <Text style={{ fontSize: 13, color: colors.text }}>{req.adminNote}</Text>
                </View>
              ) : null}
            </View>
          ))}
        </>
      )}
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.bodyRow}>
        {/* Vertical Sidebar Tabs */}
        <ScrollView style={styles.sidebar} showsVerticalScrollIndicator={false}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.sidebarTab, activeTab === tab.key && styles.sidebarTabActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <MaterialIcons
                name={tab.icon}
                size={20}
                color={activeTab === tab.key ? colors.primary : colors.textTertiary}
              />
              <Text
                style={[
                  styles.sidebarTabLabel,
                  activeTab === tab.key && styles.sidebarTabLabelActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Content Area */}
        <ScrollView
          style={styles.contentArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            activeTab === 'support' ? (
              <RefreshControl refreshing={ticketsLoading} onRefresh={() => refetchTickets()} />
            ) : activeTab === 'callback' ? (
              <RefreshControl refreshing={callbackLoading} onRefresh={() => refetchCallbacks()} />
            ) : undefined
          }
        >
          {activeTab === 'faq' &&
            FAQ_ITEMS.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.faqItem}
                onPress={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
                activeOpacity={0.7}
              >
                <View style={styles.faqHeader}>
                  <Text style={styles.faqQuestion}>{item.q}</Text>
                  <MaterialIcons
                    name={expandedIdx === idx ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                    size={22}
                    color={colors.textSecondary}
                  />
                </View>
                {expandedIdx === idx && <Text style={styles.faqAnswer}>{item.a}</Text>}
              </TouchableOpacity>
            ))}

          {activeTab === 'user' &&
            renderPolicyList(userPolicyData?.policies, loadingUser, errorUser)}
          {activeTab === 'venue' &&
            renderPolicyList(venuePolicyData?.policies, loadingVenue, errorVenue)}
          {activeTab === 'host' &&
            renderPolicyList(hostPolicyData?.policies, loadingHost, errorHost)}
          {activeTab === 'support' && renderSupportSection()}
          {activeTab === 'callback' && renderCallbackSection()}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default FaqScreen;
