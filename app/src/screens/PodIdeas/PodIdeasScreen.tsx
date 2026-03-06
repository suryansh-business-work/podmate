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

import { GET_POD_IDEAS } from '../../graphql/queries';
import { SUBMIT_POD_IDEA, UPVOTE_POD_IDEA, REMOVE_UPVOTE } from '../../graphql/mutations';
import type { PodIdeasScreenProps, PodIdea, PodIdeaFormValues } from './PodIdeas.types';
import { createStyles } from './PodIdeas.styles';
import { useThemedStyles, useAppColors } from '../../hooks/useThemedStyles';

const podIdeaSchema = Yup.object().shape({
  title: Yup.string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be under 100 characters')
    .required('Title is required'),
  description: Yup.string()
    .min(10, 'Describe your idea in at least 10 characters')
    .max(2000, 'Description must be under 2000 characters')
    .required('Description is required'),
  category: Yup.string().max(50, 'Category must be under 50 characters'),
  location: Yup.string().max(100, 'Location must be under 100 characters'),
  budget: Yup.string().test('valid-number', 'Must be a valid amount', (val) => {
    if (!val) return true;
    const num = Number(val);
    return !isNaN(num) && num >= 0;
  }),
});

const podIdeaInitialValues: PodIdeaFormValues = {
  title: '',
  description: '',
  category: '',
  location: '',
  budget: '',
};

const StatusBadge: React.FC<{ status: PodIdea['status'] }> = ({ status }) => {
  const styles = useThemedStyles(createStyles);
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

  const handleFormSubmit = useCallback(
    async (values: PodIdeaFormValues, helpers: FormikHelpers<PodIdeaFormValues>) => {
      try {
        await submitPodIdea({
          variables: {
            input: {
              title: values.title.trim(),
              description: values.description.trim(),
              category: values.category.trim() || undefined,
              location: values.location.trim() || undefined,
              estimatedBudget: values.budget ? parseFloat(values.budget) : undefined,
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
    [submitPodIdea, refetch],
  );

  const handleUpvote = useCallback(
    async (idea: PodIdea) => {
      try {
        if (idea.hasUpvoted) {
          await removeUpvote({ variables: { id: idea.id } });
        } else {
          await upvotePodIdea({ variables: { id: idea.id } });
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
            {(() => {
              const ts = Number(item.createdAt);
              const d = !isNaN(ts) && ts > 0 ? new Date(ts) : new Date(item.createdAt);
              return isNaN(d.getTime()) ? '' : d.toLocaleDateString();
            })()}
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
          <KeyboardAvoidingView
            behavior={
              Platform.OS === 'web' ? undefined : Platform.OS === 'ios' ? 'padding' : 'height'
            }
          >
            <TouchableOpacity activeOpacity={1} onPress={() => {}}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Suggest a Pod Idea</Text>
                <Formik
                  initialValues={podIdeaInitialValues}
                  validationSchema={podIdeaSchema}
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
                      <TextInput
                        style={[
                          styles.input,
                          touched.title && errors.title ? styles.inputError : undefined,
                        ]}
                        placeholder="Title *"
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
                          touched.description && errors.description
                            ? styles.inputError
                            : undefined,
                        ]}
                        placeholder="Describe your idea… *"
                        placeholderTextColor={colors.textTertiary}
                        value={values.description}
                        onChangeText={handleChange('description')}
                        onBlur={handleBlur('description')}
                        multiline
                        maxLength={2000}
                      />
                      {touched.description && errors.description ? (
                        <Text style={styles.errorText}>{errors.description}</Text>
                      ) : null}

                      <View style={styles.rowInputs}>
                        <TextInput
                          style={[styles.input, styles.halfInput]}
                          placeholder="Category"
                          placeholderTextColor={colors.textTertiary}
                          value={values.category}
                          onChangeText={handleChange('category')}
                          onBlur={handleBlur('category')}
                        />
                        <TextInput
                          style={[styles.input, styles.halfInput]}
                          placeholder="Location"
                          placeholderTextColor={colors.textTertiary}
                          value={values.location}
                          onChangeText={handleChange('location')}
                          onBlur={handleBlur('location')}
                        />
                      </View>
                      <TextInput
                        style={[
                          styles.input,
                          touched.budget && errors.budget ? styles.inputError : undefined,
                        ]}
                        placeholder="Estimated Budget ($)"
                        placeholderTextColor={colors.textTertiary}
                        value={values.budget}
                        onChangeText={handleChange('budget')}
                        onBlur={handleBlur('budget')}
                        keyboardType="numeric"
                      />
                      {touched.budget && errors.budget ? (
                        <Text style={styles.errorText}>{errors.budget}</Text>
                      ) : null}

                      <TouchableOpacity
                        style={[
                          styles.submitBtn,
                          (submitting || !isValid || !dirty) && styles.submitBtnDisabled,
                        ]}
                        onPress={() => formSubmit()}
                        disabled={submitting || !isValid || !dirty}
                      >
                        {submitting ? (
                          <ActivityIndicator size="small" color={colors.white} />
                        ) : (
                          <Text style={styles.submitBtnText}>Submit Idea</Text>
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

export default PodIdeasScreen;
