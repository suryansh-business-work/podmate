import React, { useState, useCallback } from 'react';
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

import { GET_REVIEWS, GET_REVIEW_STATS } from '../../graphql/queries';
import { CREATE_REVIEW, REPLY_TO_REVIEW, REPORT_REVIEW } from '../../graphql/mutations';
import type { ReviewsScreenProps, Review, ReviewStats } from './Reviews.types';
import { ReviewCard, Stars } from './ReviewCard';
import { createStyles } from './Reviews.styles';
import { useThemedStyles, useAppColors } from '../../hooks/useThemedStyles';

const ReviewsScreen: React.FC<ReviewsScreenProps> = ({
  targetType,
  targetId,
  targetTitle,
  onBack,
}) => {
  const styles = useThemedStyles(createStyles);
  const colors = useAppColors();
  const [showModal, setShowModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const { data, loading, refetch } = useQuery<{ reviews: { items: Review[]; total: number } }>(
    GET_REVIEWS,
    {
      variables: { targetType, targetId, page: 1, limit: 50 },
      fetchPolicy: 'cache-and-network',
    },
  );

  const { data: statsData, refetch: refetchStats } = useQuery<{ reviewStats: ReviewStats }>(
    GET_REVIEW_STATS,
    {
      variables: { targetType, targetId },
    },
  );

  const [createReview, { loading: submitting }] = useMutation(CREATE_REVIEW);
  const [replyToReview, { loading: replying }] = useMutation(REPLY_TO_REVIEW);
  const [reportReview] = useMutation(REPORT_REVIEW);

  const reviews = data?.reviews?.items ?? [];
  const stats = statsData?.reviewStats;

  const handleSubmit = useCallback(async () => {
    if (rating === 0 || !comment.trim()) return;
    try {
      await createReview({
        variables: { input: { targetType, targetId, rating, comment: comment.trim() } },
      });
      setShowModal(false);
      setRating(0);
      setComment('');
      refetch();
      refetchStats();
    } catch (err) {
      Alert.alert('Error', (err as Error).message);
    }
  }, [rating, comment, targetType, targetId, createReview, refetch, refetchStats]);

  const handleReply = useCallback((reviewId: string) => {
    setReplyTo(reviewId);
    setReplyText('');
  }, []);

  const handleSubmitReply = useCallback(async () => {
    if (!replyTo || !replyText.trim()) return;
    try {
      await replyToReview({
        variables: { input: { reviewId: replyTo, comment: replyText.trim() } },
      });
      setReplyTo(null);
      setReplyText('');
      refetch();
    } catch (err) {
      Alert.alert('Error', (err as Error).message);
    }
  }, [replyTo, replyText, replyToReview, refetch]);

  const handleReport = useCallback(
    (reviewId: string) => {
      Alert.alert('Report Review', 'Are you sure you want to report this review?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Report',
          style: 'destructive',
          onPress: async () => {
            try {
              await reportReview({
                variables: { input: { reviewId, reason: 'Inappropriate content' } },
              });
              refetch();
            } catch (err) {
              Alert.alert('Error', (err as Error).message);
            }
          },
        },
      ]);
    },
    [reportReview, refetch],
  );

  const renderHeader = () => {
    if (!stats) return null;
    const max = Math.max(...stats.distribution, 1);
    return (
      <View style={styles.statsCard}>
        <View style={styles.statsRow}>
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.bigRating}>{stats.averageRating}</Text>
            <Stars rating={Math.round(stats.averageRating)} size={16} />
            <Text style={styles.totalText}>{stats.totalReviews} reviews</Text>
          </View>
          <View style={styles.distributionCol}>
            {[5, 4, 3, 2, 1].map((star) => (
              <View key={star} style={styles.distRow}>
                <Text style={styles.distLabel}>{star}</Text>
                <View style={styles.distBar}>
                  <View
                    style={[
                      styles.distFill,
                      { width: `${(stats.distribution[star - 1] / max) * 100}%` },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reviews — {targetTitle}</Text>
      </View>

      {loading && reviews.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          renderItem={({ item }) => (
            <ReviewCard review={item} onReply={handleReply} onReport={handleReport} />
          )}
          contentContainerStyle={styles.content}
          ListEmptyComponent={
            <View style={styles.centered}>
              <MaterialIcons name="rate-review" size={48} color={colors.textTertiary} />
              <Text style={styles.emptyText}>No reviews yet</Text>
              <Text style={styles.emptySubtext}>Be the first to leave a review!</Text>
            </View>
          }
        />
      )}

      {/* Reply inline input */}
      {replyTo && (
        <KeyboardAvoidingView
          behavior={
            Platform.OS === 'web' ? undefined : Platform.OS === 'ios' ? 'padding' : 'height'
          }
        >
          <View
            style={{
              flexDirection: 'row',
              padding: 12,
              borderTopWidth: 1,
              borderTopColor: colors.surfaceVariant,
              backgroundColor: colors.surface,
              gap: 8,
            }}
          >
            <TextInput
              style={{
                flex: 1,
                backgroundColor: colors.surfaceVariant,
                borderRadius: 20,
                paddingHorizontal: 16,
                fontSize: 14,
                color: colors.text,
              }}
              placeholder="Write a reply…"
              placeholderTextColor={colors.textTertiary}
              value={replyText}
              onChangeText={setReplyText}
              autoFocus
            />
            <TouchableOpacity onPress={handleSubmitReply} disabled={replying || !replyText.trim()}>
              <MaterialIcons
                name="send"
                size={24}
                color={replyText.trim() ? colors.primary : colors.textTertiary}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setReplyTo(null)}>
              <MaterialIcons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}

      {/* FAB */}
      {!replyTo && (
        <TouchableOpacity style={styles.fab} onPress={() => setShowModal(true)} activeOpacity={0.8}>
          <MaterialIcons name="rate-review" size={28} color={colors.white} />
        </TouchableOpacity>
      )}

      {/* Write Review Modal */}
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
          <KeyboardAvoidingView
            behavior={
              Platform.OS === 'web' ? undefined : Platform.OS === 'ios' ? 'padding' : 'height'
            }
          >
            <TouchableOpacity activeOpacity={1} onPress={() => {}}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Write a Review</Text>
                <View style={styles.ratingSelector}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <TouchableOpacity key={i} onPress={() => setRating(i)}>
                      <MaterialIcons
                        name={i <= rating ? 'star' : 'star-border'}
                        size={40}
                        color={i <= rating ? colors.warning : colors.textTertiary}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
                <TextInput
                  style={styles.commentInput}
                  placeholder="Share your experience…"
                  placeholderTextColor={colors.textTertiary}
                  value={comment}
                  onChangeText={setComment}
                  multiline
                  maxLength={1000}
                />
                <TouchableOpacity
                  style={[
                    styles.submitBtn,
                    (submitting || rating === 0 || !comment.trim()) && styles.submitBtnDisabled,
                  ]}
                  onPress={handleSubmit}
                  disabled={submitting || rating === 0 || !comment.trim()}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color={colors.white} />
                  ) : (
                    <Text style={styles.submitBtnText}>Submit Review</Text>
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

export default ReviewsScreen;
