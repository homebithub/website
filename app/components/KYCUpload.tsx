import React, { useState, useCallback, useRef, useEffect } from 'react';
import { API_BASE_URL, API_ENDPOINTS } from '~/config/api';
import { handleApiError } from '../utils/errorMessages';
import { ErrorAlert } from '~/components/ui/ErrorAlert';
import { SuccessAlert } from '~/components/ui/SuccessAlert';
import { useProfileSetup } from '~/contexts/ProfileSetupContext';

type IDType = 'national_id' | 'alien_card' | 'passport';

interface UploadedImage {
  file: File;
  preview: string;
  url?: string;
  s3Key?: string;
}

interface KYCUploadProps {
  userType?: 'househelp' | 'household';
  onComplete?: () => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_PROFILE_PHOTOS = 5;

// Sub-step definitions
const SUB_STEPS = {
  ID_TYPE: 0,
  ID_FRONT: 1,
  ID_BACK: 2,
  SELFIE: 3,
  PROFILE_PHOTOS: 4,
} as const;

const ID_TYPE_OPTIONS: { value: IDType; label: string; description: string }[] = [
  { value: 'national_id', label: 'National ID', description: 'Kenyan National Identity Card' },
  { value: 'alien_card', label: 'Alien Card', description: 'Foreign National Identification Card' },
  { value: 'passport', label: 'Passport', description: 'Valid Travel Passport' },
];

const validateFile = (file: File): { valid: boolean; message?: string } => {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, message: `File type not allowed: ${file.name}. Only JPG, PNG, and WEBP are supported.` };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, message: `File too large: ${file.name}. Maximum size is 10MB.` };
  }
  return { valid: true };
};

const KYCUpload: React.FC<KYCUploadProps> = ({ userType = 'househelp', onComplete }) => {
  const { markDirty, markClean } = useProfileSetup();
  const [subStep, setSubStep] = useState<number>(SUB_STEPS.ID_TYPE);
  const [idType, setIdType] = useState<IDType | null>(null);
  const [idNumber, setIdNumber] = useState('');
  const [gender, setGender] = useState('');
  const [idFront, setIdFront] = useState<UploadedImage | null>(null);
  const [idBack, setIdBack] = useState<UploadedImage | null>(null);
  const [selfie, setSelfie] = useState<UploadedImage | null>(null);
  const [profilePhotos, setProfilePhotos] = useState<UploadedImage[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const requiresBackImage = idType === 'national_id' || idType === 'alien_card';

  // Total sub-steps depends on whether back image is required
  const totalSubSteps = requiresBackImage ? 5 : 4;

  // Map logical step to actual sub-step (skip ID_BACK for passport)
  const getActualSubStep = (step: number): number => {
    if (!requiresBackImage && step >= SUB_STEPS.ID_BACK) {
      return step + 1;
    }
    return step;
  };

  const getLogicalStep = (actualStep: number): number => {
    if (!requiresBackImage && actualStep > SUB_STEPS.ID_FRONT) {
      return actualStep - 1;
    }
    return actualStep;
  };

  const currentLogicalStep = getLogicalStep(subStep);

  const uploadSingleFile = async (file: File, documentType: string): Promise<{ url: string; s3Key: string }> => {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('files', file);
    formData.append('document_type', documentType);
    formData.append('is_public', 'false');
    formData.append('description', `KYC ${documentType}`);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          setUploadProgress(Math.round((e.loaded / e.total) * 100));
        }
      });
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            const docs = data.data || data.documents || [];
            const doc = Array.isArray(docs) ? docs[0] : null;
            if (doc) {
              resolve({ url: doc.public_url || doc.signed_url || doc.url, s3Key: doc.s3_key });
            } else {
              reject(new Error('No document returned from upload'));
            }
          } catch { reject(new Error('Invalid response from server')); }
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });
      xhr.addEventListener('error', () => reject(new Error('Network error during upload')));
      xhr.open('POST', `${API_BASE_URL}/api/v1/documents/upload`);
      if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formData);
    });
  };

  const handleFileSelect = useCallback((
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (img: UploadedImage) => void,
  ) => {
    setError('');
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateFile(file);
    if (!validation.valid) {
      setError(validation.message || 'Invalid file');
      return;
    }

    const preview = URL.createObjectURL(file);
    setter({ file, preview });

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const handleMultiFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    if (profilePhotos.length + fileArray.length > MAX_PROFILE_PHOTOS) {
      setError(`You can upload up to ${MAX_PROFILE_PHOTOS} profile photos. You have ${profilePhotos.length} already.`);
      return;
    }

    const newImages: UploadedImage[] = [];
    for (const file of fileArray) {
      const validation = validateFile(file);
      if (!validation.valid) {
        setError(validation.message || 'Invalid file');
        return;
      }
      newImages.push({ file, preview: URL.createObjectURL(file) });
    }

    setProfilePhotos(prev => [...prev, ...newImages]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [profilePhotos.length]);

  const removeProfilePhoto = (index: number) => {
    setProfilePhotos(prev => {
      const removed = prev[index];
      if (removed?.preview) URL.revokeObjectURL(removed.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  // Cleanup previews on unmount
  useEffect(() => {
    return () => {
      if (idFront?.preview) URL.revokeObjectURL(idFront.preview);
      if (idBack?.preview) URL.revokeObjectURL(idBack.preview);
      if (selfie?.preview) URL.revokeObjectURL(selfie.preview);
      profilePhotos.forEach(p => { if (p.preview) URL.revokeObjectURL(p.preview); });
    };
  }, []);

  const handleNextSubStep = () => {
    setError('');
    if (subStep === SUB_STEPS.ID_TYPE) {
      if (!idType) { setError('Please select an identification type'); return; }
      if (!idNumber.trim()) { setError('Please enter your ID/passport number'); return; }
      setSubStep(SUB_STEPS.ID_FRONT);
    } else if (subStep === SUB_STEPS.ID_FRONT) {
      if (!idFront) { setError('Please upload the front of your ID'); return; }
      if (requiresBackImage) {
        setSubStep(SUB_STEPS.ID_BACK);
      } else {
        setSubStep(SUB_STEPS.SELFIE);
      }
    } else if (subStep === SUB_STEPS.ID_BACK) {
      if (!idBack) { setError('Please upload the back of your ID'); return; }
      setSubStep(SUB_STEPS.SELFIE);
    } else if (subStep === SUB_STEPS.SELFIE) {
      if (!selfie) { setError('Please upload a selfie photo'); return; }
      setSubStep(SUB_STEPS.PROFILE_PHOTOS);
    }
  };

  const handlePrevSubStep = () => {
    setError('');
    if (subStep === SUB_STEPS.ID_FRONT) {
      setSubStep(SUB_STEPS.ID_TYPE);
    } else if (subStep === SUB_STEPS.ID_BACK) {
      setSubStep(SUB_STEPS.ID_FRONT);
    } else if (subStep === SUB_STEPS.SELFIE) {
      setSubStep(requiresBackImage ? SUB_STEPS.ID_BACK : SUB_STEPS.ID_FRONT);
    } else if (subStep === SUB_STEPS.PROFILE_PHOTOS) {
      setSubStep(SUB_STEPS.SELFIE);
    }
  };

  const handleSubmit = async () => {
    setError('');
    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      const token = localStorage.getItem('token');

      // Upload KYC images
      setIsUploading(true);

      const frontResult = await uploadSingleFile(idFront!.file, 'kyc_id_front');
      let backResult = { url: '', s3Key: '' };
      if (requiresBackImage && idBack) {
        backResult = await uploadSingleFile(idBack.file, 'kyc_id_back');
      }
      const selfieResult = await uploadSingleFile(selfie!.file, 'kyc_selfie');

      setIsUploading(false);

      // Submit KYC data to backend
      const kycPayload = {
        id_type: idType,
        id_number: idNumber.trim(),
        gender: gender || undefined,
        id_front_image_url: frontResult.url,
        id_front_s3_key: frontResult.s3Key,
        id_back_image_url: backResult.url || undefined,
        id_back_s3_key: backResult.s3Key || undefined,
        selfie_image_url: selfieResult.url,
        selfie_s3_key: selfieResult.s3Key,
      };

      const kycResponse = await fetch(API_ENDPOINTS.kyc.submit, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(kycPayload),
      });

      if (!kycResponse.ok) {
        const errData = await kycResponse.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to submit KYC');
      }

      // Upload profile photos if any
      if (profilePhotos.length > 0) {
        const formData = new FormData();
        profilePhotos.forEach(p => formData.append('files', p.file));
        formData.append('document_type', 'profile_photo');
        formData.append('is_public', 'true');
        formData.append('description', 'Profile photo');

        const uploadData = await new Promise<any>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100));
          });
          xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try { resolve(JSON.parse(xhr.responseText)); }
              catch { reject(new Error('Invalid response')); }
            } else { reject(new Error(`Upload failed: ${xhr.status}`)); }
          });
          xhr.addEventListener('error', () => reject(new Error('Network error')));
          xhr.open('POST', `${API_BASE_URL}/api/v1/documents/upload`);
          if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
          xhr.send(formData);
        });

        // Save photo URLs to profile
        const imageUrls = uploadData.documents
          ? uploadData.documents.map((doc: any) => doc.url || doc.public_url)
          : [];

        if (imageUrls.length > 0) {
          const profileResponse = await fetch(`${API_BASE_URL}/api/v1/househelps/me/fields`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
              updates: { photos: imageUrls },
              _step_metadata: {
                step_id: 'photos',
                step_number: 14,
                is_completed: true,
              },
            }),
          });

          if (!profileResponse.ok) {
            console.error('Failed to save profile photos, but KYC was submitted successfully');
          }
        }
      }

      // Mark KYC step as complete
      await fetch(`${API_BASE_URL}/api/v1/househelps/me/fields`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          updates: { kyc_submitted: true },
          _step_metadata: {
            step_id: 'kyc',
            step_number: 13,
            is_completed: true,
          },
        }),
      });

      markClean();
      setSuccess('Your KYC documents and photos have been uploaded successfully!');
      if (onComplete) {
        setTimeout(() => onComplete(), 500);
      }
    } catch (err: any) {
      setError(handleApiError(err, 'kyc', 'Failed to submit KYC. Please try again.'));
      console.error(err);
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  const handleSkip = async () => {
    try {
      const token = localStorage.getItem('token');
      // Mark step as skipped
      await fetch(`${API_BASE_URL}/api/v1/profile-setup-steps`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          step_id: 'kyc',
          step_number: 13,
          is_completed: false,
          is_skipped: true,
          data: {},
        }),
      });
      if (onComplete) onComplete();
    } catch (err) {
      console.error('Failed to skip KYC step:', err);
      if (onComplete) onComplete();
    }
  };

  // ─── Sub-step progress indicator ───
  const subStepLabels = requiresBackImage
    ? ['ID Type', 'Front of ID', 'Back of ID', 'Selfie', 'Photos']
    : ['ID Type', 'Front of ID', 'Selfie', 'Photos'];

  const renderSubStepProgress = () => (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        {subStepLabels.map((label, i) => (
          <div key={i} className="flex flex-col items-center flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
              i < currentLogicalStep
                ? 'bg-green-500 text-white'
                : i === currentLogicalStep
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
            }`}>
              {i < currentLogicalStep ? '✓' : i + 1}
            </div>
            <span className={`text-[10px] mt-1 text-center leading-tight ${
              i === currentLogicalStep ? 'text-purple-600 dark:text-purple-400 font-semibold' : 'text-gray-400 dark:text-gray-500'
            }`}>{label}</span>
          </div>
        ))}
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
        <div
          className="bg-gradient-to-r from-purple-600 to-pink-600 h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${((currentLogicalStep) / (totalSubSteps - 1)) * 100}%` }}
        />
      </div>
    </div>
  );

  // ─── Image upload card ───
  const renderImageUploadCard = (
    title: string,
    instruction: string,
    image: UploadedImage | null,
    onSelect: (e: React.ChangeEvent<HTMLInputElement>) => void,
    onRemove: () => void,
  ) => (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">{instruction}</p>
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-3">
        <p className="text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
          <span className="text-base leading-none">💡</span>
          <span>Please upload a <strong>clear image</strong> taken in <strong>good lighting</strong>. Ensure all text and details are legible. Blurry or dark images may be rejected.</span>
        </p>
      </div>

      {image ? (
        <div className="relative group">
          <img
            src={image.preview}
            alt={title}
            className="w-full max-h-64 object-contain rounded-xl border-2 border-purple-200 dark:border-purple-500/30"
          />
          <button
            onClick={onRemove}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
            title="Remove image"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <p className="text-center text-xs text-green-600 dark:text-green-400 mt-2 font-medium">Image selected</p>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-purple-300 dark:border-purple-600 rounded-xl cursor-pointer hover:border-purple-500 dark:hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg className="w-10 h-10 mb-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold text-purple-600 dark:text-purple-400">Click to upload</span>
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">JPG, PNG or WEBP (max 10MB)</p>
          </div>
          <input
            type="file"
            className="hidden"
            accept="image/jpeg,image/png,image/webp"
            onChange={onSelect}
          />
        </label>
      )}
    </div>
  );

  // ─── Render each sub-step ───
  const renderContent = () => {
    switch (subStep) {
      case SUB_STEPS.ID_TYPE:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Identity Verification</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Select your identification type and provide your ID number
              </p>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type of Identification</label>
              {ID_TYPE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setIdType(opt.value)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    idType === opt.value
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-md'
                      : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      idType === opt.value ? 'border-purple-500 bg-purple-500' : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      {idType === opt.value && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{opt.label}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{opt.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {idType === 'passport' ? 'Passport Number' : 'ID Number'}
              </label>
              <input
                type="text"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                placeholder={idType === 'passport' ? 'e.g. AB1234567' : 'e.g. 12345678'}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 transition-colors"
              />
            </div>

            {idType && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-3">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  {requiresBackImage
                    ? `You will need to upload the front and back of your ${idType === 'national_id' ? 'National ID' : 'Alien Card'}, plus a selfie photo.`
                    : 'You will need to upload the front page of your Passport, plus a selfie photo.'}
                </p>
              </div>
            )}
          </div>
        );

      case SUB_STEPS.ID_FRONT:
        return renderImageUploadCard(
          `Front of ${idType === 'passport' ? 'Passport' : idType === 'alien_card' ? 'Alien Card' : 'National ID'}`,
          `Upload a clear photo of the front of your ${idType === 'passport' ? 'passport bio page' : 'identification card'}`,
          idFront,
          (e) => handleFileSelect(e, setIdFront),
          () => { if (idFront?.preview) URL.revokeObjectURL(idFront.preview); setIdFront(null); },
        );

      case SUB_STEPS.ID_BACK:
        return renderImageUploadCard(
          `Back of ${idType === 'alien_card' ? 'Alien Card' : 'National ID'}`,
          'Upload a clear photo of the back of your identification card',
          idBack,
          (e) => handleFileSelect(e, setIdBack),
          () => { if (idBack?.preview) URL.revokeObjectURL(idBack.preview); setIdBack(null); },
        );

      case SUB_STEPS.SELFIE:
        return renderImageUploadCard(
          'Selfie Photo',
          'Upload a clear selfie of yourself. This helps verify your identity.',
          selfie,
          (e) => handleFileSelect(e, setSelfie),
          () => { if (selfie?.preview) URL.revokeObjectURL(selfie.preview); setSelfie(null); },
        );

      case SUB_STEPS.PROFILE_PHOTOS:
        return (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Profile Photos</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Upload up to {MAX_PROFILE_PHOTOS} photos for your profile (optional but recommended)
              </p>
            </div>

            {/* Existing photos grid */}
            {profilePhotos.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {profilePhotos.map((photo, i) => (
                  <div key={i} className="relative group aspect-square">
                    <img
                      src={photo.preview}
                      alt={`Profile photo ${i + 1}`}
                      className="w-full h-full object-cover rounded-xl border-2 border-purple-200 dark:border-purple-500/30"
                    />
                    <button
                      onClick={() => removeProfilePhoto(i)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload area */}
            {profilePhotos.length < MAX_PROFILE_PHOTOS && (
              <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-purple-300 dark:border-purple-600 rounded-xl cursor-pointer hover:border-purple-500 dark:hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-colors">
                <div className="flex flex-col items-center justify-center py-4">
                  <svg className="w-8 h-8 mb-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-semibold text-purple-600 dark:text-purple-400">Add photos</span>
                    <span className="ml-1">({profilePhotos.length}/{MAX_PROFILE_PHOTOS})</span>
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handleMultiFileSelect}
                />
              </label>
            )}

            <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
              Profile photos are optional. You can always add them later.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  const isLastSubStep = subStep === SUB_STEPS.PROFILE_PHOTOS;

  return (
    <div className="space-y-6">
      {renderSubStepProgress()}

      {error && <ErrorAlert message={error} />}
      {success && <SuccessAlert message={success} />}

      {/* Upload progress */}
      {(isUploading || isSubmitting) && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>{isUploading ? 'Uploading images...' : 'Submitting KYC...'}</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {renderContent()}

      {/* Navigation */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={subStep === SUB_STEPS.ID_TYPE ? undefined : handlePrevSubStep}
          disabled={subStep === SUB_STEPS.ID_TYPE || isSubmitting}
          className={`flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            subStep === SUB_STEPS.ID_TYPE
              ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
              : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-purple-900/20'
          }`}
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div className="flex gap-3">
          {isLastSubStep && (
            <button
              onClick={handleSkip}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-sm text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 underline"
            >
              Skip for now
            </button>
          )}

          {isLastSubStep ? (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !idFront || !selfie || (requiresBackImage && !idBack)}
              className="flex items-center px-6 py-2 rounded-xl text-white font-bold shadow-lg transition-all bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Submitting...
                </>
              ) : 'Submit & Continue'}
            </button>
          ) : (
            <button
              onClick={handleNextSubStep}
              className="flex items-center px-6 py-2 rounded-xl text-white font-bold shadow-lg transition-all bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              Next
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default KYCUpload;
