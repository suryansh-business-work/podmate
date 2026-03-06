import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useImageKitUpload } from '../hooks/useImageKitUpload';
import { useThemedStyles, useAppColors, ThemeUtils } from '../hooks/useThemedStyles';

export interface MediaItem {
  url: string;
  type: 'image' | 'video';
}

interface MediaUploaderProps {
  mediaItems: MediaItem[];
  onMediaChange: (items: MediaItem[]) => void;
  folder: string;
  maxItems?: number;
}

const MediaUploader: React.FC<MediaUploaderProps> = ({
  mediaItems = [],
  onMediaChange,
  folder,
  maxItems = 10,
}) => {
  const styles = useThemedStyles(createStyles);
  const colors = useAppColors();
  const { pickAndUploadImage, pickAndUploadVideo, uploading, progress } = useImageKitUpload();
  const items = mediaItems ?? [];

  const handleAddImage = async () => {
    if (items.length >= maxItems) return;
    const result = await pickAndUploadImage(folder);
    if (result) onMediaChange([...items, { url: result.url, type: 'image' }]);
  };

  const handleAddVideo = async () => {
    if (items.length >= maxItems) return;
    const result = await pickAndUploadVideo(folder);
    if (result) onMediaChange([...items, { url: result.url, type: 'video' }]);
  };

  const handleRemove = (idx: number) => {
    onMediaChange(items.filter((_, i) => i !== idx));
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {items.map((item, idx) => (
          <View key={`media-${idx}`} style={styles.thumb}>
            <Image source={{ uri: item.url }} style={styles.thumbImg} />
            {item.type === 'video' && (
              <View style={styles.videoOverlay}>
                <MaterialIcons name="play-circle-filled" size={28} color={colors.white} />
              </View>
            )}
            <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemove(idx)}>
              <MaterialIcons name="close" size={14} color={colors.white} />
            </TouchableOpacity>
          </View>
        ))}

        {uploading && (
          <View style={[styles.thumb, styles.uploadingThumb]}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.progressText}>{Math.round(progress * 100)}%</Text>
          </View>
        )}

        {!uploading && items.length < maxItems && (
          <View style={styles.addRow}>
            <TouchableOpacity style={styles.addBtn} onPress={handleAddImage}>
              <MaterialIcons name="add-a-photo" size={22} color={colors.primary} />
              <Text style={styles.addLabel}>Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addBtn} onPress={handleAddVideo}>
              <MaterialIcons name="videocam" size={22} color={colors.secondary} />
              <Text style={styles.addLabel}>Video</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
      <Text style={styles.countText}>
        {items.length}/{maxItems} media
      </Text>
    </View>
  );
};

const createStyles = ({ colors, spacing, borderRadius }: ThemeUtils) =>
  StyleSheet.create({
    container: { marginBottom: spacing.md },
    scroll: { paddingVertical: spacing.sm, gap: spacing.sm },
    thumb: {
      width: 90,
      height: 90,
      borderRadius: borderRadius.md,
      overflow: 'hidden',
      position: 'relative',
    },
    thumbImg: { width: '100%', height: '100%', resizeMode: 'cover' },
    videoOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: colors.overlay,
      justifyContent: 'center',
      alignItems: 'center',
    },
    removeBtn: {
      position: 'absolute',
      top: 4,
      right: 4,
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: colors.overlayHeavy,
      justifyContent: 'center',
      alignItems: 'center',
    },
    uploadingThumb: {
      backgroundColor: colors.surfaceVariant,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.primary,
      borderStyle: 'dashed',
    },
    progressText: { fontSize: 11, color: colors.primary, fontWeight: '600', marginTop: 4 },
    addRow: { flexDirection: 'column', gap: spacing.sm },
    addBtn: {
      width: 80,
      height: 42,
      borderWidth: 2,
      borderStyle: 'dashed',
      borderColor: colors.border,
      borderRadius: borderRadius.sm,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
      gap: 4,
      backgroundColor: colors.surface,
    },
    addLabel: { fontSize: 11, color: colors.textSecondary, fontWeight: '500' },
    countText: { fontSize: 11, color: colors.textTertiary, marginTop: spacing.xs },
  });

export default MediaUploader;
