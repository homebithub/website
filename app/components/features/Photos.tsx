import React, { useState, useCallback, useRef } from 'react';
import type { ChangeEvent } from 'react';
import { XMarkIcon, ArrowLeftIcon, ArrowRightIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { API_BASE_URL } from '~/config/api';

type ImageFile = {
  id: string;
  file: File;
  preview: string;
};

interface PhotosProps {
  userType?: 'househelp' | 'household';
}

const MAX_FILES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const Photos: React.FC<PhotosProps> = ({ userType = 'househelp' }) => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): { valid: boolean; message?: string } => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return { 
        valid: false, 
        message: `File type not allowed: ${file.name}. Only JPG, PNG, WEBP, and GIF are supported.` 
      };
    }
    
    if (file.size > MAX_FILE_SIZE) {
      return { 
        valid: false, 
        message: `File too large: ${file.name}. Maximum size is 10MB.` 
      };
    }
    
    return { valid: true };
  };

  const handleFiles = useCallback((files: FileList) => {
    setError('');
    
    // Convert FileList to array and validate
    const fileArray = Array.from(files);
    
    // Check total number of files
    if (images.length + fileArray.length > MAX_FILES) {
      setError(`You can only upload up to ${MAX_FILES} images in total.`);
      return;
    }
    
    const newImages: ImageFile[] = [];
    
    fileArray.forEach((file) => {
      const validation = validateFile(file);
      if (!validation.valid) {
        setError(prev => prev ? `${prev}\n${validation.message}` : validation.message || '');
        return;
      }
      
      newImages.push({
        id: Math.random().toString(36).substring(2, 15),
        file,
        preview: URL.createObjectURL(file)
      });
    });
    
    if (newImages.length > 0) {
      setImages(prev => [...prev, ...newImages].slice(0, MAX_FILES));
    }
  }, [images.length]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
      // Reset the input value to allow selecting the same file again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeImage = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the modal when deleting
    setImages(prev => {
      const updated = prev.filter(img => img.id !== id);
      // Revoke object URLs to avoid memory leaks
      const removed = prev.find(img => img.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);
      return updated;
    });
  };

  const openImageModal = (index: number) => {
    setSelectedImageIndex(index);
    document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
  };

  const closeImageModal = () => {
    setSelectedImageIndex(null);
    document.body.style.overflow = 'auto';
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    if (selectedImageIndex === null) return;
    
    if (direction === 'prev') {
      setSelectedImageIndex(prev => (prev === 0 ? images.length - 1 : (prev || 1) - 1));
    } else {
      setSelectedImageIndex(prev => (prev === null ? 0 : (prev + 1) % images.length));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (images.length === 0) {
      setError('Please upload at least one image');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      const token = localStorage.getItem('token');
      
      // Upload images to image service first
      const formData = new FormData();
      images.forEach((image) => {
        formData.append('images', image.file);
      });
      
      const uploadResponse = await fetch(`${API_BASE_URL}/api/v1/images/upload`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });
      
      if (!uploadResponse.ok) {
        throw new Error('Failed to upload images');
      }
      
      const uploadData = await uploadResponse.json();
      const imageUrls = uploadData.urls || uploadData.images || [];
      
      // For household, update profile with photos and step metadata
      if (userType === 'household') {
        const profileResponse = await fetch(`${API_BASE_URL}/api/v1/household/profile`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            photos: imageUrls,
            _step_metadata: {
              step_id: "photos",
              step_number: 8,
              is_completed: true
            }
          }),
        });
        
        if (!profileResponse.ok) {
          throw new Error('Failed to save photos to profile');
        }
      } else {
        // For househelp, update househelp profile
        const profileResponse = await fetch(`${API_BASE_URL}/api/v1/househelp/profile`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            photos: imageUrls
          }),
        });
        
        if (!profileResponse.ok) {
          throw new Error('Failed to save photos to profile');
        }
      }
      
      setSuccess('Your photos have been uploaded successfully!');
    } catch (err) {
      setError('Failed to upload photos. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle keyboard navigation in the modal
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (selectedImageIndex === null) return;
    
    switch (e.key) {
      case 'Escape':
        closeImageModal();
        break;
      case 'ArrowLeft':
        navigateImage('prev');
        break;
      case 'ArrowRight':
        navigateImage('next');
        break;
      default:
        break;
    }
  }, [selectedImageIndex]);

  // Add/remove event listener for keyboard navigation
  React.useEffect(() => {
    if (selectedImageIndex !== null) {
      window.addEventListener('keydown', handleKeyDown);
    } else {
      window.removeEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [selectedImageIndex, handleKeyDown]);

  // Clean up object URLs when component unmounts
  React.useEffect(() => {
    return () => {
      images.forEach(image => URL.revokeObjectURL(image.preview));
    };
  }, [images]);

  // Dynamic content based on user type
  const content = {
    househelp: {
      title: 'Upload Your Photos',
      description: `Add up to ${MAX_FILES} photos to showcase your work and experience. High-quality images help you stand out.`,
      uploadText: 'Click to upload photos or drag and drop',
      supportText: 'JPG, PNG, WEBP, GIF up to 10MB each'
    },
    household: {
      title: 'Upload Photos of Your Home',
      description: `Add up to ${MAX_FILES} photos of your home and living spaces. This helps househelps understand your environment and needs.`,
      uploadText: 'Click to upload home photos or drag and drop',
      supportText: 'JPG, PNG, WEBP, GIF up to 10MB each'
    }
  };

  const currentContent = content[userType];

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm p-6 sm:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{currentContent.title} (Optional)</h1>
      <p className="text-gray-600 mb-6">
        {currentContent.description}
      </p>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md text-sm whitespace-pre-line">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-md text-sm">
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div 
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400 bg-gray-50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="space-y-2">
            <svg 
              className="mx-auto h-12 w-12 text-gray-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
              />
            </svg>
            <div className="flex text-sm text-gray-600">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500 mx-auto"
              >
                <span>{currentContent.uploadText}</span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                />
              </label>
            </div>
            <p className="text-xs text-gray-500">
              {currentContent.supportText}
            </p>
          </div>
        </div>
        
        {/* Image Previews */}
        {images.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">
              Your photos ({images.length}/{MAX_FILES})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {images.map((image, index) => (
                <div 
                  key={image.id} 
                  className="relative group cursor-pointer"
                  onClick={() => openImageModal(index)}
                >
                  <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-100">
                    <img
                      src={image.preview}
                      alt="Preview"
                      className="h-full w-full object-cover object-center group-hover:opacity-90 transition-opacity"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={(e) => removeImage(image.id, e)}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                    title="Remove image"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                  <div className="mt-1 text-xs text-gray-500 truncate">
                    {image.file.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting || images.length === 0}
            className={`w-full px-6 py-3 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
              images.length > 0 
                ? 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500' 
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </span>
            ) : 'Save Photos'}
          </button>
        </div>
      </form>

      {/* Image Preview Modal */}
      {selectedImageIndex !== null && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={closeImageModal}
              aria-hidden="true"
            ></div>

            {/* Modal panel */}
            <div className="fixed inset-0 z-10 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl">
                  <div className="absolute right-0 top-0 pr-4 pt-4">
                    <button
                      type="button"
                      className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                      onClick={closeImageModal}
                    >
                      <span className="sr-only">Close</span>
                      <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                  
                  <div className="relative">
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {images[selectedImageIndex]?.file.name}
                        </h3>
                        <div className="text-sm text-gray-500">
                          {selectedImageIndex + 1} of {images.length}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                          onClick={closeImageModal}
                          title="Close"
                        >
                          <XMarkIcon className="h-5 w-5" />
                          <span className="sr-only">Close</span>
                        </button>
                      </div>
                    </div>
                    
                    <div className="relative h-[70vh] bg-black">
                      <img
                        src={images[selectedImageIndex]?.preview}
                        alt="Preview"
                        className="h-full w-full object-contain"
                      />
                      
                      {/* Navigation arrows */}
                      {images.length > 1 && (
                        <>
                          <button
                            type="button"
                            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-75 focus:outline-none focus:ring-2 focus:ring-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigateImage('prev');
                            }}
                          >
                            <span className="sr-only">Previous</span>
                            <ArrowLeftIcon className="h-6 w-6" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-75 focus:outline-none focus:ring-2 focus:ring-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigateImage('next');
                            }}
                          >
                            <span className="sr-only">Next</span>
                            <ArrowRightIcon className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </>
                      )}
                      
                      {/* Action buttons */}
                      <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
                        <button
                          type="button"
                          className="px-4 py-2 bg-white text-gray-700 rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 flex items-center space-x-2"
                          onClick={closeImageModal}
                        >
                          <XMarkIcon className="h-5 w-5" />
                          <span>Cancel</span>
                        </button>
                        <button
                          type="button"
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex items-center space-x-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (images[selectedImageIndex]) {
                              const nextIndex = selectedImageIndex === 0 && images.length > 1 ? 0 : Math.max(0, selectedImageIndex - 1);
                              removeImage(images[selectedImageIndex].id, e);
                              if (images.length === 1) {
                                closeImageModal();
                              } else {
                                setSelectedImageIndex(nextIndex);
                              }
                            }
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Photos;
