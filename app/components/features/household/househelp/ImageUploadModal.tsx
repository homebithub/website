import React from "react";

interface ImageUploadModalProps {
  open: boolean;
  onClose: () => void;
  files: File[];
  setFiles: (files: File[]) => void;
  onUpload: () => void;
  uploading?: boolean;
}

export default function ImageUploadModal({ open, onClose, files, setFiles, onUpload, uploading }: ImageUploadModalProps) {
  const [previews, setPreviews] = React.useState<string[]>([]);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open && files.length > 0) {
      const readers = files.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      });
      Promise.all(readers).then(setPreviews);
    } else {
      setPreviews([]);
    }
  }, [files, open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files ? Array.from(e.target.files) : [];
    setFiles([...files, ...selected].slice(0, 5));
  };

  const handleRemove = (idx: number) => {
    setFiles(files.filter((_, i) => i !== idx));
  };

  const handleReplace = (idx: number, file: File) => {
    setFiles(files.map((f, i) => (i === idx ? file : f)));
  };

  return (
    <div
      className={`fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-lg ${open ? '' : 'hidden'}`}
      aria-modal="true" role="dialog">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 w-full max-w-lg relative">
        <h3 className="text-xl font-bold mb-4 text-primary dark:text-primary-200">Upload Images</h3>
        <div className="flex flex-col gap-4">
          <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">
            You can upload up to 5 images, 10MB each.
          </div>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            disabled={files.length >= 5}
            className="block mb-2"
          />
          <div className="grid grid-cols-2 gap-4">
            {previews.map((src, idx) => (
              <div key={idx} className="relative border rounded-lg overflow-hidden">
                <img src={src} alt={`Preview ${idx + 1}`} className="object-cover w-full h-32"/>
                <div className="absolute top-1 right-1 flex gap-1">
                  <label
                    className="cursor-pointer text-xs bg-primary-200 text-primary-800 px-2 py-1 rounded hover:bg-primary-300">
                    Replace
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => {
                        if (e.target.files && e.target.files[0]) handleReplace(idx, e.target.files[0]);
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded hover:bg-red-300"
                    onClick={() => handleRemove(idx)}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          {errorMsg && <div className="text-red-600 text-sm">{errorMsg}</div>}
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button
            className="btn-secondary"
            onClick={onClose}
            disabled={uploading}
          >
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={onUpload}
            disabled={uploading || files.length === 0}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
}
