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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md p-6 relative shadow-2xl border-2 border-purple-200 dark:border-purple-500/30">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        <h3 className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-6">Expecting a Child</h3>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">


            <div>
              <label className="block text-base font-bold text-purple-700 dark:text-purple-400 mb-2">
                Expected Due Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={expectedDate}
                onChange={(e) => setExpectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="block w-full h-12 px-4 py-3 rounded-xl border-2 bg-white dark:bg-[#13131a] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all border-purple-200 dark:border-purple-500/30 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:brightness-110 dark:[&::-webkit-calendar-picker-indicator]:brightness-200 [&::-webkit-calendar-picker-indicator]:sepia-[0.3] [&::-webkit-calendar-picker-indicator]:hue-rotate-[250deg] [&::-webkit-calendar-picker-indicator]:saturate-150"
              />
            </div>

            <div>
              <label className="block text-base font-bold text-purple-700 dark:text-purple-400 mb-2">
                Additional Notes (optional)
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="block w-full px-4 py-3 rounded-xl border-2 bg-white dark:bg-[#13131a] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all border-purple-200 dark:border-purple-500/30 resize-none"
                placeholder="Any special notes or considerations..."
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-1.5 rounded-xl border-2 border-purple-200 dark:border-purple-500/30 text-purple-700 dark:text-purple-400 font-bold hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!expectedDate}
              className="flex-1 px-6 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold shadow-lg hover:from-purple-700 hover:to-pink-700 hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
