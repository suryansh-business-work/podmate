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
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation } from '@apollo/client';
import { MaterialIcons } from '@expo/vector-icons';

import { GET_ACTIVE_LIVE_SESSIONS } from '../../graphql/queries';
import {
  START_LIVE_SESSION,
  END_LIVE_SESSION,
  JOIN_LIVE_SESSION,
  LEAVE_LIVE_SESSION,
} from '../../graphql/mutations';
import type { GoLiveScreenProps, LiveSession } from './GoLive.types';
import { createStyles } from './GoLive.styles';
import { useThemedStyles, useAppColors } from '../../hooks/useThemedStyles';

const formatElapsed = (startedAt: string): string => {
  const diff = Date.now() - Number(startedAt);
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ${mins % 60}m ago`;
};

const GoLiveScreen: React.FC<GoLiveScreenProps> = ({ onBack }) => {
  const styles = useThemedStyles(createStyles);
  const colors = useAppColors();
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [podId, setPodId] = useState('');

  const { data, loading, refetch } = useQuery<{
    activeLiveSessions: { items: LiveSession[]; total: number };
  }>(GET_ACTIVE_LIVE_SESSIONS, {
    variables: { page: 1, limit: 50 },
    fetchPolicy: 'cache-and-network',
    pollInterval: 15000,
  });

  const [startLive, { loading: starting }] = useMutation(START_LIVE_SESSION);
  const [endLive] = useMutation(END_LIVE_SESSION);
  const [joinLive] = useMutation(JOIN_LIVE_SESSION);
  const [leaveLive] = useMutation(LEAVE_LIVE_SESSION);

  const sessions = data?.activeLiveSessions?.items ?? [];

  const handleStart = useCallback(async () => {
    if (!title.trim() || !podId.trim()) return;
    try {
      await startLive({
        variables: {
          input: {
            podId: podId.trim(),
            title: title.trim(),
            description: description.trim() || undefined,
          },
        },
      });
      setShowModal(false);
      setTitle('');
      setDescription('');
      setPodId('');
      refetch();
    } catch (err) {
      Alert.alert('Error', (err as Error).message);
    }
  }, [title, description, podId, startLive, refetch]);

  const handleJoin = useCallback(
    async (sessionId: string) => {
      try {
        await joinLive({ variables: { sessionId } });
        refetch();
      } catch (err) {
        Alert.alert('Error', (err as Error).message);
      }
    },
    [joinLive, refetch],
  );

  const handleLeave = useCallback(
    async (sessionId: string) => {
      try {
        await leaveLive({ variables: { sessionId } });
        refetch();
      } catch (err) {
        Alert.alert('Error', (err as Error).message);
      }
    },
    [leaveLive, refetch],
  );

  const handleEnd = useCallback(
    async (sessionId: string) => {
      Alert.alert('End Live', 'Are you sure you want to end this live session?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End',
          style: 'destructive',
          onPress: async () => {
            try {
              await endLive({ variables: { sessionId } });
              refetch();
            } catch (err) {
              Alert.alert('Error', (err as Error).message);
            }
          },
        },
      ]);
    },
    [endLive, refetch],
  );

  const renderItem = useCallback(
    ({ item }: { item: LiveSession }) => (
      <View style={styles.sessionCard}>
        <View style={styles.liveBanner}>
          <View style={styles.liveTag}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
          <View style={styles.viewerCount}>
            <MaterialIcons name="visibility" size={14} color={colors.white} />
            <Text style={styles.viewerText}>{item.viewerCount}</Text>
          </View>
        </View>
        <View style={styles.sessionBody}>
          <View style={styles.sessionHostRow}>
            {item.host.avatar ? (
              <Image source={{ uri: item.host.avatar }} style={styles.hostAvatar} />
            ) : (
              <View style={styles.hostAvatarPlaceholder}>
                <MaterialIcons name="person" size={22} color={colors.white} />
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.hostName}>{item.host.name}</Text>
              <Text style={styles.podName}>{item.pod.title}</Text>
            </View>
          </View>
          <Text style={styles.sessionTitle}>{item.title}</Text>
          {item.description ? (
            <Text style={styles.sessionDesc} numberOfLines={2}>
              {item.description}
            </Text>
          ) : null}
          {item.isViewing ? (
            <TouchableOpacity style={styles.leaveBtn} onPress={() => handleLeave(item.id)}>
              <Text style={styles.leaveBtnText}>Leave Session</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.joinBtn} onPress={() => handleJoin(item.id)}>
              <Text style={styles.joinBtnText}>Join Live</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.startedAt}>Started {formatElapsed(item.startedAt)}</Text>
        </View>
      </View>
    ),
    [handleJoin, handleLeave],
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Live Sessions</Text>
      </View>

      {loading && sessions.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.content}
          ListEmptyComponent={
            <View style={styles.centered}>
              <MaterialIcons name="videocam-off" size={48} color={colors.textTertiary} />
              <Text style={styles.emptyText}>No live sessions</Text>
              <Text style={styles.emptySubtext}>Start a live session from your pod!</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => setShowModal(true)} activeOpacity={0.8}>
        <MaterialIcons name="videocam" size={28} color={colors.white} />
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
                <Text style={styles.modalTitle}>Go Live</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Pod ID *"
                  placeholderTextColor={colors.textTertiary}
                  value={podId}
                  onChangeText={setPodId}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Session Title *"
                  placeholderTextColor={colors.textTertiary}
                  value={title}
                  onChangeText={setTitle}
                  maxLength={100}
                />
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="What's happening?"
                  placeholderTextColor={colors.textTertiary}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  maxLength={500}
                />
                <TouchableOpacity
                  style={[
                    styles.submitBtn,
                    (starting || !title.trim() || !podId.trim()) && styles.submitBtnDisabled,
                  ]}
                  onPress={handleStart}
                  disabled={starting || !title.trim() || !podId.trim()}
                >
                  {starting ? (
                    <ActivityIndicator size="small" color={colors.white} />
                  ) : (
                    <>
                      <MaterialIcons name="videocam" size={20} color={colors.white} />
                      <Text style={styles.submitBtnText}>Go Live</Text>
                    </>
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

export default GoLiveScreen;
