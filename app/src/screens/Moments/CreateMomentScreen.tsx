import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useMutation } from '@apollo/client';

import { CREATE_MOMENT } from '../../graphql/mutations';
import { GET_MOMENTS } from '../../graphql/queries';
import { useImageKitUpload } from '../../hooks/useImageKitUpload';
import { useThemedStyles, useAppColors, ThemeUtils } from '../../hooks/useThemedStyles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface MediaItem {
  uri: string;
  url: string;
  type: 'image' | 'video';
}

interface CreateMomentScreenProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CreateMomentScreen: React.FC<CreateMomentScreenProps> = ({ onClose, onSuccess }) => {
  const styles = useThemedStyles(createStyles);
  const colors = useAppColors();
  const [caption, setCaption] = useState('');
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const { pickAndUploadImage, pickAndUploadVideo, uploading } = useImageKitUpload();

  const [createMoment, { loading }] = useMutation(CREATE_MOMENT, {
    refetchQueries: [{ query: GET_MOMENTS }],
  });

  const handlePickImage = useCallback(async () => {
    const result = await pickAndUploadImage('moments');
    if (result) {
      setMediaItems((prev) => [...prev, { uri: result.uri, url: result.url, type: 'image' }]);
    }
  }, [pickAndUploadImage]);

  const handlePickVideo = useCallback(async () => {
    const result = await pickAndUploadVideo('moments');
    if (result) {
      setMediaItems((prev) => [...prev, { uri: result.uri, url: result.url, type: 'video' }]);
    }
  }, [pickAndUploadVideo]);

  const handleRemoveMedia = useCallback((index: number) => {
    setMediaItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!caption.trim()) {
      Alert.alert('Required', 'Please add a caption');
      return;
    }
    if (mediaItems.length === 0) {
      Alert.alert('Required', 'Please add at least one photo or video');
      return;
    }
    await createMoment({
      variables: {
        input: {
          caption: caption.trim(),
          mediaUrls: mediaItems.map((m) => m.url),
        },
      },
    });
    onSuccess();
  }, [caption, mediaItems, createMoment, onSuccess]);

  const isSubmitting = loading || uploading;

  const onScrollEnd = useCallback((e: { nativeEvent: { contentOffset: { x: number } } }) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / (SCREEN_WIDTH - 32));
    setActiveSlide(idx);
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backBtn}>
          <MaterialIcons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>New Moment</Text>
        <TouchableOpacity
          style={[styles.postBtn, isSubmitting && styles.postBtnDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Text style={styles.postBtnText}>Share</Text>
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
          {/* Media Preview Slider */}
          {mediaItems.length > 0 ? (
            <View style={styles.mediaSliderContainer}>
              <FlatList
                data={mediaItems}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={onScrollEnd}
                keyExtractor={(_, i) => `media-${i}`}
                renderItem={({ item, index }) => (
                  <View style={styles.mediaSlideItem}>
                    <Image
                      source={{ uri: item.uri }}
                      style={styles.previewImage}
                      resizeMode="cover"
                    />
                    {item.type === 'video' && (
                      <View style={styles.videoIndicator}>
                        <MaterialIcons
                          name="play-circle-filled"
                          size={40}
                          color="rgba(255,255,255,0.85)"
                        />
                      </View>
                    )}
                    <TouchableOpacity
                      style={styles.removeMediaBtn}
                      onPress={() => handleRemoveMedia(index)}
                    >
                      <MaterialIcons name="close" size={18} color={colors.white} />
                    </TouchableOpacity>
                  </View>
                )}
              />
              {mediaItems.length > 1 && (
                <View style={styles.dotsContainer}>
                  {mediaItems.map((_, i) => (
                    <View
                      key={i}
                      style={[
                        styles.dot,
                        {
                          backgroundColor: i === activeSlide ? colors.primary : colors.textTertiary,
                        },
                      ]}
                    />
                  ))}
                </View>
              )}
            </View>
          ) : (
            <TouchableOpacity
              style={styles.imagePicker}
              onPress={handlePickImage}
              disabled={uploading}
            >
              <View style={styles.imagePickerEmpty}>
                {uploading ? (
                  <ActivityIndicator size="large" color={colors.primary} />
                ) : (
                  <>
                    <MaterialIcons name="add-a-photo" size={40} color={colors.textTertiary} />
                    <Text style={styles.imagePickerText}>Tap to add a photo</Text>
                  </>
                )}
              </View>
            </TouchableOpacity>
          )}

          {/* Add more media buttons */}
          <View style={styles.addMediaRow}>
            <TouchableOpacity
              style={styles.addMediaBtn}
              onPress={handlePickImage}
              disabled={uploading}
            >
              <MaterialIcons name="add-photo-alternate" size={22} color={colors.primary} />
              <Text style={styles.addMediaText}>Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addMediaBtn}
              onPress={handlePickVideo}
              disabled={uploading}
            >
              <MaterialIcons name="videocam" size={22} color={colors.primary} />
              <Text style={styles.addMediaText}>Video</Text>
            </TouchableOpacity>
            {uploading && (
              <ActivityIndicator size="small" color={colors.primary} style={{ marginLeft: 12 }} />
            )}
          </View>

          {/* Caption */}
          <TextInput
            style={styles.captionInput}
            placeholder="Write a caption..."
            placeholderTextColor={colors.textTertiary}
            value={caption}
            onChangeText={setCaption}
            multiline
            maxLength={500}
          />
          <Text style={styles.charCount}>{caption.length}/500</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const createStyles = ({ colors }: ThemeUtils) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backBtn: {
      padding: 4,
    },
    title: {
      flex: 1,
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginLeft: 12,
    },
    postBtn: {
      backgroundColor: colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 8,
      borderRadius: 20,
    },
    postBtnDisabled: {
      opacity: 0.5,
    },
    postBtnText: {
      color: colors.white,
      fontSize: 14,
      fontWeight: '600',
    },
    body: {
      flex: 1,
      padding: 16,
    },
    imagePicker: {
      borderRadius: 16,
      overflow: 'hidden',
      marginBottom: 16,
    },
    imagePickerEmpty: {
      height: 280,
      backgroundColor: colors.surfaceVariant,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.border,
      borderStyle: 'dashed',
    },
    imagePickerText: {
      fontSize: 14,
      color: colors.textTertiary,
      marginTop: 8,
    },
    mediaSliderContainer: {
      marginBottom: 16,
    },
    mediaSlideItem: {
      width: SCREEN_WIDTH - 32,
      height: 300,
      borderRadius: 16,
      overflow: 'hidden',
    },
    previewImage: {
      width: '100%',
      height: 300,
      borderRadius: 16,
    },
    videoIndicator: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.15)',
    },
    removeMediaBtn: {
      position: 'absolute',
      top: 8,
      right: 8,
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    dotsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 6,
      marginTop: 8,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    addMediaRow: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 16,
    },
    addMediaBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    addMediaText: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.text,
    },
    captionInput: {
      fontSize: 16,
      color: colors.text,
      lineHeight: 22,
      minHeight: 80,
      textAlignVertical: 'top',
    },
    charCount: {
      fontSize: 12,
      color: colors.textTertiary,
      textAlign: 'right',
      marginTop: 4,
    },
  });

export default CreateMomentScreen;
