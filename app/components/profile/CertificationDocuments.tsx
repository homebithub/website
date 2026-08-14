import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowTopRightOnSquareIcon,
  DocumentIcon,
  EyeIcon,
  PhotoIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { documentService, onboardingOptionsService } from '~/services/grpc/authServices';
import { uploadDocuments } from '~/utils/documentUploads';
import CustomSelect from '~/components/ui/CustomSelect';
import { ErrorAlert } from '~/components/ui/ErrorAlert';
import ConfirmDialog from '~/components/ConfirmDialog';
import { getAccessTokenFromCookies } from '~/utils/cookie';
import { FormError } from '~/components/FormError';

type CertificationOption = {
  id: number;
  name: string;
};

type CertificationDocument = {
  id: string;
  description?: string;
  file_name?: string;
  content_type?: string;
  size?: number;
  public_url?: string;
  signed_url?: string;
  url?: string;
  tags?: string[];
};

type ViewerState = {
  document: CertificationDocument;
  url: string;
  objectURL?: boolean;
} | null;

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_PER_TYPE = 5;
const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];

const documentURL = (document: CertificationDocument): string =>
  document.signed_url || document.public_url || document.url || '';

const formatSize = (bytes = 0): string => {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const normalizeList = (payload: any): any[] => {
  const value = payload?.data ?? payload;
  return Array.isArray(value) ? value : [];
};

function DocumentViewer({
  viewer,
  onClose,
}: {
  viewer: NonNullable<ViewerState>;
  onClose: () => void;
}) {
  const isPDF = viewer.document.content_type === 'application/pdf';

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/80 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`View ${viewer.document.file_name || 'certification document'}`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-t-2xl border border-purple-400/30 bg-[#13131a] shadow-2xl sm:rounded-2xl">
        <div className="flex items-center justify-between gap-4 border-b border-purple-500/20 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              {viewer.document.file_name || viewer.document.description || 'Certification document'}
            </p>
            <p className="text-xs text-gray-400">{viewer.document.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={viewer.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-purple-600 px-3 text-xs font-semibold text-white transition hover:bg-purple-500"
            >
              <ArrowTopRightOnSquareIcon className="h-4 w-4" />
              Open
            </a>
            <button
              type="button"
              onClick={onClose}
              className="grid h-9 w-9 place-items-center rounded-lg text-gray-300 transition hover:bg-white/10 hover:text-white"
              aria-label="Close document viewer"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="min-h-[50vh] flex-1 bg-black/30 p-3 sm:p-5">
          {isPDF ? (
            <iframe
              src={viewer.url}
              title={viewer.document.file_name || 'Certification PDF'}
              className="h-[72vh] w-full rounded-lg bg-white"
            />
          ) : (
            <img
              src={viewer.url}
              alt={viewer.document.file_name || 'Certification document'}
              className="mx-auto h-full max-h-[72vh] w-full object-contain"
            />
          )}
        </div>
      </div>
    </div>
  );
}
export function CertificationDocuments({ profileId }: { profileId?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [options, setOptions] = useState<CertificationOption[]>([]);
  const [documents, setDocuments] = useState<CertificationDocument[]>([]);
  const [selectedType, setSelectedType] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [viewer, setViewer] = useState<ViewerState>(null);
  const [deleteTarget, setDeleteTarget] = useState<CertificationDocument | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [optionsPayload, documentsPayload] = await Promise.all([
        onboardingOptionsService.getAllOptions('househelp'),
        documentService.getUserDocuments('', 'certificate'),
      ]);
      const certificationOptions = Array.isArray(optionsPayload?.certifications)
        ? optionsPayload.certifications
        : [];
      setOptions(
        certificationOptions
          .map((option: any) => ({ id: Number(option.id), name: String(option.name || '') }))
          .filter((option: CertificationOption) => option.id > 0 && option.name),
      );
      setDocuments(normalizeList(documentsPayload));
    } catch (requestError) {
      console.error('Unable to load certification documents', requestError);
      setError('We couldn’t load your certification documents. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const groupedDocuments = useMemo(() => {
    const groups = new Map<string, CertificationDocument[]>();
    documents.forEach((document) => {
      const name = document.description || 'Other certification';
      groups.set(name, [...(groups.get(name) || []), document]);
    });
    return Array.from(groups.entries());
  }, [documents]);

  const selectedOption = options.find((option) => String(option.id) === selectedType);
  const existingForSelected = selectedOption
    ? documents.filter((document) => document.description === selectedOption.name).length
    : 0;

  const chooseFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setError(null);
    if (files.some((file) => !ACCEPTED_TYPES.includes(file.type))) {
      setError('Choose PDF, JPG, PNG, or WEBP files only.');
      event.target.value = '';
      return;
    }
    const oversized = files.find((file) => file.size > MAX_FILE_SIZE);
    if (oversized) {
      setError(`${oversized.name} is larger than 5 MB.`);
      event.target.value = '';
      return;
    }
    if (existingForSelected + files.length > MAX_PER_TYPE) {
      setError(`You can upload up to 5 documents for ${selectedOption?.name || 'each certification type'}.`);
      event.target.value = '';
      return;
    }
    setSelectedFiles(files);
  };

  const upload = async () => {
    if (!selectedOption) {
      setError('Select a certification type first.');
      return;
    }
    if (selectedFiles.length === 0) {
      setError('Choose at least one document to upload.');
      return;
    }
    setUploading(true);
    setProgress(1);
    setError(null);
    try {
      await uploadDocuments({
        files: selectedFiles,
        documentType: 'certificate',
        profileId,
        description: selectedOption.name,
        certificationPropertyId: selectedOption.id,
        onProgress: setProgress,
      });
      setSelectedFiles([]);
      if (inputRef.current) inputRef.current.value = '';
      await load();
    } catch (uploadError: any) {
      setError(uploadError?.message || 'We couldn’t upload your certification documents.');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const openDocument = async (document: CertificationDocument) => {
    setError(null);
    let url = documentURL(document);
    try {
      if (!url) {
        const response = await documentService.getDocumentDownloadURL(document.id, '');
        url = response?.url || response?.data?.url || '';
      }
      if (!url) throw new Error('No document URL returned');
      if (url.includes('/api/v1/documents/') && url.includes('/content')) {
        const token = getAccessTokenFromCookies();
        if (!token) throw new Error('Session expired');
        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Document download failed');
        const objectURL = URL.createObjectURL(await response.blob());
        setViewer({ document, url: objectURL, objectURL: true });
        return;
      }
      setViewer({ document, url });
    } catch (requestError) {
      console.error('Unable to open certification document', requestError);
      setError('We couldn’t open that document. Please try again.');
    }
  };

  const closeViewer = () => {
    if (viewer?.objectURL) URL.revokeObjectURL(viewer.url);
    setViewer(null);
  };

  const removeDocument = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setError(null);
    try {
      await documentService.deleteDocument(deleteTarget.id, '');
      setDeleteTarget(null);
      await load();
    } catch (requestError) {
      console.error('Unable to delete certification document', requestError);
      setError('We couldn’t delete that document. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section className="border-t border-purple-200/40 bg-white p-6 dark:border-purple-500/30 dark:bg-[#13131a]">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xs font-semibold text-purple-700 dark:text-purple-400">
            📜 Certifications
          </h2>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
            Add proof of training or qualifications. PDF and image files only, up to 5 MB each.
          </p>
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={!selectedType || uploading}
          className="inline-flex items-center justify-center gap-1.5 self-start rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:from-purple-700 hover:to-pink-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <PlusIcon className="h-4 w-4" />
          Add certification
        </button>
      </div>

      {selectedFiles.length === 0 && <FormError message={error} className="mb-4" />}

      <div className="mb-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
            Certification type
          </span>
          <CustomSelect
            value={selectedType}
            onChange={(next) => {
              setSelectedType(next);
              setSelectedFiles([]);
              setError(null);
              if (inputRef.current) inputRef.current.value = '';
            }}
            ariaLabel="Certification type"
            placeholder="Select certification type"
            options={options.map((option) => ({
              value: String(option.id),
              label: String(option.name),
            }))}
          />
        </label>
        <div className="self-end text-xs text-gray-500 dark:text-gray-400">
          {selectedOption ? `${existingForSelected}/${MAX_PER_TYPE} uploaded` : 'Maximum 5 per type'}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept="application/pdf,image/jpeg,image/png,image/webp"
        onChange={chooseFiles}
        className="hidden"
      />

      {selectedFiles.length > 0 && (
        <div className="mb-5 rounded-xl border border-purple-200 bg-purple-50/60 p-4 dark:border-purple-500/25 dark:bg-purple-950/20">
          <FormError message={error} className="mb-3" />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-purple-800 dark:text-purple-200">
                {selectedFiles.length} {selectedFiles.length === 1 ? 'document' : 'documents'} ready
              </p>
              <p className="mt-1 truncate text-xs text-gray-600 dark:text-gray-400">
                {selectedFiles.map((file) => file.name).join(', ')}
              </p>
            </div>
            <button
              type="button"
              onClick={upload}
              disabled={uploading}
              className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-xs font-semibold text-white shadow-md transition hover:from-purple-700 hover:to-pink-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploading ? 'Uploading…' : 'Upload documents'}
            </button>
          </div>
          {uploading && (
            <div className="mt-4" aria-live="polite">
              <div className="mb-1.5 flex justify-between text-xs font-medium text-purple-800 dark:text-purple-200">
                <span>Uploading securely…</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-purple-200 dark:bg-purple-950">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-purple-600 to-pink-500 transition-[width] duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span className="hb-shimmer-piece h-4 w-4 rounded-full" />
          Loading certification documents…
        </div>
      ) : groupedDocuments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-purple-300/60 px-4 py-8 text-center dark:border-purple-500/30">
          <DocumentIcon className="mx-auto h-7 w-7 text-purple-400" />
          <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-200">
            No certification documents yet
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Select a type, then use Add certification to choose your files.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {groupedDocuments.map(([name, items]) => (
            <div key={name}>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{name}</h3>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {items.length}/{MAX_PER_TYPE}
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {items.map((document) => {
                  const isPDF = document.content_type === 'application/pdf';
                  return (
                    <article
                      key={document.id}
                      className="flex min-w-0 items-center gap-3 rounded-xl border border-purple-200/70 bg-purple-50/40 p-3 dark:border-purple-500/25 dark:bg-purple-950/15"
                    >
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                        {isPDF ? <DocumentIcon className="h-5 w-5" /> : <PhotoIcon className="h-5 w-5" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-gray-900 dark:text-white">
                          {document.file_name || name}
                        </p>
                        <p className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">
                          {isPDF ? 'PDF document' : 'Image'}{document.size ? ` · ${formatSize(document.size)}` : ''}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => void openDocument(document)}
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-purple-700 transition hover:bg-purple-100 dark:text-purple-300 dark:hover:bg-purple-900/40"
                        aria-label={`View ${document.file_name || name}`}
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(document)}
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                        aria-label={`Delete ${document.file_name || name}`}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </article>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {viewer && <DocumentViewer viewer={viewer} onClose={closeViewer} />}
      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title="Delete certification document"
        message="Are you sure you want to permanently remove this certification document?"
        confirmText={deleting ? 'Deleting…' : 'Delete'}
        cancelText="Cancel"
        variant="danger"
        onConfirm={() => void removeDocument()}
        onCancel={() => {
          if (!deleting) setDeleteTarget(null);
        }}
      />
    </section>
  );
}
