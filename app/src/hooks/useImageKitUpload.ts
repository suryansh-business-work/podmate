import { useState, useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useMutation } from '@apollo/client';
import { GET_IMAGEKIT_AUTH } from '../graphql/mutations';

const IMAGEKIT_URL_ENDPOINT =
  process.env.EXPO_PUBLIC_IMAGEKIT_URL ?? 'https://ik.imagekit.io/your_id';

interface ImageKitAuthResponse {
  getImageKitAuth: {
    token: string;
    expire: number;
    signature: string;
  };
}

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
  const [getAuth] = useMutation<ImageKitAuthResponse>(GET_IMAGEKIT_AUTH);

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

  const uploadToImageKit = useCallback(
    async (
      localUri: string,
      fileName: string,
      folder: string,
    ): Promise<string | null> => {
      try {
        const { data } = await getAuth();
        if (!data?.getImageKitAuth) {
          throw new Error('Failed to get upload credentials');
        }

        const { token, expire, signature } = data.getImageKitAuth;

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

        formData.append('file', {
          uri: localUri,
          name: fileName,
          type: mimeType,
        } as unknown as Blob);
        formData.append('fileName', fileName);
        formData.append('folder', folder);
        formData.append('token', token);
        formData.append('expire', String(expire));
        formData.append('signature', signature);
        formData.append(
          'publicKey',
          process.env.EXPO_PUBLIC_IMAGEKIT_PUBLIC_KEY ?? '',
        );

        setProgress(0.3);

        const response = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
          method: 'POST',
          body: formData,
        });

        setProgress(0.8);

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Upload failed: ${errText}`);
        }

        const result = (await response.json()) as { url: string };
        setProgress(1);
        return result.url;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Upload failed';
        Alert.alert('Upload Error', message);
        return null;
      }
    },
    [getAuth],
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
        const url = await uploadToImageKit(asset.uri, fileName, folder);
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
    [requestPermissions, uploadToImageKit],
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
        const url = await uploadToImageKit(asset.uri, fileName, folder);
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
    [requestPermissions, uploadToImageKit],
  );

  return { pickAndUploadImage, pickAndUploadVideo, uploading, progress };
}
