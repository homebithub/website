import React from "react";
import { useNavigate } from "react-router";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface ProfileSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  waitlistUrl: string;
}

export function ProfileSelectionModal({ isOpen, onClose, waitlistUrl }: ProfileSelectionModalProps) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleProfileSelect = (profile: "household" | "househelp") => {
    const url = `${waitlistUrl}?profile=${profile}`;
    navigate(url);
    onClose();
  };

  return (
    <div className="hb-mobile-modal-viewport fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#13131a] border border-purple-100 dark:border-purple-900/30 p-6 space-y-4 shadow-2xl">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Join the Waitlist</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Are you looking for help or offering services?
        </p>

        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={() => handleProfileSelect("household")}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg"
          >
            I'm looking for help (Household)
          </button>
          <button
            type="button"
            onClick={() => handleProfileSelect("househelp")}
            className="w-full py-3 rounded-xl border-2 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 text-sm font-semibold hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all"
          >
            I offer services (Househelp)
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 pt-2"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
