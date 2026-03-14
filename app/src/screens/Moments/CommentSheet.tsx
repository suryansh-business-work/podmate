import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';

import { ADD_MOMENT_COMMENT } from '../../graphql/mutations';
import { GET_MOMENTS } from '../../graphql/queries';
import SafeImage from '../../components/SafeImage';
import type { MomentCommentItem } from './Moments.types';
import { createStyles } from './Moments.styles';
import { useThemedStyles, useAppColors } from '../../hooks/useThemedStyles';

const GET_MOMENT_COMMENTS = gql`
  query GetMomentComments($momentId: ID!, $page: Int, $limit: Int) {
    momentComments(momentId: $momentId, page: $page, limit: $limit) {
      items {
        id
        momentId
        user {
          id
          name
          avatar
        }
        content
        createdAt
      }
      total
    }
  }
`;

interface CommentSheetProps {
  momentId: string;
  onClose: () => void;
}

const CommentSheet: React.FC<CommentSheetProps> = ({ momentId, onClose }) => {
  const styles = useThemedStyles(createStyles);
  const colors = useAppColors();
  const [text, setText] = useState('');

  const { data, loading } = useQuery<{
    momentComments: { items: MomentCommentItem[]; total: number };
  }>(GET_MOMENT_COMMENTS, {
    variables: { momentId, page: 1, limit: 50 },
    fetchPolicy: 'cache-and-network',
  });

  const [addComment, { loading: sending }] = useMutation(ADD_MOMENT_COMMENT, {
    refetchQueries: [
      { query: GET_MOMENT_COMMENTS, variables: { momentId, page: 1, limit: 50 } },
      { query: GET_MOMENTS },
    ],
  });

  const handleSend = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    await addComment({ variables: { momentId, content: trimmed } });
    setText('');
    Keyboard.dismiss();
  }, [text, momentId, addComment]);

  return (
    <TouchableWithoutFeedback onPress={onClose}>
      <View style={styles.commentOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ justifyContent: 'flex-end' }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.commentSheet}>
              <View style={styles.commentSheetHandle} />
              <Text style={styles.commentSheetTitle}>
                Comments {data?.momentComments.total ? `(${data.momentComments.total})` : ''}
              </Text>

              {loading && !data ? (
                <View style={{ padding: 24, alignItems: 'center' }}>
                  <ActivityIndicator size="small" color={colors.primary} />
                </View>
              ) : (
                <FlatList
                  data={data?.momentComments.items ?? []}
                  keyExtractor={(c) => c.id}
                  style={{ maxHeight: 300 }}
                  keyboardShouldPersistTaps="handled"
                  renderItem={({ item }) => (
                    <View style={styles.commentItem}>
                      {item.user.avatar ? (
                        <SafeImage uri={item.user.avatar} style={styles.commentAvatar} />
                      ) : (
                        <View
                          style={[
                            styles.commentAvatar,
                            { justifyContent: 'center', alignItems: 'center' },
                          ]}
                        >
                          <MaterialIcons name="person" size={14} color={colors.textTertiary} />
                        </View>
                      )}
                      <View style={styles.commentBody}>
                        <Text style={styles.commentUser}>{item.user.name}</Text>
                        <Text style={styles.commentText}>{item.content}</Text>
                      </View>
                    </View>
                  )}
                  ListEmptyComponent={
                    <View style={{ padding: 24, alignItems: 'center' }}>
                      <Text style={{ color: colors.textTertiary, fontSize: 13 }}>
                        No comments yet
                      </Text>
                    </View>
                  }
                />
              )}

              <View style={styles.commentInputRow}>
                <TextInput
                  style={styles.commentInput}
                  placeholder="Add a comment..."
                  placeholderTextColor={colors.textTertiary}
                  value={text}
                  onChangeText={setText}
                  multiline
                  returnKeyType="send"
                  blurOnSubmit={false}
                  onSubmitEditing={handleSend}
                />
                <TouchableOpacity
                  style={styles.commentSendBtn}
                  onPress={handleSend}
                  disabled={sending || !text.trim()}
                >
                  <MaterialIcons
                    name="send"
                    size={22}
                    color={text.trim() ? colors.primary : colors.textTertiary}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default CommentSheet;
