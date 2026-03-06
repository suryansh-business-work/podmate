import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation } from '@apollo/client';
import { MaterialIcons } from '@expo/vector-icons';
import { Formik, FormikHelpers } from 'formik';
import * as Yup from 'yup';

import { GET_ME } from '../../graphql/queries';
import { UPDATE_PROFILE } from '../../graphql/mutations';
import { useImageKitUpload } from '../../hooks/useImageKitUpload';
import { EditProfileScreenProps, EditProfileFormValues } from './EditProfile.types';
import { createStyles } from './EditProfile.styles';
import { useThemedStyles, useAppColors } from '../../hooks/useThemedStyles';

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be at most 50 characters')
    .required('Name is required'),
  email: Yup.string().email('Enter a valid email address').notRequired(),
});

const EditProfileScreen: React.FC<EditProfileScreenProps> = ({ onBack }) => {
  const styles = useThemedStyles(createStyles);
  const colors = useAppColors();
  const { data: meData, loading: meLoading } = useQuery(GET_ME, {
    fetchPolicy: 'cache-and-network',
  });
  const [updateProfile] = useMutation(UPDATE_PROFILE, {
    refetchQueries: [{ query: GET_ME }],
  });
  const { pickAndUploadImage, uploading: avatarUploading } = useImageKitUpload();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const user = meData?.me;

  const handleAvatarChange = useCallback(async () => {
    const result = await pickAndUploadImage('avatars');
    if (result) {
      setAvatarUrl(result.url);
      try {
        await updateProfile({ variables: { avatar: result.url } });
      } catch {
        Alert.alert('Error', 'Failed to update avatar. Please try again.');
      }
    }
  }, [pickAndUploadImage, updateProfile]);

  const handleSubmit = useCallback(
    async (values: EditProfileFormValues, helpers: FormikHelpers<EditProfileFormValues>) => {
      try {
        await updateProfile({
          variables: {
            name: values.name,
            email: values.email || undefined,
          },
        });
        Alert.alert('Success', 'Profile updated successfully.', [{ text: 'OK', onPress: onBack }]);
      } catch {
        Alert.alert('Error', 'Failed to update profile. Please try again.');
      } finally {
        helpers.setSubmitting(false);
      }
    },
    [updateProfile, onBack],
  );

  if (meLoading && !user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <MaterialIcons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const currentAvatar = avatarUrl || user?.avatar;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.avatarSection}>
            <TouchableOpacity
              style={styles.avatarContainer}
              onPress={handleAvatarChange}
              disabled={avatarUploading}
              activeOpacity={0.7}
            >
              {currentAvatar ? (
                <Image source={{ uri: currentAvatar }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <MaterialIcons name="person" size={48} color={colors.textTertiary} />
                </View>
              )}
              <View style={styles.cameraButton}>
                <MaterialIcons name="camera-alt" size={16} color={colors.white} />
              </View>
              {avatarUploading && (
                <View style={styles.uploadingOverlay}>
                  <ActivityIndicator size="small" color={colors.white} />
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Read-only fields */}
          {user?.username && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Username</Text>
              <Text style={styles.infoValue}>@{user.username}</Text>
            </View>
          )}
          {user?.phone && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>{user.phone}</Text>
            </View>
          )}
          {user?.dob && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>DOB</Text>
              <Text style={styles.infoValue}>
                {new Date(user.dob).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </Text>
            </View>
          )}

          <Formik<EditProfileFormValues>
            enableReinitialize
            initialValues={{
              name: user?.name || '',
              email: user?.email || '',
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit: submit,
              values,
              errors,
              touched,
              isSubmitting,
            }) => (
              <>
                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>Full Name</Text>
                  <TextInput
                    style={[
                      styles.input,
                      touched.name && errors.name ? styles.inputError : undefined,
                    ]}
                    placeholder="Enter your full name"
                    placeholderTextColor={colors.textTertiary}
                    value={values.name}
                    onChangeText={handleChange('name')}
                    onBlur={handleBlur('name')}
                    autoCapitalize="words"
                    maxLength={50}
                  />
                  {touched.name && errors.name && (
                    <Text style={styles.errorText}>{errors.name}</Text>
                  )}
                </View>

                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={[
                      styles.input,
                      touched.email && errors.email ? styles.inputError : undefined,
                    ]}
                    placeholder="Enter your email address"
                    placeholderTextColor={colors.textTertiary}
                    value={values.email}
                    onChangeText={handleChange('email')}
                    onBlur={handleBlur('email')}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  {touched.email && errors.email && (
                    <Text style={styles.errorText}>{errors.email}</Text>
                  )}
                </View>

                <TouchableOpacity
                  style={[styles.saveButton, isSubmitting && styles.saveButtonDisabled]}
                  onPress={() => submit()}
                  disabled={isSubmitting}
                  activeOpacity={0.8}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color={colors.white} />
                  ) : (
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </Formik>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default EditProfileScreen;
