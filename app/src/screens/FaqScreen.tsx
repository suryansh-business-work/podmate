import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@apollo/client';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors, spacing, borderRadius } from '../theme';
import { GET_POLICIES } from '../graphql/queries';

interface Policy {
  id: string;
  type: string;
  title: string;
  content: string;
  isActive: boolean;
  createdAt: string;
}

interface FaqScreenProps {
  onBack: () => void;
  initialTab?: 'faq' | 'user' | 'venue' | 'host';
}

const FAQ_ITEMS = [
  { q: 'What is a Pod?', a: 'A Pod is a group experience hosted by a verified host at a chosen venue. You can join Pods to attend events, meetups, or activities near you.' },
  { q: 'How do I join a Pod?', a: 'Browse available Pods on the Explore tab. Tap on a Pod to see its details, then tap "Join" to reserve your spot.' },
  { q: 'Can I cancel my booking?', a: 'Yes. Check the Pod\'s refund policy for specifics. Most Pods offer a 24-hour refund window.' },
  { q: 'How do I become a Host?', a: 'Go to your Profile and apply for Host verification. Once approved, you can create Pods and invite guests.' },
  { q: 'Is my payment secure?', a: 'All payments are processed through secure payment gateways. We never store your card details.' },
  { q: 'How do I contact support?', a: 'Visit the Help & Support section in your profile or use the Support page to submit a query.' },
];

const FaqScreen: React.FC<FaqScreenProps> = ({ onBack, initialTab = 'faq' }) => {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'faq' | 'user' | 'venue' | 'host'>(initialTab);

  const { data: userPolicyData, loading: loadingUser } = useQuery<{ policies: Policy[] }>(
    GET_POLICIES,
    { variables: { type: 'USER' }, fetchPolicy: 'cache-and-network' },
  );
  const { data: venuePolicyData, loading: loadingVenue } = useQuery<{ policies: Policy[] }>(
    GET_POLICIES,
    { variables: { type: 'VENUE' }, fetchPolicy: 'cache-and-network' },
  );
  const { data: hostPolicyData, loading: loadingHost } = useQuery<{ policies: Policy[] }>(
    GET_POLICIES,
    { variables: { type: 'HOST' }, fetchPolicy: 'cache-and-network' },
  );

  const tabs: { key: typeof activeTab; label: string; icon: string }[] = [
    { key: 'faq', label: 'FAQs', icon: 'help-outline' },
    { key: 'user', label: 'User Policy', icon: 'person' },
    { key: 'venue', label: 'Venue Policy', icon: 'place' },
    { key: 'host', label: 'Host Policy', icon: 'verified-user' },
  ];

  const renderPolicyList = (policies: Policy[] | undefined, isLoading: boolean) => {
    if (isLoading) {
      return (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }
    if (!policies || policies.length === 0) {
      return (
        <View style={styles.emptyWrap}>
          <MaterialIcons name="info-outline" size={40} color={colors.textTertiary} />
          <Text style={styles.emptyText}>No policies available yet.</Text>
        </View>
      );
    }
    return policies.map((p) => (
      <View key={p.id} style={styles.policyCard}>
        <Text style={styles.policyTitle}>{p.title}</Text>
        <Text style={styles.policyContent}>{p.content}</Text>
      </View>
    ));
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Policies</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <MaterialIcons
              name={tab.icon}
              size={16}
              color={activeTab === tab.key ? colors.white : colors.textSecondary}
            />
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {activeTab === 'faq' && (
          <>
            {FAQ_ITEMS.map((item, idx) => (
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
                {expandedIdx === idx && (
                  <Text style={styles.faqAnswer}>{item.a}</Text>
                )}
              </TouchableOpacity>
            ))}
          </>
        )}

        {activeTab === 'user' && renderPolicyList(userPolicyData?.policies, loadingUser)}
        {activeTab === 'venue' && renderPolicyList(venuePolicyData?.policies, loadingVenue)}
        {activeTab === 'host' && renderPolicyList(hostPolicyData?.policies, loadingHost)}
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
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceVariant,
  },
  tabActive: { backgroundColor: colors.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  tabTextActive: { color: colors.white },
  scrollContent: { paddingHorizontal: spacing.xl, paddingBottom: 100 },
  loadingWrap: { paddingVertical: spacing.xxxl, alignItems: 'center' },
  emptyWrap: { paddingVertical: spacing.xxxl, alignItems: 'center', gap: spacing.sm },
  emptyText: { fontSize: 14, color: colors.textSecondary },
  faqItem: {
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceVariant,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: { fontSize: 15, fontWeight: '600', color: colors.text, flex: 1, marginRight: spacing.sm },
  faqAnswer: { fontSize: 14, color: colors.textSecondary, marginTop: spacing.sm, lineHeight: 22 },
  policyCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceVariant,
  },
  policyTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  policyContent: { fontSize: 14, color: colors.textSecondary, lineHeight: 22 },
});

export default FaqScreen;
