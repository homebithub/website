import { useEffect, useRef, useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { profileService as grpcProfileService } from '~/services/grpc/authServices';
import { PHOTO_ACCEPT_ATTRIBUTE, PHOTO_MIME_TYPES, MAX_PHOTO_SIZE, uploadDocuments } from '~/utils/documentUploads';
import { notifyProfileAvatarUpdated } from '~/utils/profileAvatar';

type ProfileAvatarControlProps = {
  profileType: 'househelp' | 'household';
  profileId?: string;
  userId?: string;
  currentUrl?: string;
  name?: string;
  onUpdated?: (url: string) => void;
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return (parts.slice(0, 2).map((part) => part[0]).join('') || 'HB').toUpperCase();
}

function uploadUrl(response: any): string {
  const data = response?.data || response?.documents || response;
  const document = Array.isArray(data) ? data[0] : data;
  return document?.public_url || document?.signed_url || document?.url || '';
}

export function ProfileAvatarControl({
  profileType,
  profileId,
  userId,
  currentUrl = '',
  name = '',
  onUpdated,
}: ProfileAvatarControlProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(currentUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setUrl(currentUrl);
  }, [currentUrl]);

  const choosePhoto = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    if (!PHOTO_MIME_TYPES.includes(file.type)) {
      setError('Use a JPG, PNG, WEBP or GIF image.');
      return;
    }
    if (file.size > MAX_PHOTO_SIZE) {
      setError('Profile pictures must be under 5MB.');
      return;
    }

    setUploading(true);
    try {
      // Keep this upload in the existing public-photo bucket. The account control
      // owns the avatar URL; the gallery no longer exposes a “set as avatar” action.
      const response = await uploadDocuments({
        files: [file],
        documentType: 'profile_photo',
        profileId,
        description: 'Profile picture',
      });
      const nextUrl = uploadUrl(response);
      if (!nextUrl) throw new Error('The upload completed, but no image was returned.');

      if (profileType === 'household') {
        await grpcProfileService.updateHouseholdProfile('', 'household', { avatar_url: nextUrl });
      } else {
        await grpcProfileService.updateHousehelpFields('', 'househelp', { avatar_url: nextUrl });
      }

      setUrl(nextUrl);
      notifyProfileAvatarUpdated(userId, nextUrl);
      onUpdated?.(nextUrl);
    } catch (uploadError: any) {
      setError(uploadError?.message || 'We couldn’t update your profile picture. Please try again.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="flex shrink-0 flex-col items-center gap-1.5">
      <div className="relative">
        {url ? (
          <img
            src={url}
            alt={`${name || 'Profile'} picture`}
            className="h-12 w-12 rounded-2xl object-cover ring-2 ring-purple-300/70 dark:ring-purple-500/50"
            onError={() => setUrl('')}
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 text-sm font-bold text-white ring-2 ring-purple-300/70 dark:ring-purple-500/50">
            {initials(name)}
          </div>
        )}
        {uploading ? (
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-slate-950/60">
            <Loader2 className="h-4 w-4 animate-spin text-white" />
          </div>
        ) : null}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={PHOTO_ACCEPT_ATTRIBUTE}
        className="hidden"
        onChange={(event) => void choosePhoto(event.target.files?.[0])}
        disabled={uploading}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="inline-flex items-center gap-1 rounded-lg px-1.5 py-1 text-[10px] font-semibold text-purple-700 transition hover:bg-purple-50 hover:text-pink-600 disabled:cursor-not-allowed disabled:opacity-60 dark:text-purple-300 dark:hover:bg-purple-950/40 dark:hover:text-pink-300"
      >
        <Camera className="h-3 w-3" />
        {uploading ? 'Uploading…' : url ? 'Change photo' : 'Add photo'}
      </button>
      {error ? <p className="max-w-24 text-center text-[10px] font-medium text-red-600 dark:text-red-300">{error}</p> : null}
    </div>
  );
}

export default ProfileAvatarControl;
