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
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import { GET_POD_IDEAS } from '../../graphql/queries';
import { SUBMIT_POD_IDEA, UPVOTE_POD_IDEA, REMOVE_UPVOTE } from '../../graphql/mutations';
import type { PodIdeasScreenProps, PodIdea } from './PodIdeas.types';
import { createStyles } from './PodIdeas.styles';
import { useThemedStyles, useAppColors } from '../../hooks/useThemedStyles';

const StatusBadge: React.FC<{ status: PodIdea['status'] }> = ({ status }) => {
  const styles = useThemedStyles(createStyles);
  const colors = useAppColors();
  const bgStyle =
    status === 'PENDING'
      ? styles.statusPending
      : status === 'APPROVED'
        ? styles.statusApproved
        : styles.statusRejected;
  const txtStyle =
    status === 'PENDING'
      ? styles.statusPendingText
      : status === 'APPROVED'
        ? styles.statusApprovedText
        : styles.statusRejectedText;
  return (
    <View style={[styles.ideaStatus, bgStyle]}>
      <Text style={[styles.statusText, txtStyle]}>{status}</Text>
    </View>
  );
};

const PodIdeasScreen: React.FC<PodIdeasScreenProps> = ({ onBack }) => {
  const styles = useThemedStyles(createStyles);
  const colors = useAppColors();
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState('');

  const { data, loading, refetch } = useQuery<{
    podIdeas: { items: PodIdea[]; total: number };
  }>(GET_POD_IDEAS, {
    variables: { page: 1, limit: 50 },
    fetchPolicy: 'cache-and-network',
  });

  const [submitPodIdea, { loading: submitting }] = useMutation(SUBMIT_POD_IDEA);
  const [upvotePodIdea] = useMutation(UPVOTE_POD_IDEA);
  const [removeUpvote] = useMutation(REMOVE_UPVOTE);

  const ideas = data?.podIdeas?.items ?? [];

  const handleSubmit = useCallback(async () => {
    if (!title.trim() || !description.trim()) return;
    try {
      await submitPodIdea({
        variables: {
          input: {
            title: title.trim(),
            description: description.trim(),
            category: category.trim() || undefined,
            location: location.trim() || undefined,
            estimatedBudget: budget ? parseFloat(budget) : undefined,
          },
        },
      });
      setShowModal(false);
      setTitle('');
      setDescription('');
      setCategory('');
      setLocation('');
      setBudget('');
      refetch();
    } catch (err) {
      Alert.alert('Error', (err as Error).message);
    }
  }, [title, description, category, location, budget, submitPodIdea, refetch]);

  const handleUpvote = useCallback(
    async (idea: PodIdea) => {
      try {
        if (idea.hasUpvoted) {
          await removeUpvote({ variables: { podIdeaId: idea.id } });
        } else {
          await upvotePodIdea({ variables: { podIdeaId: idea.id } });
        }
        refetch();
      } catch (err) {
        Alert.alert('Error', (err as Error).message);
      }
    },
    [upvotePodIdea, removeUpvote, refetch],
  );

  const renderItem = useCallback(
    ({ item }: { item: PodIdea }) => (
      <View style={styles.ideaCard}>
        <View style={styles.ideaHeader}>
          {item.user.avatar ? (
            <Image source={{ uri: item.user.avatar }} style={styles.ideaAvatar} />
          ) : (
            <View style={styles.ideaAvatarPlaceholder}>
              <MaterialIcons name="person" size={18} color={colors.white} />
            </View>
          )}
          <Text style={styles.ideaUserName}>{item.user.name}</Text>
          <StatusBadge status={item.status} />
        </View>

        <Text style={styles.ideaTitle}>{item.title}</Text>
        <Text style={styles.ideaDesc} numberOfLines={3}>
          {item.description}
        </Text>

        <View style={styles.metaRow}>
          {item.category ? (
            <View style={styles.metaItem}>
              <MaterialIcons name="category" size={14} color={colors.textSecondary} />
              <Text style={styles.metaText}>{item.category}</Text>
            </View>
          ) : null}
          {item.location ? (
            <View style={styles.metaItem}>
              <MaterialIcons name="location-on" size={14} color={colors.textSecondary} />
              <Text style={styles.metaText}>{item.location}</Text>
            </View>
          ) : null}
          {item.estimatedBudget > 0 ? (
            <View style={styles.metaItem}>
              <MaterialIcons name="attach-money" size={14} color={colors.textSecondary} />
              <Text style={styles.metaText}>${item.estimatedBudget}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.ideaFooter}>
          <TouchableOpacity
            style={[styles.upvoteBtn, item.hasUpvoted && styles.upvoteBtnActive]}
            onPress={() => handleUpvote(item)}
          >
            <MaterialIcons
              name={item.hasUpvoted ? 'thumb-up' : 'thumb-up-off-alt'}
              size={18}
              color={item.hasUpvoted ? colors.primary : colors.textSecondary}
            />
            <Text style={[styles.upvoteText, item.hasUpvoted && styles.upvoteTextActive]}>
              {item.upvoteCount}
            </Text>
          </TouchableOpacity>
          <Text style={styles.ideaDate}>
            {new Date(Number(item.createdAt)).toLocaleDateString()}
          </Text>
        </View>
      </View>
    ),
    [handleUpvote],
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pod Ideas</Text>
      </View>

      {loading && ideas.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={ideas}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.content}
          ListEmptyComponent={
            <View style={styles.centered}>
              <MaterialIcons name="emoji-objects" size={48} color={colors.textTertiary} />
              <Text style={styles.emptyText}>No ideas yet</Text>
              <Text style={styles.emptySubtext}>Suggest a pod idea for the community!</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => setShowModal(true)} activeOpacity={0.8}>
        <MaterialIcons name="add" size={28} color={colors.white} />
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
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <TouchableOpacity activeOpacity={1} onPress={() => {}}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Suggest a Pod Idea</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Title *"
                  placeholderTextColor={colors.textTertiary}
                  value={title}
                  onChangeText={setTitle}
                  maxLength={100}
                />
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Describe your idea… *"
                  placeholderTextColor={colors.textTertiary}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  maxLength={2000}
                />
                <View style={styles.rowInputs}>
                  <TextInput
                    style={[styles.input, styles.halfInput]}
                    placeholder="Category"
                    placeholderTextColor={colors.textTertiary}
                    value={category}
                    onChangeText={setCategory}
                  />
                  <TextInput
                    style={[styles.input, styles.halfInput]}
                    placeholder="Location"
                    placeholderTextColor={colors.textTertiary}
                    value={location}
                    onChangeText={setLocation}
                  />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Estimated Budget ($)"
                  placeholderTextColor={colors.textTertiary}
                  value={budget}
                  onChangeText={setBudget}
                  keyboardType="numeric"
                />
                <TouchableOpacity
                  style={[
                    styles.submitBtn,
                    (submitting || !title.trim() || !description.trim()) &&
                      styles.submitBtnDisabled,
                  ]}
                  onPress={handleSubmit}
                  disabled={submitting || !title.trim() || !description.trim()}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color={colors.white} />
                  ) : (
                    <Text style={styles.submitBtnText}>Submit Idea</Text>
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

export default PodIdeasScreen;
