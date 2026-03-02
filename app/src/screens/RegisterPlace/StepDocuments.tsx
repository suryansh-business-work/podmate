import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../theme';
import { GradientButton } from '../../components/GradientButton';
import MediaUploader, { MediaItem } from '../../components/MediaUploader';
import styles from './RegisterPlace.styles';

interface StepDocumentsProps {
  businessLicenseUrl: string;
  permitsUrl: string;
  venueMedia: MediaItem[];
  uploading: boolean;
  progress: number;
  onUploadLicense: () => void;
  onUploadPermits: () => void;
  onMediaChange: (items: MediaItem[]) => void;
  onContinue: () => void;
}

const StepDocuments: React.FC<StepDocumentsProps> = ({
  businessLicenseUrl, permitsUrl, venueMedia, uploading, progress,
  onUploadLicense, onUploadPermits, onMediaChange, onContinue,
}) => (
  <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
    <Text style={styles.sectionTitle}>Upload Documents</Text>
    <Text style={styles.helperText}>
      Upload your business license, food/liquor permits, and venue photos. This helps us verify your venue faster.
    </Text>
    <TouchableOpacity style={styles.uploadBox} activeOpacity={0.7} disabled={uploading} onPress={onUploadLicense}>
      {businessLicenseUrl ? (
        <Image source={{ uri: businessLicenseUrl }} style={styles.uploadPreviewImg} />
      ) : (
        <>
          <MaterialIcons name="cloud-upload" size={36} color={colors.primary} />
          <Text style={styles.uploadTitle}>Business License</Text>
          <Text style={styles.uploadSubtext}>Tap to upload (JPG, PNG)</Text>
        </>
      )}
    </TouchableOpacity>
    <TouchableOpacity style={styles.uploadBox} activeOpacity={0.7} disabled={uploading} onPress={onUploadPermits}>
      {permitsUrl ? (
        <Image source={{ uri: permitsUrl }} style={styles.uploadPreviewImg} />
      ) : (
        <>
          <MaterialIcons name="verified-user" size={36} color={colors.primary} />
          <Text style={styles.uploadTitle}>Permits &amp; Licenses</Text>
          <Text style={styles.uploadSubtext}>Food / Liquor / Music permits</Text>
        </>
      )}
    </TouchableOpacity>

    <Text style={styles.sectionTitle}>Venue Photos &amp; Videos</Text>
    <MediaUploader mediaItems={venueMedia} onMediaChange={onMediaChange} folder="/venues/photos" maxItems={10} />

    {uploading && (
      <View style={styles.uploadingRow}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={styles.uploadingText}>Uploading... {Math.round(progress * 100)}%</Text>
      </View>
    )}
    <View style={styles.btnContainer}>
      <GradientButton title="Continue" onPress={onContinue} disabled={uploading} />
    </View>
  </ScrollView>
);

export default StepDocuments;
