import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation } from '@apollo/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, borderRadius } from '../theme';
import { GET_MY_PODS, GET_CHAT_MESSAGES } from '../graphql/queries';
import { SEND_MESSAGE } from '../graphql/mutations';

/* ── Types ── */
interface Pod {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
  status: string;
}

interface ChatMessageSender {
  id: string;
  name: string;
  avatar: string;
}

interface ChatMessage {
  id: string;
  podId: string;
  senderId: string;
  content: string;
  createdAt: string;
  sender: ChatMessageSender;
}

/* ── Chat Room Component ── */
interface ChatRoomProps {
  pod: Pod;
  onBack: () => void;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ pod, onBack }) => {
  const [messageText, setMessageText] = useState('');
  const [wsMessages, setWsMessages] = useState<ChatMessage[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const [myUserId, setMyUserId] = useState<string>('');

  const { data, loading } = useQuery<{ chatMessages: ChatMessage[] }>(GET_CHAT_MESSAGES, {
    variables: { podId: pod.id },
    fetchPolicy: 'network-only',
  });

  const [sendMessageMutation, { loading: sending }] = useMutation(SEND_MESSAGE);

  /* Combine server messages + ws live messages */
  const allMessages = [
    ...(data?.chatMessages ?? []),
    ...wsMessages.filter(
      (wsMsg) => !data?.chatMessages?.some((m: ChatMessage) => m.id === wsMsg.id),
    ),
  ].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  /* WebSocket connection */
  useEffect(() => {
    let ws: WebSocket | null = null;

    const connect = async () => {
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('userId');
      setMyUserId(userId ?? '');

      ws = new WebSocket('ws://localhost:4039/ws');
      wsRef.current = ws;

      ws.onopen = () => {
        ws?.send(JSON.stringify({ type: 'join', token, podId: pod.id }));
      };

      ws.onmessage = (event: WebSocketMessageEvent) => {
        try {
          const payload = JSON.parse(event.data as string);
          if (payload.type === 'new_message' && payload.message) {
            setWsMessages((prev) => [...prev, payload.message as ChatMessage]);
          }
        } catch {
          /* ignore */
        }
      };

      ws.onerror = () => {
        /* silent reconnect could be added */
      };
    };

    connect();

    return () => {
      ws?.close();
      wsRef.current = null;
    };
  }, [pod.id]);

  const handleSend = useCallback(async () => {
    const trimmed = messageText.trim();
    if (!trimmed || sending) return;

    setMessageText('');
    try {
      await sendMessageMutation({
        variables: { podId: pod.id, content: trimmed },
      });
    } catch {
      /* message will arrive via WS broadcast anyway */
    }
  }, [messageText, sending, sendMessageMutation, pod.id]);

  const formatTime = (iso: string): string => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isMe = item.senderId === myUserId;
    return (
      <View style={[styles.msgRow, isMe && styles.msgRowMe]}>
        {!isMe && (
          <Image
            source={{ uri: item.sender?.avatar || 'https://i.pravatar.cc/40' }}
            style={styles.msgAvatar}
          />
        )}
        <View style={[styles.msgBubble, isMe ? styles.msgBubbleMe : styles.msgBubbleOther]}>
          {!isMe && (
            <Text style={styles.msgSenderName}>{item.sender?.name ?? 'Unknown'}</Text>
          )}
          <Text style={[styles.msgText, isMe && styles.msgTextMe]}>{item.content}</Text>
          <Text style={[styles.msgTime, isMe && styles.msgTimeMe]}>
            {formatTime(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.roomHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Image source={{ uri: pod.imageUrl }} style={styles.roomAvatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.roomTitle} numberOfLines={1}>
            {pod.title}
          </Text>
          <Text style={styles.roomSubtitle}>{pod.category}</Text>
        </View>
      </View>

      {/* Messages */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={allMessages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
        />
      )}

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Type a message…"
            placeholderTextColor={colors.textTertiary}
            value={messageText}
            onChangeText={setMessageText}
            multiline
            maxLength={2000}
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={!messageText.trim() || sending}
            style={[
              styles.sendBtn,
              (!messageText.trim() || sending) && styles.sendBtnDisabled,
            ]}
          >
            <Text style={styles.sendIcon}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

/* ── Chat List (pods) ── */
const ChatScreen: React.FC = () => {
  const [selectedPod, setSelectedPod] = useState<Pod | null>(null);

  const { data, loading } = useQuery<{ myPods: Pod[] }>(GET_MY_PODS, {
    fetchPolicy: 'cache-and-network',
  });

  if (selectedPod) {
    return <ChatRoom pod={selectedPod} onBack={() => setSelectedPod(null)} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Messages</Text>
      {loading && !data && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
      {data?.myPods && data.myPods.length === 0 && (
        <View style={styles.centered}>
          <Text style={styles.emptyIcon}>💬</Text>
          <Text style={styles.emptyTitle}>No conversations yet</Text>
          <Text style={styles.emptySubtitle}>
            Join a pod to start chatting with other attendees
          </Text>
        </View>
      )}
      <FlatList
        data={data?.myPods ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.chatRow}
            activeOpacity={0.7}
            onPress={() => setSelectedPod(item)}
          >
            <Image
              source={{ uri: item.imageUrl || 'https://i.pravatar.cc/50' }}
              style={styles.avatar}
            />
            <View style={styles.chatInfo}>
              <Text style={styles.chatName} numberOfLines={1}>
                {item.title}
              </Text>
              <View style={styles.metaRow}>
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor:
                        item.status === 'ACTIVE' ? colors.success : colors.textTertiary,
                    },
                  ]}
                />
                <Text style={styles.chatMessage}>{item.category}</Text>
              </View>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
};

/* ── Styles ── */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  emptyIcon: { fontSize: 48, marginBottom: spacing.md },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: colors.text, marginBottom: spacing.xs },
  emptySubtitle: { fontSize: 14, color: colors.textSecondary, textAlign: 'center' },

  /* Chat List */
  list: { paddingHorizontal: spacing.xl, paddingBottom: 100 },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  avatar: { width: 52, height: 52, borderRadius: 26 },
  chatInfo: { flex: 1 },
  chatName: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  chatMessage: { fontSize: 14, color: colors.textSecondary },
  chevron: { fontSize: 22, color: colors.textTertiary, fontWeight: '300' },
  separator: { height: 1, backgroundColor: colors.surfaceVariant },

  /* Chat Room Header */
  roomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceVariant,
    gap: spacing.sm,
  },
  backBtn: { padding: spacing.xs },
  backIcon: { fontSize: 24, color: colors.text },
  roomAvatar: { width: 40, height: 40, borderRadius: 20 },
  roomTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  roomSubtitle: { fontSize: 12, color: colors.textSecondary },

  /* Messages */
  messagesList: { padding: spacing.md, paddingBottom: spacing.lg },
  msgRow: { flexDirection: 'row', marginBottom: spacing.sm, alignItems: 'flex-end' },
  msgRowMe: { justifyContent: 'flex-end' },
  msgAvatar: { width: 28, height: 28, borderRadius: 14, marginRight: spacing.xs },
  msgBubble: {
    maxWidth: '75%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  msgBubbleOther: { backgroundColor: colors.surfaceVariant },
  msgBubbleMe: { backgroundColor: colors.primary },
  msgSenderName: { fontSize: 11, fontWeight: '600', color: colors.primary, marginBottom: 2 },
  msgText: { fontSize: 15, color: colors.text, lineHeight: 20 },
  msgTextMe: { color: colors.white },
  msgTime: { fontSize: 10, color: colors.textTertiary, marginTop: 4, alignSelf: 'flex-end' },
  msgTimeMe: { color: 'rgba(255,255,255,0.7)' },

  /* Input Bar */
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceVariant,
    backgroundColor: colors.white,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surfaceVariant,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === 'ios' ? spacing.sm : spacing.xs,
    fontSize: 15,
    maxHeight: 100,
    color: colors.text,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },
  sendIcon: { fontSize: 18, color: colors.white },
});

export default ChatScreen;
