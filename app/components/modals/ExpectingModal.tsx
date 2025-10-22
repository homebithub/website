import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ExpectingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { gender: string; expected_date: string; notes?: string }) => void;
}

const ExpectingModal: React.FC<ExpectingModalProps> = ({ isOpen, onClose, onSave }) => {
  const [gender, setGender] = useState('');
  const [expectedDate, setExpectedDate] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSave({
      gender,
      expected_date: expectedDate,
      ...(notes && { notes })
    });

    // Reset form
    setGender('');
    setExpectedDate('');
    setNotes('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md p-6 relative shadow-2xl border-2 border-purple-200 dark:border-purple-500/30">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        <div className="flex items-center gap-2 mb-6">
          <span className="text-3xl">🤰🏿</span>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Expecting a Child</h3>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">


            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Expected Due Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={expectedDate}
                onChange={(e) => setExpectedDate(e.target.value)}
                className="block w-full border-2 border-purple-200 dark:border-purple-500/30 rounded-xl shadow-sm py-3 px-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Additional Notes (optional)
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="block w-full border-2 border-purple-200 dark:border-purple-500/30 rounded-xl shadow-sm py-3 px-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all resize-none"
                placeholder="Any special notes or considerations..."
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-purple-200 dark:border-purple-500/30 rounded-xl font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl shadow-lg hover:from-purple-700 hover:to-pink-700 hover:scale-105 transition-all"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpectingModal;
