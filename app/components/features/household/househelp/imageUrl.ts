import { API_BASE_URL } from '~/config/api';

function normalizeImagePath(path: string): string {
  return path.replace(/^src\//, '').replace(/^\/+/, '');
}

export function resolveHousehelpImageUrl(image: any): string {
  if (!image) return '';

  if (typeof image === 'string') {
    if (/^https?:\/\//.test(image)) return image;
    return `${API_BASE_URL}/images/${normalizeImagePath(image)}`;
  }

  if (image.url) {
    return image.url;
  }

  if (image.path) {
    return `${API_BASE_URL}/images/${normalizeImagePath(String(image.path))}`;
  }

  return '';
}
