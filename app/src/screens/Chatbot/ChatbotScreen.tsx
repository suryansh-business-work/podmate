import React, { useRef, useCallback, useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation } from '@apollo/client';
import { MaterialIcons } from '@expo/vector-icons';
import { GET_CHATBOT_HISTORY } from '../../graphql/queries';
import { ASK_CHATBOT, CLEAR_CHATBOT_HISTORY } from '../../graphql/mutations';

import { createStyles } from './Chatbot.styles';
import type {
  ChatbotScreenProps,
  ChatbotMessage,
  AskChatbotResult,
  ChatbotHistoryResult,
} from './Chatbot.types';
import { useThemedStyles, useAppColors } from '../../hooks/useThemedStyles';

const ChatbotScreen: React.FC<ChatbotScreenProps> = ({ onBack }) => {
  const styles = useThemedStyles(createStyles);
  const colors = useAppColors();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList<ChatbotMessage>>(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [localMessages, setLocalMessages] = useState<ChatbotMessage[]>([]);

  const { data } = useQuery<ChatbotHistoryResult>(GET_CHATBOT_HISTORY, {
    fetchPolicy: 'cache-and-network',
  });

  useEffect(() => {
    if (data?.chatbotHistory) {
      setLocalMessages(data.chatbotHistory);
    }
  }, [data]);

  const [askChatbot] = useMutation<AskChatbotResult>(ASK_CHATBOT);
  const [clearHistory] = useMutation(CLEAR_CHATBOT_HISTORY);

  const scrollToEnd = useCallback(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  const handleSend = useCallback(async () => {
    const trimmed = message.trim();
    if (!trimmed || sending) return;

    const userMsg: ChatbotMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: trimmed,
      createdAt: new Date().toISOString(),
    };

    setLocalMessages((prev) => [...prev, userMsg]);
    setMessage('');
    setSending(true);
    scrollToEnd();

    try {
      const { data: response } = await askChatbot({
        variables: { message: trimmed },
        refetchQueries: [{ query: GET_CHATBOT_HISTORY }],
      });

      if (response?.askChatbot) {
        const assistantMsg: ChatbotMessage = {
          id: response.askChatbot.messageId,
          role: 'assistant',
          content: response.askChatbot.reply,
          createdAt: new Date().toISOString(),
        };
        setLocalMessages((prev) => [...prev, assistantMsg]);
        scrollToEnd();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong';
      Alert.alert('Error', errorMessage);
    } finally {
      setSending(false);
    }
  }, [message, sending, askChatbot, scrollToEnd]);

  const handleClear = useCallback(() => {
    Alert.alert('Clear Chat', 'Are you sure you want to clear all chat history?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          try {
            await clearHistory({
              refetchQueries: [{ query: GET_CHATBOT_HISTORY }],
            });
            setLocalMessages([]);
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to clear';
            Alert.alert('Error', errorMessage);
          }
        },
      },
    ]);
  }, [clearHistory]);

  const formatTime = useCallback((dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, []);

  const renderMessage = useCallback(
    ({ item }: { item: ChatbotMessage }) => {
      const isUser = item.role === 'user';
      return (
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.assistantBubble]}>
          <Text style={isUser ? styles.userText : styles.assistantText}>{item.content}</Text>
          <Text style={[styles.timeText, isUser ? styles.userTime : styles.assistantTime]}>
            {formatTime(item.createdAt)}
          </Text>
        </View>
      );
    },
    [formatTime],
  );

  const renderEmpty = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <MaterialIcons
          name="smart-toy"
          size={64}
          color={colors.textTertiary}
          style={styles.emptyIcon}
        />
        <Text style={styles.emptyTitle}>Ask PartyWings AI</Text>
        <Text style={styles.emptySubtitle}>
          Ask anything about events, pods, venues, or get help with the app!
        </Text>
      </View>
    ),
    [],
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={onBack}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PartyWings AI</Text>
        {localMessages.length > 0 && (
          <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
            <MaterialIcons name="delete-outline" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList<ChatbotMessage>
        ref={flatListRef}
        data={localMessages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        style={styles.messageList}
        contentContainerStyle={[
          styles.messageListContent,
          localMessages.length === 0 && { flex: 1 },
        ]}
        ListEmptyComponent={renderEmpty}
        onContentSizeChange={scrollToEnd}
      />

      {sending && (
        <View style={styles.typingIndicator}>
          <Text style={styles.typingText}>PartyWings AI is typing...</Text>
        </View>
      )}

      <View style={[styles.inputContainer, { paddingBottom: insets.bottom + 8 }]}>
        <TextInput
          style={styles.textInput}
          value={message}
          onChangeText={setMessage}
          placeholder="Ask something..."
          placeholderTextColor={colors.textTertiary}
          multiline
          maxLength={500}
          editable={!sending}
          onSubmitEditing={handleSend}
          returnKeyType="send"
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!message.trim() || sending) && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!message.trim() || sending}
        >
          <MaterialIcons name="send" size={20} color={colors.white} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatbotScreen;
