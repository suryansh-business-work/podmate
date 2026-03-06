import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation } from '@apollo/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import { GET_CHAT_MESSAGES } from '../../graphql/queries';
import { SEND_MESSAGE } from '../../graphql/mutations';
import { resolveWsUrl } from '../../graphql/client';
import { useImageKitUpload } from '../../hooks/useImageKitUpload';
import { ChatRoomProps, ChatMessage } from './Chat.types';
import { createStyles } from './Chat.styles';
import MediaPreview from './MediaPreview';
import MessageBubble from './MessageBubble';
import ChatInputBar from './ChatInputBar';
import { useThemedStyles, useAppColors } from '../../hooks/useThemedStyles';

/* ── Helpers ── */

/** Group messages by day for day-separator headers */
type ListItem =
  | { type: 'day'; label: string; key: string }
  | { type: 'msg'; msg: ChatMessage; isMe: boolean; showAvatar: boolean; showSenderName: boolean };

function formatDayLabel(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const oneDay = 86_400_000;
  if (diff < oneDay && now.getDate() === d.getDate()) return 'Today';
  if (diff < 2 * oneDay && now.getDate() - d.getDate() === 1) return 'Yesterday';
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

function buildListItems(messages: ChatMessage[], myUserId: string): ListItem[] {
  const items: ListItem[] = [];
  let lastDay = '';
  let lastSenderId = '';

  for (const msg of messages) {
    const dayLabel = formatDayLabel(msg.createdAt);
    if (dayLabel !== lastDay) {
      items.push({ type: 'day', label: dayLabel, key: `day-${dayLabel}-${msg.id}` });
      lastDay = dayLabel;
      lastSenderId = ''; // reset grouping on new day
    }
    const isMe = msg.senderId === myUserId;
    const isSameSender = msg.senderId === lastSenderId;
    items.push({
      type: 'msg',
      msg,
      isMe,
      showAvatar: !isMe && !isSameSender,
      showSenderName: !isMe && !isSameSender,
    });
    lastSenderId = msg.senderId;
  }
  return items;
}

/* ── Component ── */

const ChatRoom: React.FC<ChatRoomProps> = ({ pod, onBack }) => {
  const styles = useThemedStyles(createStyles);
  const colors = useAppColors();
  const [messageText, setMessageText] = useState('');
  const [wsMessages, setWsMessages] = useState<ChatMessage[]>([]);
  const [previewMedia, setPreviewMedia] = useState<{ uri: string; type: 'IMAGE' | 'VIDEO' } | null>(
    null,
  );
  const [myUserId, setMyUserId] = useState<string>('');
  const wsRef = useRef<WebSocket | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const isInitialLoad = useRef(true);
  const insets = useSafeAreaInsets();

  const { pickAndUploadImage, pickAndUploadVideo, uploading } = useImageKitUpload();

  /* ── Data ── */
  const { data, loading } = useQuery<{ chatMessages: ChatMessage[] }>(GET_CHAT_MESSAGES, {
    variables: { podId: pod.id },
    fetchPolicy: 'network-only',
  });

  const [sendMessageMutation, { loading: sending }] = useMutation(SEND_MESSAGE);

  const allMessages = useMemo(() => {
    const serverMsgs = data?.chatMessages ?? [];
    const combined = [
      ...serverMsgs,
      ...wsMessages.filter((wsMsg) => !serverMsgs.some((m: ChatMessage) => m.id === wsMsg.id)),
    ];
    return combined.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }, [data?.chatMessages, wsMessages]);

  const listItems = useMemo(() => buildListItems(allMessages, myUserId), [allMessages, myUserId]);

  /* ── WebSocket ── */
  useEffect(() => {
    let ws: WebSocket | null = null;
    const connect = async () => {
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('userId');
      setMyUserId(userId ?? '');
      ws = new WebSocket(resolveWsUrl());
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
          /* ignore malformed messages */
        }
      };
    };
    connect();
    return () => {
      ws?.close();
      wsRef.current = null;
    };
  }, [pod.id]);

  /* ── Auto-scroll to bottom on new messages ── */
  useEffect(() => {
    if (listItems.length > 0 && flatListRef.current) {
      const timer = setTimeout(
        () => {
          flatListRef.current?.scrollToEnd({ animated: !isInitialLoad.current });
          isInitialLoad.current = false;
        },
        isInitialLoad.current ? 300 : 100,
      );
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [listItems.length]);

  /* ── Scroll to bottom when keyboard appears (WhatsApp-like) ── */
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const sub = Keyboard.addListener(showEvent, () => {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 150);
    });
    return () => sub.remove();
  }, []);

  /* ── Handlers ── */
  const handleSend = useCallback(async () => {
    const trimmed = messageText.trim();
    if (!trimmed || sending) return;
    setMessageText('');
    try {
      await sendMessageMutation({
        variables: { podId: pod.id, content: trimmed, messageType: 'TEXT' },
      });
    } catch {
      /* websocket will deliver */
    }
  }, [messageText, sending, sendMessageMutation, pod.id]);

  const handleSendImage = useCallback(async () => {
    const file = await pickAndUploadImage('/chat');
    if (!file) return;
    try {
      await sendMessageMutation({
        variables: { podId: pod.id, content: '', messageType: 'IMAGE', mediaUrl: file.url },
      });
    } catch {
      /* ws fallback */
    }
  }, [pickAndUploadImage, sendMessageMutation, pod.id]);

  const handleSendVideo = useCallback(async () => {
    const file = await pickAndUploadVideo('/chat');
    if (!file) return;
    try {
      await sendMessageMutation({
        variables: { podId: pod.id, content: '', messageType: 'VIDEO', mediaUrl: file.url },
      });
    } catch {
      /* ws fallback */
    }
  }, [pickAndUploadVideo, sendMessageMutation, pod.id]);

  const handlePreviewMedia = useCallback(
    (uri: string, type: 'IMAGE' | 'VIDEO') => setPreviewMedia({ uri, type }),
    [],
  );

  /* ── Render ── */
  const renderItem = useCallback(
    ({ item }: { item: ListItem }) => {
      if (item.type === 'day') {
        return (
          <View style={styles.daySeparator}>
            <Text style={styles.daySeparatorText}>{item.label}</Text>
          </View>
        );
      }
      return (
        <MessageBubble
          item={item.msg}
          isMe={item.isMe}
          showAvatar={item.showAvatar}
          showSenderName={item.showSenderName}
          onPreviewMedia={handlePreviewMedia}
        />
      );
    },
    [handlePreviewMedia],
  );

  const keyExtractor = useCallback(
    (item: ListItem) => (item.type === 'day' ? item.key : item.msg.id),
    [],
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ── Fixed Header ── */}
      <View style={styles.roomHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        {pod.imageUrl ? (
          <Image source={{ uri: pod.imageUrl }} style={styles.roomAvatar} />
        ) : (
          <View
            style={[
              styles.roomAvatar,
              {
                backgroundColor: colors.surfaceVariant,
                justifyContent: 'center',
                alignItems: 'center',
              },
            ]}
          >
            <MaterialIcons name="groups" size={20} color={colors.textTertiary} />
          </View>
        )}
        <View style={styles.roomHeaderInfo}>
          <Text style={styles.roomTitle} numberOfLines={1}>
            {pod.title}
          </Text>
          <Text
            style={[styles.roomSubtitle, pod.status !== 'ACTIVE' && styles.roomSubtitleOffline]}
          >
            {pod.status === 'ACTIVE' ? 'Active now' : pod.category}
          </Text>
        </View>
      </View>

      {/* ── Keyboard-aware body ── */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 56 : 0}
      >
        {/* Messages */}
        {loading && allMessages.length === 0 ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={listItems}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            contentContainerStyle={styles.messagesList}
            keyboardDismissMode="interactive"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
            initialNumToRender={30}
            maxToRenderPerBatch={15}
            windowSize={11}
            removeClippedSubviews={Platform.OS === 'android'}
            ListEmptyComponent={
              !loading ? (
                <View style={styles.centered}>
                  <MaterialIcons name="chat-bubble-outline" size={48} color={colors.textTertiary} />
                  <Text style={styles.emptyTitle}>No messages yet</Text>
                  <Text style={styles.emptySubtitle}>Start the conversation!</Text>
                </View>
              ) : null
            }
          />
        )}

        {/* Input Bar */}
        <ChatInputBar
          value={messageText}
          sending={sending}
          uploading={uploading}
          onChangeText={setMessageText}
          onSend={handleSend}
          onSendImage={handleSendImage}
          onSendVideo={handleSendVideo}
        />
      </KeyboardAvoidingView>

      {/* Media Preview Modal */}
      {previewMedia && (
        <MediaPreview
          visible
          uri={previewMedia.uri}
          type={previewMedia.type}
          onClose={() => setPreviewMedia(null)}
        />
      )}
    </SafeAreaView>
  );
};

export default ChatRoom;
