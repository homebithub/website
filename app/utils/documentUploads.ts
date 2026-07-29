import { API_BASE_URL } from '~/config/api';
import { getAccessTokenFromCookies } from '~/utils/cookie';

type UploadDocumentsInput = {
  files: File[];
  documentType: 'profile_photo' | 'certificate';
  profileId?: string;
  description?: string;
  certificationPropertyId?: number;
  onProgress?: (progress: number) => void;
};

const uploadMessage = (xhr: XMLHttpRequest): string => {
  try {
    const response = JSON.parse(xhr.responseText || '{}');
    if (typeof response?.error === 'string' && response.error.trim()) {
      return response.error;
    }
    if (typeof response?.message === 'string' && response.message.trim()) {
      return response.message;
    }
  } catch {
    // The fallback below is intentionally human-readable.
  }
  if (xhr.status === 401) return 'Your session has expired. Please sign in again.';
  if (xhr.status === 413) return 'The selected files are too large.';
  return 'We couldn’t upload your files. Please try again.';
};

export function uploadDocuments({
  files,
  documentType,
  profileId,
  description,
  certificationPropertyId,
  onProgress,
}: UploadDocumentsInput): Promise<any> {
  const token = getAccessTokenFromCookies();
  if (!token) {
    return Promise.reject(new Error('Your session has expired. Please sign in again.'));
  }

  const form = new FormData();
  files.forEach((file) => form.append('files', file));
  form.append('document_type', documentType);
  form.append('is_public', documentType === 'profile_photo' ? 'true' : 'false');
  if (profileId) form.append('profile_id', profileId);
  if (description) form.append('description', description);
  if (certificationPropertyId) {
    form.append('certification_property_id', String(certificationPropertyId));
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        onProgress?.(Math.max(1, Math.round((event.loaded / event.total) * 100)));
      }
    });
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(100);
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch {
          reject(new Error('The upload completed, but its response could not be read.'));
        }
        return;
      }
      reject(new Error(uploadMessage(xhr)));
    });
    xhr.addEventListener('error', () => {
      reject(new Error('We couldn’t reach the upload service. Check your connection and try again.'));
    });
    xhr.addEventListener('abort', () => reject(new Error('The upload was cancelled.')));
    xhr.open('POST', `${API_BASE_URL}/api/v1/documents/upload`);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.send(form);
  });
}
