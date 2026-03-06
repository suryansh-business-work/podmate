import React from 'react';
import { View, Text, Modal, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useQuery } from '@apollo/client';
import { MaterialIcons } from '@expo/vector-icons';

import { GET_POLICIES } from '../../graphql/queries';
import { Policy } from './Login.types';
import { createStyles } from './Login.styles';
import { useThemedStyles, useAppColors } from '../../hooks/useThemedStyles';

interface PolicyModalProps {
  policyType: 'USER' | 'VENUE' | 'HOST' | null;
  onClose: () => void;
}

const MODAL_TITLES: Record<string, string> = {
  USER: 'Terms of Service',
  VENUE: 'Venue Policy',
  HOST: 'Host Policy',
};

const PolicyModal: React.FC<PolicyModalProps> = ({ policyType, onClose }) => {
  const styles = useThemedStyles(createStyles);
  const colors = useAppColors();
  const { data, loading } = useQuery<{ policies: Policy[] }>(GET_POLICIES, {
    variables: { type: policyType },
    skip: !policyType,
    fetchPolicy: 'cache-and-network',
  });

  return (
    <Modal visible={!!policyType} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{policyType ? MODAL_TITLES[policyType] : ''}</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
              <MaterialIcons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent}>
            {loading ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.modalLoadingText}>Loading policy…</Text>
              </View>
            ) : data?.policies && data.policies.length > 0 ? (
              data.policies.map((p) => (
                <View key={p.id} style={styles.policyCard}>
                  <Text style={styles.policyCardTitle}>{p.title}</Text>
                  <Text style={styles.policyCardContent}>{p.content}</Text>
                </View>
              ))
            ) : (
              <View style={styles.modalLoading}>
                <MaterialIcons name="info-outline" size={40} color={colors.textTertiary} />
                <Text style={styles.modalLoadingText}>No policy content available yet.</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default PolicyModal;
