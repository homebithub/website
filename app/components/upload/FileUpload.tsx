import React, { useState, useRef } from 'react';
import { CloudArrowUpIcon, XMarkIcon, DocumentIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { API_BASE_URL } from '~/config/api';

export interface UploadedFile {
  id: string;
  file_name: string;
  url: string;
  content_type: string;
  size: number;
  document_type: string;
}

interface FileUploadProps {
  documentType: string;
  isPublic?: boolean;
  maxFiles?: number;
  maxSizeMB?: number;
  accept?: string;
  onUploadComplete?: (files: UploadedFile[]) => void;
  onUploadError?: (error: string) => void;
  className?: string;
}

interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'complete' | 'error';
  error?: string;
}

export default function FileUpload({
  documentType,
  isPublic = false,
  maxFiles = 5,
  maxSizeMB = 10,
  accept = isPublic ? 'image/*' : 'image/*,application/pdf',
  onUploadComplete,
  onUploadError,
  className = '',
}: FileUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, UploadProgress>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate file count
    if (files.length > maxFiles) {
      onUploadError?.(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Validate file sizes
    const oversizedFiles = files.filter(f => f.size > maxSizeMB * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      onUploadError?.(`Some files exceed ${maxSizeMB}MB limit`);
      return;
    }

    setSelectedFiles(files);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    const token = localStorage.getItem('token');

    if (!token) {
      onUploadError?.('Not authenticated');
      setIsUploading(false);
      return;
    }

    try {
      const formData = new FormData();
      
      // Add files
      selectedFiles.forEach(file => {
        formData.append('files', file);
        
        // Initialize progress tracking
        setUploadProgress(prev => ({
          ...prev,
          [file.name]: {
            fileName: file.name,
            progress: 0,
            status: 'uploading',
          },
        }));
      });

      // Add metadata
      formData.append('document_type', documentType);
      formData.append('is_public', isPublic.toString());

      // Upload with progress tracking
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          
          // Update progress for all files (simplified - shows overall progress)
          selectedFiles.forEach(file => {
            setUploadProgress(prev => ({
              ...prev,
              [file.name]: {
                ...prev[file.name],
                progress: percentComplete,
              },
            }));
          });
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          
          // Mark all as complete
          selectedFiles.forEach(file => {
            setUploadProgress(prev => ({
              ...prev,
              [file.name]: {
                ...prev[file.name],
                progress: 100,
                status: 'complete',
              },
            }));
          });

          // Store uploaded files
          setUploadedFiles(response.documents || []);
          onUploadComplete?.(response.documents || []);
          
          // Clear selected files
          setTimeout(() => {
            setSelectedFiles([]);
            setUploadProgress({});
          }, 2000);
        } else {
          throw new Error('Upload failed');
        }
      });

      xhr.addEventListener('error', () => {
        selectedFiles.forEach(file => {
          setUploadProgress(prev => ({
            ...prev,
            [file.name]: {
              ...prev[file.name],
              status: 'error',
              error: 'Upload failed',
            },
          }));
        });
        onUploadError?.('Upload failed');
      });

      xhr.open('POST', `${API_BASE_URL}/api/v1/documents/upload`);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formData);
      
    } catch (error: any) {
      console.error('Upload error:', error);
      onUploadError?.(error.message || 'Upload failed');
      
      selectedFiles.forEach(file => {
        setUploadProgress(prev => ({
          ...prev,
          [file.name]: {
            ...prev[file.name],
            status: 'error',
            error: error.message || 'Upload failed',
          },
        }));
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drop zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-purple-300 dark:border-purple-700 rounded-xl p-8 text-center cursor-pointer hover:border-purple-500 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-colors bg-white dark:bg-gray-800"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />
        
          <div className="flex flex-col items-center space-y-3">
          {isPublic ? (
            <PhotoIcon className="h-12 w-12 text-purple-400 dark:text-purple-500" />
          ) : (
            <DocumentIcon className="h-12 w-12 text-purple-400 dark:text-purple-500" />
          )}
          
          <div>
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              Click to upload or drag and drop
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {isPublic ? 'Images only' : 'Images or PDF documents'}
              {' '}(Max {maxSizeMB}MB per file, up to {maxFiles} files)
            </p>
          </div>
          
          <button
            type="button"
            className="px-4 py-1 bg-purple-600 dark:bg-purple-700 text-white rounded-xl hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors disabled:opacity-50"
            disabled={isUploading}
          >
            <CloudArrowUpIcon className="h-5 w-5 inline-block mr-2" />
            Choose Files
          </button>
        </div>
      </div>

      {/* Selected files list */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-700 dark:text-gray-200">Selected Files:</h3>
          
          {selectedFiles.map((file, index) => {
            const progress = uploadProgress[file.name];
            
            return (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3 flex-1">
                    {file.type.startsWith('image/') ? (
                      <PhotoIcon className="h-6 w-6 text-purple-500 dark:text-purple-400 flex-shrink-0" />
                    ) : (
                      <DocumentIcon className="h-6 w-6 text-purple-500 dark:text-purple-400 flex-shrink-0" />
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  
                  {!isUploading && !progress && (
                    <button
                      onClick={() => removeFile(index)}
                      className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-1"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>

                {/* Progress bar */}
                {progress && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className={`font-medium ${
                        progress.status === 'complete' ? 'text-green-600 dark:text-green-400' :
                        progress.status === 'error' ? 'text-red-600 dark:text-red-400' :
                        'text-purple-600 dark:text-purple-400'
                      }`}>
                        {progress.status === 'complete' ? 'Complete!' :
                         progress.status === 'error' ? progress.error || 'Error' :
                         `Uploading... ${Math.round(progress.progress)}%`}
                      </span>
                    </div>
                    
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          progress.status === 'complete' ? 'bg-green-500 dark:bg-green-400' :
                          progress.status === 'error' ? 'bg-red-500 dark:bg-red-400' :
                          'bg-purple-600 dark:bg-purple-500'
                        }`}
                        style={{ width: `${progress.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Upload button */}
      {selectedFiles.length > 0 && !isUploading && Object.keys(uploadProgress).length === 0 && (
        <button
          onClick={handleUpload}
          className="w-full px-6 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
        >
          Upload {selectedFiles.length} {selectedFiles.length === 1 ? 'File' : 'Files'}
        </button>
      )}

      {/* Uploaded files preview */}
      {uploadedFiles.length > 0 && (
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
          <p className="text-green-800 dark:text-green-300 font-semibold mb-2">
            ✓ Successfully uploaded {uploadedFiles.length} {uploadedFiles.length === 1 ? 'file' : 'files'}
          </p>
        </div>
      )}
    </div>
  );
}

