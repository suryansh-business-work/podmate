import { useState, useCallback } from 'react';
import config from '../config';

interface UploadResult {
  url: string;
  fileId: string;
  name: string;
  filePath: string;
  fileType: string;
}

interface UseImageKitUploadResult {
  uploadFile: (file: File, folder?: string) => Promise<UploadResult | null>;
  uploading: boolean;
  progress: number;
  error: string;
}

/**
 * Admin panel hook for uploading files to ImageKit via the server's /api/upload endpoint.
 */
export function useImageKitUpload(): UseImageKitUploadResult {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const uploadFile = useCallback(
    async (file: File, folder = '/admin-uploads'): Promise<UploadResult | null> => {
      setUploading(true);
      setProgress(0);
      setError('');

      try {
        const token = localStorage.getItem('admin-token');
        if (!token) {
          throw new Error('Not authenticated');
        }

        const baseUrl = config.apiUrl.replace('/graphql', '');
        const formData = new FormData();
        formData.append('file', file);
        formData.append('fileName', file.name);
        formData.append('folder', folder);

        const xhr = new XMLHttpRequest();

        const result = await new Promise<UploadResult>((resolve, reject) => {
          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
              setProgress(event.loaded / event.total);
            }
          });

          xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              const data = JSON.parse(xhr.responseText) as UploadResult;
              resolve(data);
            } else {
              const errData = JSON.parse(xhr.responseText) as { error?: string };
              reject(new Error(errData.error || `Upload failed (${xhr.status})`));
            }
          });

          xhr.addEventListener('error', () => {
            reject(new Error('Network error during upload'));
          });

          xhr.open('POST', `${baseUrl}/api/upload`);
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
          xhr.send(formData);
        });

        setProgress(1);
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Upload failed';
        setError(message);
        return null;
      } finally {
        setUploading(false);
      }
    },
    [],
  );

  return { uploadFile, uploading, progress, error };
}
