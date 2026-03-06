import React, { useState, useCallback, ComponentProps } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation } from '@apollo/client';
import { MaterialIcons } from '@expo/vector-icons';

import { GET_MY_FEEDBACK } from '../../graphql/queries';
import { SUBMIT_FEEDBACK } from '../../graphql/mutations';
import type { FeedbackScreenProps, Feedback } from './Feedback.types';
import { createStyles } from './Feedback.styles';
import { useThemedStyles, useAppColors } from '../../hooks/useThemedStyles';

const TYPES = ['BUG', 'FEATURE', 'GENERAL'] as const;
type FeedbackType = (typeof TYPES)[number];

type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];

const TYPE_ICONS: Record<FeedbackType, MaterialIconName> = {
  BUG: 'bug-report',
  FEATURE: 'lightbulb',
  GENERAL: 'chat',
};

const StatusBadge: React.FC<{ status: Feedback['status'] }> = ({ status }) => {
  const styles = useThemedStyles(createStyles);
  const colors = useAppColors();
  const badgeStyle =
    status === 'PENDING'
      ? styles.badgePending
      : status === 'REVIEWED'
        ? styles.badgeReviewed
        : styles.badgeResolved;
  const textStyle =
    status === 'PENDING'
      ? styles.badgePendingText
      : status === 'REVIEWED'
        ? styles.badgeReviewedText
        : styles.badgeResolvedText;
  return (
    <View style={[styles.badge, badgeStyle]}>
      <Text style={[styles.badgeText, textStyle]}>{status}</Text>
    </View>
  );
};

const FeedbackScreen: React.FC<FeedbackScreenProps> = ({ onBack }) => {
  const styles = useThemedStyles(createStyles);
  const colors = useAppColors();
  const [showModal, setShowModal] = useState(false);
  const [type, setType] = useState<FeedbackType>('GENERAL');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const { data, loading, refetch } = useQuery<{
    myFeedback: { items: Feedback[]; total: number };
  }>(GET_MY_FEEDBACK, {
    variables: { page: 1, limit: 50 },
    fetchPolicy: 'cache-and-network',
  });

  const [submitFeedback, { loading: submitting }] = useMutation(SUBMIT_FEEDBACK);

  const feedbackList = data?.myFeedback?.items ?? [];

  const handleSubmit = useCallback(async () => {
    if (!title.trim() || !description.trim()) return;
    try {
      await submitFeedback({
        variables: { input: { type, title: title.trim(), description: description.trim() } },
      });
      setShowModal(false);
      setTitle('');
      setDescription('');
      refetch();
    } catch (err) {
      Alert.alert('Error', (err as Error).message);
    }
  }, [type, title, description, submitFeedback, refetch]);

  const renderItem = useCallback(
    ({ item }: { item: Feedback }) => (
      <View style={styles.feedbackCard}>
        <View style={styles.feedbackCardHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <MaterialIcons name={TYPE_ICONS[item.type]} size={16} color={colors.primary} />
            <Text style={styles.typeLabel}>{item.type}</Text>
          </View>
          <StatusBadge status={item.status} />
        </View>
        <Text style={styles.feedbackTitle}>{item.title}</Text>
        <Text style={styles.feedbackDesc} numberOfLines={3}>
          {item.description}
        </Text>
        {item.adminNotes ? (
          <>
            <Text style={styles.adminNotesLabel}>Admin Response</Text>
            <Text style={styles.adminNotesText}>{item.adminNotes}</Text>
          </>
        ) : null}
        <Text style={styles.feedbackDate}>
          {new Date(Number(item.createdAt)).toLocaleDateString()}
        </Text>
      </View>
    ),
    [],
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Feedback</Text>
      </View>

      {loading && feedbackList.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={feedbackList}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.content}
          ListEmptyComponent={
            <View style={styles.centered}>
              <MaterialIcons name="feedback" size={48} color={colors.textTertiary} />
              <Text style={styles.emptyText}>No feedback yet</Text>
              <Text style={styles.emptySubtext}>Share your thoughts to help us improve!</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => setShowModal(true)} activeOpacity={0.8}>
        <MaterialIcons name="add" size={28} color={colors.white} />
      </TouchableOpacity>

      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowModal(false)}
        >
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <TouchableOpacity activeOpacity={1} onPress={() => {}}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Submit Feedback</Text>

                {/* Type Chips */}
                <View style={styles.chipRow}>
                  {TYPES.map((t) => (
                    <TouchableOpacity
                      key={t}
                      style={[styles.chip, type === t && styles.chipActive]}
                      onPress={() => setType(t)}
                    >
                      <Text style={[styles.chipText, type === t && styles.chipTextActive]}>
                        {t}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TextInput
                  style={styles.input}
                  placeholder="Title"
                  placeholderTextColor={colors.textTertiary}
                  value={title}
                  onChangeText={setTitle}
                  maxLength={100}
                />
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Describe your feedback…"
                  placeholderTextColor={colors.textTertiary}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  maxLength={2000}
                />
                <TouchableOpacity
                  style={[
                    styles.submitBtn,
                    (submitting || !title.trim() || !description.trim()) &&
                      styles.submitBtnDisabled,
                  ]}
                  onPress={handleSubmit}
                  disabled={submitting || !title.trim() || !description.trim()}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color={colors.white} />
                  ) : (
                    <Text style={styles.submitBtnText}>Submit</Text>
                  )}
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

export default FeedbackScreen;
