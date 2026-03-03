import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
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
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../theme';
import { GET_CHAT_MESSAGES } from '../../graphql/queries';
import { SEND_MESSAGE } from '../../graphql/mutations';
import { resolveWsUrl } from '../../graphql/client';
import { useImageKitUpload } from '../../hooks/useImageKitUpload';
import { Pod, ChatMessage } from './Chat.types';
import { styles } from './Chat.styles';
import MediaPreview from './MediaPreview';
import MessageBubble from './MessageBubble';

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
    ...wsMessages.filter((wsMsg) => !data?.chatMessages?.some((m: ChatMessage) => m.id === wsMsg.id)),
  ].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  useEffect(() => {
    let ws: WebSocket | null = null;
    const connect = async () => {
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('userId');
      setMyUserId(userId ?? '');
      ws = new WebSocket(resolveWsUrl());
      wsRef.current = ws;
      ws.onopen = () => { ws?.send(JSON.stringify({ type: 'join', token, podId: pod.id })); };
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
    try { await sendMessageMutation({ variables: { podId: pod.id, content: trimmed, messageType: 'TEXT' } }); } catch { /* ws will deliver */ }
  }, [messageText, sending, sendMessageMutation, pod.id]);

  const handleSendImage = useCallback(async () => {
    setShowAttach(false);
    const file = await pickAndUploadImage('/chat');
    if (!file) return;
    try { await sendMessageMutation({ variables: { podId: pod.id, content: '', messageType: 'IMAGE', mediaUrl: file.url } }); } catch { /* ws */ }
  }, [pickAndUploadImage, sendMessageMutation, pod.id]);

  const handleSendVideo = useCallback(async () => {
    setShowAttach(false);
    const file = await pickAndUploadVideo('/chat');
    if (!file) return;
    try { await sendMessageMutation({ variables: { podId: pod.id, content: '', messageType: 'VIDEO', mediaUrl: file.url } }); } catch { /* ws */ }
  }, [pickAndUploadVideo, sendMessageMutation, pod.id]);

  const handlePreviewMedia = useCallback((uri: string, type: 'IMAGE' | 'VIDEO') => {
    setPreviewMedia({ uri, type });
  }, []);

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <MessageBubble item={item} isMe={item.senderId === myUserId} onPreviewMedia={handlePreviewMedia} />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.roomHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        {pod.imageUrl ? <Image source={{ uri: pod.imageUrl }} style={styles.roomAvatar} /> : (
          <View style={[styles.roomAvatar, { backgroundColor: colors.surfaceVariant, justifyContent: 'center', alignItems: 'center' }]}>
            <MaterialIcons name="groups" size={20} color={colors.textTertiary} />
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.roomTitle} numberOfLines={1}>{pod.title}</Text>
          <Text style={styles.roomSubtitle}>{pod.category}</Text>
        </View>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}>
        {loading ? (
          <View style={styles.centered}><ActivityIndicator size="large" color={colors.primary} /></View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={allMessages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            keyboardDismissMode="interactive"
            keyboardShouldPersistTaps="handled"
          />
        )}

        {uploading && (
          <View style={styles.uploadingBar}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.uploadingText}>Uploading media…</Text>
          </View>
        )}

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
          <TouchableOpacity onPress={handleSend} disabled={!messageText.trim() || sending} style={[styles.sendBtn, (!messageText.trim() || sending) && styles.sendBtnDisabled]}>
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

      {previewMedia && <MediaPreview visible uri={previewMedia.uri} type={previewMedia.type} onClose={() => setPreviewMedia(null)} />}
    </SafeAreaView>
  );
};

export default ChatRoom;
