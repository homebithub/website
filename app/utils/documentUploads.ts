import { API_BASE_URL } from '~/config/api';
import { getAccessTokenFromCookies } from '~/utils/cookie';
import { getStoredProfileType } from '~/utils/authStorage';

type UploadDocumentsInput = {
  files: File[];
  documentType: 'profile_photo' | 'certificate';
  profileId?: string;
  description?: string;
  certificationPropertyId?: number;
  onProgress?: (progress: number) => void;
};

export const PHOTO_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const PHOTO_ACCEPT_ATTRIBUTE = PHOTO_MIME_TYPES.join(',');
export const MAX_PHOTO_SIZE = 5 * 1024 * 1024;

type PhotoSelection = {
  /** Files that passed validation and are safe to upload together. */
  files: File[];
  /** A human-readable reason the selection was refused, if it was. */
  error?: string;
};

const listNames = (files: File[]) => files.map((file) => file.name).join(', ');

/**
 * Validates a multi-file photo selection against the remaining slots.
 *
 * The picker allows several files at once, so a selection can fail in more ways
 * than a single file could: too many for the space left, or a mix of valid and
 * invalid files. Rejecting the whole selection with a specific reason is
 * clearer than silently uploading the acceptable subset, which would leave the
 * user guessing which of their photos made it.
 */
export function selectPhotosForUpload(
  fileList: FileList | null,
  currentCount: number,
  maxPhotos: number,
): PhotoSelection {
  const files = Array.from(fileList || []);
  if (files.length === 0) return { files: [] };

  const remaining = maxPhotos - currentCount;
  if (remaining <= 0) {
    return { files: [], error: `You already have the maximum of ${maxPhotos} photos.` };
  }
  if (files.length > remaining) {
    return {
      files: [],
      error: remaining === 1
        ? 'You have room for 1 more photo. Please select just one.'
        : `You have room for ${remaining} more photos. Please select ${remaining} or fewer.`,
    };
  }

  const wrongType = files.filter((file) => !PHOTO_MIME_TYPES.includes(file.type));
  if (wrongType.length > 0) {
    return {
      files: [],
      error: `Only JPG, PNG, WEBP and GIF images are allowed. Please remove: ${listNames(wrongType)}.`,
    };
  }

  const tooLarge = files.filter((file) => file.size > MAX_PHOTO_SIZE);
  if (tooLarge.length > 0) {
    return {
      files: [],
      error: `Each photo must be under 5MB. Please remove: ${listNames(tooLarge)}.`,
    };
  }

  return { files };
}

const uploadMessage = (xhr: XMLHttpRequest): string => {
  try {
    const response = JSON.parse(xhr.responseText || '{}');
    if (typeof response?.error === 'string' && response.error.trim()) {
      return response.error;
    }
    if (typeof response?.message === 'string' && response.message.trim()) {
      return response.message;
    }
    if (typeof response?.error?.message === 'string' && response.error.message.trim()) {
      return response.error.message;
    }
    if (typeof response?.details === 'string' && response.details.trim()) {
      return response.details;
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
    const profileType = getStoredProfileType();
    if (profileType) xhr.setRequestHeader('X-Profile-Type', profileType);
    xhr.send(form);
  });
}
