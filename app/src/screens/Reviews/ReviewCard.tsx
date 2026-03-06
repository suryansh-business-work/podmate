import React, { memo } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import type { Review as ReviewType } from './Reviews.types';
import { createStyles } from './Reviews.styles';
import { useThemedStyles, useAppColors } from '../../hooks/useThemedStyles';

interface ReviewCardProps {
  review: ReviewType;
  onReply: (reviewId: string) => void;
  onReport: (reviewId: string) => void;
}

const Stars: React.FC<{ rating: number; size?: number }> = ({ rating, size = 14 }) => {
  const colors = useAppColors();
  return (
    <View style={{ flexDirection: 'row', gap: 1 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <MaterialIcons
          key={i}
          name={i <= rating ? 'star' : 'star-border'}
          size={size}
          color={i <= rating ? colors.warning : colors.textTertiary}
        />
      ))}
    </View>
  );
};

const ReviewCard: React.FC<ReviewCardProps> = memo(({ review, onReply, onReport }) => {
  const styles = useThemedStyles(createStyles);
  const colors = useAppColors();
  const timeAgo = new Date(review.createdAt).toLocaleDateString();

  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        {review.user.avatar ? (
          <Image source={{ uri: review.user.avatar }} style={styles.reviewAvatar} />
        ) : (
          <View style={styles.reviewAvatarPlaceholder}>
            <MaterialIcons name="person" size={18} color={colors.white} />
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.reviewName}>{review.user.name}</Text>
          <Stars rating={review.rating} />
        </View>
        <Text style={styles.reviewDate}>{timeAgo}</Text>
      </View>

      <Text style={styles.reviewComment}>{review.comment}</Text>

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => onReply(review.id)}>
          <MaterialIcons name="reply" size={16} color={colors.textSecondary} />
          <Text style={styles.actionText}>Reply</Text>
        </TouchableOpacity>
        {!review.isReported && (
          <TouchableOpacity style={styles.actionBtn} onPress={() => onReport(review.id)}>
            <MaterialIcons name="flag" size={16} color={colors.textSecondary} />
            <Text style={styles.actionText}>Report</Text>
          </TouchableOpacity>
        )}
      </View>

      {review.replies.length > 0 && (
        <View style={styles.repliesContainer}>
          {review.replies.map((reply) => (
            <View key={reply.id} style={styles.replyCard}>
              <View style={styles.replyHeader}>
                <Text style={styles.replyName}>{reply.user.name}</Text>
                <Text style={styles.replyDate}>
                  • {new Date(reply.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <Text style={styles.replyText}>{reply.comment}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
});

ReviewCard.displayName = 'ReviewCard';

export { ReviewCard, Stars };
