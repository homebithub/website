import React, { useState } from 'react';
import { createPortal } from 'react-dom';
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
    e.stopPropagation(); // Prevent event from bubbling to parent forms

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

  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative bg-white dark:bg-[#13131a] rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md p-6 shadow-2xl border border-gray-200 dark:border-purple-500/30 animate-slide-up sm:mx-4">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">🤰 Expecting a Child</h3>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">


            <div>
              <label className="block text-sm font-semibold text-purple-700 dark:text-purple-400 mb-2">
                Expected Due Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={expectedDate}
                onChange={(e) => setExpectedDate(e.target.value)}
                className="block w-full h-10 px-4 py-1.5 border-2 border-purple-200 dark:border-purple-500/30 rounded-xl bg-white dark:bg-[#13131a] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-70 [&::-webkit-calendar-picker-indicator]:hover:opacity-100"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-purple-700 dark:text-purple-400 mb-2">
                Additional Notes (optional)
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="block w-full px-4 py-3 border-2 border-purple-200 dark:border-purple-500/30 rounded-xl bg-white dark:bg-[#13131a] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all resize-none"
                placeholder="Any special notes or considerations..."
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-1.5 border-2 border-purple-200 dark:border-purple-500/30 rounded-xl font-bold text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl shadow-lg hover:from-purple-700 hover:to-pink-700 hover:scale-105 transition-all"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default ExpectingModal;
