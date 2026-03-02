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
  Dimensions,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation } from '@apollo/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Video, ResizeMode } from 'expo-av';
import { colors, spacing, borderRadius } from '../theme';
import { GET_MY_PODS, GET_CHAT_MESSAGES } from '../graphql/queries';
import { SEND_MESSAGE } from '../graphql/mutations';
import { resolveWsUrl } from '../graphql/client';
import { useImageKitUpload } from '../hooks/useImageKitUpload';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MEDIA_MAX_WIDTH = SCREEN_WIDTH * 0.6;

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
  messageType: 'TEXT' | 'IMAGE' | 'VIDEO';
  mediaUrl: string;
  createdAt: string;
  sender: ChatMessageSender;
}

/* ── Media Preview Modal ── */

interface MediaPreviewProps {
  visible: boolean;
  uri: string;
  type: 'IMAGE' | 'VIDEO';
  onClose: () => void;
}

const MediaPreview: React.FC<MediaPreviewProps> = ({ visible, uri, type, onClose }) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <View style={pvStyles.backdrop}>
      <TouchableOpacity style={pvStyles.closeBtn} onPress={onClose}>
        <MaterialIcons name="close" size={28} color={colors.white} />
      </TouchableOpacity>
      {type === 'IMAGE' ? (
        <Image source={{ uri }} style={pvStyles.fullImage} resizeMode="contain" />
      ) : (
        <Video source={{ uri }} style={pvStyles.fullImage} useNativeControls resizeMode={ResizeMode.CONTAIN} />
      )}
    </View>
  </Modal>
);

const pvStyles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'center', alignItems: 'center' },
  closeBtn: { position: 'absolute', top: 50, right: 20, zIndex: 10, padding: 8 },
  fullImage: { width: '100%', height: '80%' },
});

/* ── Chat Room ── */

interface ChatRoomProps {
  pod: Pod;
  onBack: () => void;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ pod, onBack }) => {
  const [messageText, setMessageText] = useState('');
  const [wsMessages, setWsMessages] = useState<ChatMessage[]>([]);
  const [showAttach, setShowAttach] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<{ uri: string; type: 'IMAGE' | 'VIDEO' } | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const [myUserId, setMyUserId] = useState<string>('');

  const { pickAndUploadImage, pickAndUploadVideo, uploading } = useImageKitUpload();

  const { data, loading } = useQuery<{ chatMessages: ChatMessage[] }>(GET_CHAT_MESSAGES, {
    variables: { podId: pod.id },
    fetchPolicy: 'network-only',
  });

  const [sendMessageMutation, { loading: sending }] = useMutation(SEND_MESSAGE);

  const allMessages = [
    ...(data?.chatMessages ?? []),
    ...wsMessages.filter(
      (wsMsg) => !data?.chatMessages?.some((m: ChatMessage) => m.id === wsMsg.id),
    ),
  ].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

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
        } catch { /* ignore */ }
      };
    };
    connect();
    return () => { ws?.close(); wsRef.current = null; };
  }, [pod.id]);

  const handleSend = useCallback(async () => {
    const trimmed = messageText.trim();
    if (!trimmed || sending) return;
    setMessageText('');
    try {
      await sendMessageMutation({ variables: { podId: pod.id, content: trimmed, messageType: 'TEXT' } });
    } catch { /* ws will deliver */ }
  }, [messageText, sending, sendMessageMutation, pod.id]);

  const handleSendImage = useCallback(async () => {
    setShowAttach(false);
    const file = await pickAndUploadImage('/chat');
    if (!file) return;
    try {
      await sendMessageMutation({ variables: { podId: pod.id, content: '', messageType: 'IMAGE', mediaUrl: file.url } });
    } catch { /* ws will deliver */ }
  }, [pickAndUploadImage, sendMessageMutation, pod.id]);

  const handleSendVideo = useCallback(async () => {
    setShowAttach(false);
    const file = await pickAndUploadVideo('/chat');
    if (!file) return;
    try {
      await sendMessageMutation({ variables: { podId: pod.id, content: '', messageType: 'VIDEO', mediaUrl: file.url } });
    } catch { /* ws will deliver */ }
  }, [pickAndUploadVideo, sendMessageMutation, pod.id]);

  const formatTime = (iso: string): string => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMediaContent = (item: ChatMessage) => {
    if (item.messageType === 'IMAGE' && item.mediaUrl) {
      return (
        <TouchableOpacity activeOpacity={0.85} onPress={() => setPreviewMedia({ uri: item.mediaUrl, type: 'IMAGE' })}>
          <Image source={{ uri: item.mediaUrl }} style={styles.mediaThumbnail} resizeMode="cover" />
        </TouchableOpacity>
      );
    }
    if (item.messageType === 'VIDEO' && item.mediaUrl) {
      return (
        <TouchableOpacity activeOpacity={0.85} onPress={() => setPreviewMedia({ uri: item.mediaUrl, type: 'VIDEO' })} style={styles.videoThumbWrap}>
          <Video source={{ uri: item.mediaUrl }} style={styles.mediaThumbnail} resizeMode={ResizeMode.COVER} shouldPlay={false} />
          <View style={styles.playOverlay}>
            <MaterialIcons name="play-circle-fill" size={42} color="rgba(255,255,255,0.9)" />
          </View>
        </TouchableOpacity>
      );
    }
    return null;
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isMe = item.senderId === myUserId;
    const isMedia = item.messageType === 'IMAGE' || item.messageType === 'VIDEO';
    return (
      <View style={[styles.msgRow, isMe && styles.msgRowMe]}>
        {!isMe && (
          item.sender?.avatar
            ? <Image source={{ uri: item.sender.avatar }} style={styles.msgAvatar} />
            : <View style={[styles.msgAvatar, { backgroundColor: colors.surfaceVariant, justifyContent: 'center', alignItems: 'center' }]}><MaterialIcons name="person" size={16} color={colors.textTertiary} /></View>
        )}
        <View style={[styles.msgBubble, isMe ? styles.msgBubbleMe : styles.msgBubbleOther, isMedia && styles.mediaBubble]}>
          {!isMe && <Text style={styles.msgSenderName}>{item.sender?.name ?? 'Unknown'}</Text>}
          {renderMediaContent(item)}
          {item.content ? <Text style={[styles.msgText, isMe && styles.msgTextMe]}>{item.content}</Text> : null}
          <Text style={[styles.msgTime, isMe && styles.msgTimeMe]}>{formatTime(item.createdAt)}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.roomHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        {pod.imageUrl ? (
          <Image source={{ uri: pod.imageUrl }} style={styles.roomAvatar} />
        ) : (
          <View style={[styles.roomAvatar, { backgroundColor: colors.surfaceVariant, justifyContent: 'center', alignItems: 'center' }]}>
            <MaterialIcons name="groups" size={20} color={colors.textTertiary} />
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.roomTitle} numberOfLines={1}>{pod.title}</Text>
          <Text style={styles.roomSubtitle}>{pod.category}</Text>
        </View>
      </View>

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
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
      )}

      {uploading && (
        <View style={styles.uploadingBar}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.uploadingText}>Uploading media…</Text>
        </View>
      )}

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
        <View style={styles.inputBar}>
          <TouchableOpacity onPress={() => setShowAttach(!showAttach)} style={styles.attachBtn}>
            <MaterialIcons name="add" size={24} color={showAttach ? colors.primary : colors.textSecondary} />
          </TouchableOpacity>
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
            style={[styles.sendBtn, (!messageText.trim() || sending) && styles.sendBtnDisabled]}
          >
            <MaterialIcons name="send" size={18} color={colors.white} />
          </TouchableOpacity>
        </View>
        {showAttach && (
          <View style={styles.attachRow}>
            <TouchableOpacity style={styles.attachOption} onPress={handleSendImage}>
              <View style={[styles.attachCircle, { backgroundColor: colors.primary + '15' }]}>
                <MaterialIcons name="image" size={22} color={colors.primary} />
              </View>
              <Text style={styles.attachLabel}>Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.attachOption} onPress={handleSendVideo}>
              <View style={[styles.attachCircle, { backgroundColor: colors.secondary + '15' }]}>
                <MaterialIcons name="videocam" size={22} color={colors.secondary} />
              </View>
              <Text style={styles.attachLabel}>Video</Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>

      {previewMedia && (
        <MediaPreview visible uri={previewMedia.uri} type={previewMedia.type} onClose={() => setPreviewMedia(null)} />
      )}
    </SafeAreaView>
  );
};

const ChatScreen: React.FC = () => {
  const [selectedPod, setSelectedPod] = useState<Pod | null>(null);
  const { data, loading } = useQuery<{ myPods: Pod[] }>(GET_MY_PODS, { fetchPolicy: 'cache-and-network' });

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
          <MaterialIcons name="chat-bubble-outline" size={48} color={colors.textTertiary} />
          <Text style={styles.emptyTitle}>No conversations yet</Text>
          <Text style={styles.emptySubtitle}>Join a pod to start chatting with other attendees</Text>
        </View>
      )}
      <FlatList
        data={data?.myPods ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.chatRow} activeOpacity={0.7} onPress={() => setSelectedPod(item)}>
            {item.imageUrl
              ? <Image source={{ uri: item.imageUrl }} style={styles.avatar} />
              : <View style={[styles.avatar, { backgroundColor: colors.surfaceVariant, justifyContent: 'center', alignItems: 'center' }]}><MaterialIcons name="groups" size={24} color={colors.textTertiary} /></View>
            }
            <View style={styles.chatInfo}>
              <Text style={styles.chatName} numberOfLines={1}>{item.title}</Text>
              <View style={styles.metaRow}>
                <View style={[styles.statusDot, { backgroundColor: item.status === 'ACTIVE' ? colors.success : colors.textTertiary }]} />
                <Text style={styles.chatMessage}>{item.category}</Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={22} color={colors.textTertiary} />
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: { fontSize: 28, fontWeight: '700', color: colors.text, paddingHorizontal: spacing.xl, paddingTop: spacing.lg, marginBottom: spacing.lg },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: colors.text, marginBottom: spacing.xs, marginTop: spacing.md },
  emptySubtitle: { fontSize: 14, color: colors.textSecondary, textAlign: 'center' },
  list: { paddingHorizontal: spacing.xl, paddingBottom: 100 },
  chatRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, gap: spacing.md },
  avatar: { width: 52, height: 52, borderRadius: 26 },
  chatInfo: { flex: 1 },
  chatName: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  chatMessage: { fontSize: 14, color: colors.textSecondary },
  separator: { height: 1, backgroundColor: colors.surfaceVariant },
  roomHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.surfaceVariant, gap: spacing.sm },
  backBtn: { padding: spacing.xs },
  roomAvatar: { width: 40, height: 40, borderRadius: 20 },
  roomTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  roomSubtitle: { fontSize: 12, color: colors.textSecondary },
  messagesList: { padding: spacing.md, paddingBottom: spacing.lg },
  msgRow: { flexDirection: 'row', marginBottom: spacing.sm, alignItems: 'flex-end' },
  msgRowMe: { justifyContent: 'flex-end' },
  msgAvatar: { width: 28, height: 28, borderRadius: 14, marginRight: spacing.xs },
  msgBubble: { maxWidth: '75%', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.lg },
  msgBubbleOther: { backgroundColor: colors.surfaceVariant },
  msgBubbleMe: { backgroundColor: colors.primary },
  mediaBubble: { paddingHorizontal: spacing.xs, paddingTop: spacing.xs, overflow: 'hidden' },
  msgSenderName: { fontSize: 11, fontWeight: '600', color: colors.primary, marginBottom: 2 },
  msgText: { fontSize: 15, color: colors.text, lineHeight: 20 },
  msgTextMe: { color: colors.white },
  msgTime: { fontSize: 10, color: colors.textTertiary, marginTop: 4, alignSelf: 'flex-end' },
  msgTimeMe: { color: 'rgba(255,255,255,0.7)' },
  mediaThumbnail: { width: MEDIA_MAX_WIDTH, height: MEDIA_MAX_WIDTH * 0.65, borderRadius: borderRadius.md },
  videoThumbWrap: { position: 'relative' as const },
  playOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center' as const, alignItems: 'center' as const },
  uploadingBar: { flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'center' as const, gap: spacing.sm, paddingVertical: spacing.xs, backgroundColor: colors.surfaceVariant },
  uploadingText: { fontSize: 13, color: colors.textSecondary },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: spacing.sm, paddingVertical: spacing.sm, borderTopWidth: 1, borderTopColor: colors.surfaceVariant, backgroundColor: colors.white, gap: spacing.xs },
  attachBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surfaceVariant, justifyContent: 'center', alignItems: 'center' },
  input: { flex: 1, backgroundColor: colors.surfaceVariant, borderRadius: borderRadius.lg, paddingHorizontal: spacing.md, paddingVertical: Platform.OS === 'ios' ? spacing.sm : spacing.xs, fontSize: 15, maxHeight: 100, color: colors.text },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  sendBtnDisabled: { opacity: 0.4 },
  attachRow: { flexDirection: 'row' as const, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, gap: spacing.xl, borderTopWidth: 1, borderTopColor: colors.surfaceVariant, backgroundColor: colors.white },
  attachOption: { alignItems: 'center' as const, gap: spacing.xs },
  attachCircle: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center' as const, alignItems: 'center' as const },
  attachLabel: { fontSize: 12, color: colors.textSecondary, fontWeight: '500' as const },
});

export default ChatScreen;
