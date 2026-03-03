import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@apollo/client';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../theme';
import { GET_POLICIES } from '../../graphql/queries';
import { Policy, FaqScreenProps, FAQ_ITEMS, TABS } from './Faq.types';
import styles from './Faq.styles';

const FaqScreen: React.FC<FaqScreenProps> = ({ onBack, initialTab = 'faq' }) => {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'faq' | 'user' | 'venue' | 'host'>(initialTab);

  const { data: userPolicyData, loading: loadingUser, error: errorUser } = useQuery<{ policies: Policy[] }>(
    GET_POLICIES, { variables: { type: 'USER' }, fetchPolicy: 'cache-and-network' },
  );
  const { data: venuePolicyData, loading: loadingVenue, error: errorVenue } = useQuery<{ policies: Policy[] }>(
    GET_POLICIES, { variables: { type: 'VENUE' }, fetchPolicy: 'cache-and-network' },
  );
  const { data: hostPolicyData, loading: loadingHost, error: errorHost } = useQuery<{ policies: Policy[] }>(
    GET_POLICIES, { variables: { type: 'HOST' }, fetchPolicy: 'cache-and-network' },
  );

  const renderPolicyList = (policies: Policy[] | undefined, isLoading: boolean, error?: Error) => {
    if (isLoading) {
      return (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }
    if (error) {
      return (
        <View style={styles.emptyWrap}>
          <MaterialIcons name="cloud-off" size={40} color={colors.error} />
          <Text style={styles.emptyText}>Failed to load policies</Text>
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
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Policies</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <MaterialIcons name={tab.icon} size={14} color={activeTab === tab.key ? colors.white : colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {activeTab === 'faq' && FAQ_ITEMS.map((item, idx) => (
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

        {activeTab === 'user' && renderPolicyList(userPolicyData?.policies, loadingUser, errorUser)}
        {activeTab === 'venue' && renderPolicyList(venuePolicyData?.policies, loadingVenue, errorVenue)}
        {activeTab === 'host' && renderPolicyList(hostPolicyData?.policies, loadingHost, errorHost)}
      </ScrollView>
    </SafeAreaView>
  );
};

export default FaqScreen;
