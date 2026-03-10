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
import { Formik, FormikHelpers } from 'formik';
import * as Yup from 'yup';

import { GET_ACTIVE_LIVE_SESSIONS } from '../../graphql/queries';
import {
  START_LIVE_SESSION,
  END_LIVE_SESSION,
  JOIN_LIVE_SESSION,
  LEAVE_LIVE_SESSION,
} from '../../graphql/mutations';
import type { GoLiveScreenProps, LiveSession, GoLiveFormValues } from './GoLive.types';
import { createStyles } from './GoLive.styles';
import { useThemedStyles, useAppColors } from '../../hooks/useThemedStyles';

const goLiveSchema = Yup.object().shape({
  podId: Yup.string().required('Pod ID is required'),
  title: Yup.string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be under 100 characters')
    .required('Session title is required'),
  description: Yup.string().max(500, 'Description must be under 500 characters'),
});

const formatElapsed = (startedAt: string): string => {
  const diff = Date.now() - Number(startedAt);
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ${mins % 60}m ago`;
};

const GoLiveScreen: React.FC<GoLiveScreenProps> = ({
  onBack,
  podId: initialPodId,
  podTitle: _initialPodTitle,
}) => {
  const styles = useThemedStyles(createStyles);
  const colors = useAppColors();
  const [showModal, setShowModal] = useState(!!initialPodId);

  const goLiveInitialValues: GoLiveFormValues = {
    podId: initialPodId ?? '',
    title: '',
    description: '',
  };

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

  const handleFormSubmit = useCallback(
    async (values: GoLiveFormValues, helpers: FormikHelpers<GoLiveFormValues>) => {
      try {
        await startLive({
          variables: {
            input: {
              podId: values.podId.trim(),
              title: values.title.trim(),
              description: values.description.trim() || undefined,
            },
          },
        });
        setShowModal(false);
        helpers.resetForm();
        refetch();
      } catch (err) {
        Alert.alert('Error', (err as Error).message);
      }
    },
    [startLive, refetch],
  );

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

  const _handleEnd = useCallback(
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
          <KeyboardAvoidingView
            behavior={
              Platform.OS === 'web' ? undefined : Platform.OS === 'ios' ? 'padding' : 'height'
            }
          >
            <TouchableOpacity activeOpacity={1} onPress={() => {}}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Go Live</Text>
                <Formik
                  initialValues={goLiveInitialValues}
                  validationSchema={goLiveSchema}
                  onSubmit={handleFormSubmit}
                >
                  {({
                    handleChange,
                    handleBlur,
                    handleSubmit: formSubmit,
                    values,
                    errors,
                    touched,
                    isValid,
                    dirty,
                  }) => (
                    <>
                      {!initialPodId && (
                        <>
                          <TextInput
                            style={[
                              styles.input,
                              touched.podId && errors.podId ? styles.inputError : undefined,
                            ]}
                            placeholder="Pod ID *"
                            placeholderTextColor={colors.textTertiary}
                            value={values.podId}
                            onChangeText={handleChange('podId')}
                            onBlur={handleBlur('podId')}
                          />
                          {touched.podId && errors.podId ? (
                            <Text style={styles.errorText}>{errors.podId}</Text>
                          ) : null}
                        </>
                      )}
                      <TextInput
                        style={[
                          styles.input,
                          touched.title && errors.title ? styles.inputError : undefined,
                        ]}
                        placeholder="Session Title *"
                        placeholderTextColor={colors.textTertiary}
                        value={values.title}
                        onChangeText={handleChange('title')}
                        onBlur={handleBlur('title')}
                        maxLength={100}
                      />
                      {touched.title && errors.title ? (
                        <Text style={styles.errorText}>{errors.title}</Text>
                      ) : null}

                      <TextInput
                        style={[
                          styles.input,
                          styles.textArea,
                          touched.description && errors.description ? styles.inputError : undefined,
                        ]}
                        placeholder="What's happening?"
                        placeholderTextColor={colors.textTertiary}
                        value={values.description}
                        onChangeText={handleChange('description')}
                        onBlur={handleBlur('description')}
                        multiline
                        maxLength={500}
                      />
                      {touched.description && errors.description ? (
                        <Text style={styles.errorText}>{errors.description}</Text>
                      ) : null}

                      <TouchableOpacity
                        style={[
                          styles.submitBtn,
                          (starting || !isValid || (!dirty && !initialPodId)) &&
                            styles.submitBtnDisabled,
                        ]}
                        onPress={() => formSubmit()}
                        disabled={starting || !isValid || (!dirty && !initialPodId)}
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
                    </>
                  )}
                </Formik>
              </View>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

export default GoLiveScreen;
