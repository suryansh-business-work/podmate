import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useMutation } from '@apollo/client';
import { spacing, borderRadius } from '../../theme';
import { REPLY_SUPPORT_TICKET } from '../../graphql/mutations';
import { GET_MY_SUPPORT_TICKETS } from '../../graphql/queries';
import { SupportTicket, TicketReply, STATUS_COLORS } from './Support.types';
import { createStyles } from './Support.styles';
import { useThemedStyles, useAppColors } from '../../hooks/useThemedStyles';

interface TicketCardProps {
  ticket: SupportTicket;
}

const ReplyBubble: React.FC<{ reply: TicketReply }> = ({ reply }) => {
  const styles = useThemedStyles(createStyles);
  const colors = useAppColors();
  const isAdmin = reply.senderRole === 'ADMIN';
  return (
    <View
      style={{
        alignSelf: isAdmin ? 'flex-start' : 'flex-end',
        maxWidth: '85%',
        backgroundColor: isAdmin ? colors.primary + '10' : colors.surfaceVariant,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        marginTop: spacing.sm,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 }}>
        <MaterialIcons
          name={isAdmin ? 'support-agent' : 'person'}
          size={12}
          color={isAdmin ? colors.primary : colors.textSecondary}
        />
        <Text
          style={{
            fontSize: 11,
            fontWeight: '600',
            color: isAdmin ? colors.primary : colors.textSecondary,
          }}
        >
          {isAdmin ? 'Support Team' : 'You'}
        </Text>
      </View>
      <Text style={{ fontSize: 14, color: colors.text, lineHeight: 20 }}>{reply.content}</Text>
      <Text
        style={{ fontSize: 10, color: colors.textTertiary, marginTop: 4, alignSelf: 'flex-end' }}
      >
        {new Date(reply.createdAt).toLocaleString('en-IN', {
          day: '2-digit',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </Text>
    </View>
  );
};

const TicketCard: React.FC<TicketCardProps> = ({ ticket }) => {
  const styles = useThemedStyles(createStyles);
  const colors = useAppColors();
  const [expanded, setExpanded] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replyTicket, { loading: replying }] = useMutation(REPLY_SUPPORT_TICKET, {
    refetchQueries: [{ query: GET_MY_SUPPORT_TICKETS }],
  });

  const isClosed = ticket.status === 'CLOSED' || ticket.status === 'RESOLVED';

  const handleReply = async () => {
    const trimmed = replyText.trim();
    if (!trimmed) return;
    try {
      await replyTicket({ variables: { ticketId: ticket.id, content: trimmed } });
      setReplyText('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to reply';
      Alert.alert('Error', msg);
    }
  };

  return (
    <TouchableOpacity
      style={styles.ticketCard}
      activeOpacity={0.8}
      onPress={() => setExpanded(!expanded)}
    >
      <View style={styles.ticketHeader}>
        <View style={styles.ticketTitleRow}>
          <Text style={styles.ticketSubject} numberOfLines={1}>
            {ticket.subject}
          </Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: (STATUS_COLORS[ticket.status] ?? colors.textTertiary) + '20' },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: STATUS_COLORS[ticket.status] ?? colors.textTertiary },
              ]}
            >
              {ticket.status.replace('_', ' ')}
            </Text>
          </View>
        </View>
        <Text style={styles.ticketDate}>{new Date(ticket.createdAt).toLocaleDateString()}</Text>
      </View>

      <Text style={styles.ticketMessage} numberOfLines={expanded ? undefined : 3}>
        {ticket.message}
      </Text>

      {expanded && ticket.replies.length > 0 && (
        <View style={{ marginTop: spacing.md }}>
          {ticket.replies.map((reply) => (
            <ReplyBubble key={reply.id} reply={reply} />
          ))}
        </View>
      )}

      {expanded && !isClosed && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: spacing.md,
            gap: spacing.sm,
          }}
        >
          <TextInput
            style={{
              flex: 1,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: borderRadius.sm,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
              fontSize: 14,
              color: colors.text,
            }}
            placeholder="Type your reply..."
            placeholderTextColor={colors.textTertiary}
            value={replyText}
            onChangeText={setReplyText}
            multiline
            maxLength={2000}
          />
          <TouchableOpacity
            onPress={handleReply}
            disabled={!replyText.trim() || replying}
            style={{
              backgroundColor: replyText.trim() ? colors.primary : colors.surfaceVariant,
              width: 40,
              height: 40,
              borderRadius: 20,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {replying ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <MaterialIcons
                name="send"
                size={18}
                color={replyText.trim() ? colors.white : colors.textTertiary}
              />
            )}
          </TouchableOpacity>
        </View>
      )}

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-end',
          marginTop: spacing.sm,
        }}
      >
        <MaterialIcons
          name={expanded ? 'expand-less' : 'expand-more'}
          size={20}
          color={colors.textTertiary}
        />
        {ticket.replies.length > 0 && !expanded && (
          <Text style={{ fontSize: 12, color: colors.textSecondary, marginLeft: 4 }}>
            {ticket.replies.length} {ticket.replies.length === 1 ? 'reply' : 'replies'}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default TicketCard;
