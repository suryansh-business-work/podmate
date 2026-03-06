import { useState, useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../graphql/client';

/** Derive the upload endpoint from the GraphQL URL */
const UPLOAD_URL = API_URL.replace('/graphql', '/api/upload');

interface UploadedFile {
  uri: string;
  url: string;
  name: string;
  type: 'image' | 'video';
}

interface UseImageKitUploadReturn {
  pickAndUploadImage: (folder?: string) => Promise<UploadedFile | null>;
  pickAndUploadVideo: (folder?: string) => Promise<UploadedFile | null>;
  uploading: boolean;
  progress: number;
}

export function useImageKitUpload(): UseImageKitUploadReturn {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to your photo library.');
        return false;
      }
    }
    return true;
  }, []);

  /**
   * Upload a file to the server's /api/upload endpoint which proxies to ImageKit.
   * This avoids client-side signature issues with ImageKit's upload API.
   */
  const uploadToServer = useCallback(
    async (localUri: string, fileName: string, folder: string): Promise<string | null> => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          throw new Error('Please log in to upload files');
        }

        const formData = new FormData();

        const uriParts = localUri.split('.');
        const ext = uriParts[uriParts.length - 1] ?? 'jpg';
        const mimeMap: Record<string, string> = {
          jpg: 'image/jpeg',
          jpeg: 'image/jpeg',
          png: 'image/png',
          gif: 'image/gif',
          mp4: 'video/mp4',
          mov: 'video/quicktime',
        };
        const mimeType = mimeMap[ext.toLowerCase()] ?? 'application/octet-stream';

        if (Platform.OS === 'web') {
          // On web the URI is a blob: or data: URL — fetch it into a real File object
          // so that multipart/form-data is constructed correctly in the browser.
          const blobResponse = await fetch(localUri);
          const blob = await blobResponse.blob();
          const fileObj = new File([blob], fileName, { type: mimeType });
          formData.append('file', fileObj);
        } else {
          // React Native: the { uri, name, type } object is intercepted by the
          // native FormData polyfill and serialised as a proper multipart part.
          formData.append('file', {
            uri: localUri,
            name: fileName,
            type: mimeType,
          } as unknown as Blob);
        }

        formData.append('fileName', fileName);
        formData.append('folder', folder);

        setProgress(0.3);

        const response = await fetch(UPLOAD_URL, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        setProgress(0.8);

        if (!response.ok) {
          const errBody = (await response.json().catch(() => ({ error: 'Upload failed' }))) as {
            error?: string;
          };
          throw new Error(errBody.error ?? `Upload failed: ${response.status}`);
        }

        const result = (await response.json()) as { url: string };
        setProgress(1);
        return result.url;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Upload failed';
        console.error('Upload error Suryansh:', err);
        Alert.alert('Upload Error', message);
        return null;
      }
    },
    [],
  );

  const pickAndUploadImage = useCallback(
    async (folder = '/pods'): Promise<UploadedFile | null> => {
      const hasPermission = await requestPermissions();
      if (!hasPermission) return null;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (result.canceled || !result.assets[0]) return null;

      const asset = result.assets[0];
      setUploading(true);

      try {
        const fileName = `pod-${Date.now()}.${asset.uri.split('.').pop() ?? 'jpg'}`;
        const url = await uploadToServer(asset.uri, fileName, folder);
        if (!url) return null;

        return {
          uri: asset.uri,
          url,
          name: fileName,
          type: 'image',
        };
      } finally {
        setUploading(false);
        setProgress(0);
      }
    },
    [requestPermissions, uploadToServer],
  );

  const pickAndUploadVideo = useCallback(
    async (folder = '/pods'): Promise<UploadedFile | null> => {
      const hasPermission = await requestPermissions();
      if (!hasPermission) return null;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['videos'],
        allowsEditing: true,
        videoMaxDuration: 60,
        quality: 0.7,
      });

      if (result.canceled || !result.assets[0]) return null;

      const asset = result.assets[0];
      setUploading(true);

      try {
        const fileName = `pod-video-${Date.now()}.${asset.uri.split('.').pop() ?? 'mp4'}`;
        const url = await uploadToServer(asset.uri, fileName, folder);
        if (!url) return null;

        return {
          uri: asset.uri,
          url,
          name: fileName,
          type: 'video',
        };
      } finally {
        setUploading(false);
        setProgress(0);
      }
    },
    [requestPermissions, uploadToServer],
  );

  return { pickAndUploadImage, pickAndUploadVideo, uploading, progress };
}
