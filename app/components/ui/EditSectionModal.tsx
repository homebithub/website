import React, { useEffect, useRef } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { ProfileSetupProvider } from '~/contexts/ProfileSetupContext';
import { OnboardingOptionsProvider } from '~/contexts/OnboardingOptionsContext';

interface EditSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  profileType: 'household' | 'househelp';
  children: React.ReactNode;
}

export default function EditSectionModal({ isOpen, onClose, title, profileType, children }: EditSectionModalProps) {
  const backdropRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal panel — full-width on mobile, max-width on desktop */}
      <div className="relative w-full sm:max-w-lg sm:mx-4 max-h-[90vh] sm:max-h-[85vh] bg-white dark:bg-[#13131a] rounded-t-2xl sm:rounded-2xl shadow-2xl border border-gray-200 dark:border-purple-500/30 flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-purple-500/20 shrink-0">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">{title}</h2>
          <button
            onClick={onClose}
            className="h-9 w-9 rounded-full flex items-center justify-center border border-gray-300 dark:border-purple-500/30 text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-purple-500/10 transition-colors"
            aria-label="Close"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <ProfileSetupProvider>
            <OnboardingOptionsProvider profileType={profileType}>
              {children}
            </OnboardingOptionsProvider>
          </ProfileSetupProvider>
        </div>
      </div>
    </div>
  );
}
