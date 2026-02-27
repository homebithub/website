import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string; // e.g., 'max-w-md', 'max-w-lg', or a pixel value 'max-w-[460px]'
  scrollRef?: React.RefObject<HTMLDivElement>;
}

export function SidePanel({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-[460px]',
  scrollRef
}: SidePanelProps) {
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[80]" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-[2px] transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-0">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className={`pointer-events-auto absolute right-0 sm:right-4 top-20 sm:top-24 bottom-20 sm:bottom-24 w-full ${maxWidth}`}>
                  <div ref={scrollRef} className="flex h-full flex-col overflow-y-auto bg-[#f3f4f7] dark:bg-gradient-to-br dark:from-[#0a0a0f] dark:via-[#13131a] dark:to-[#0a0a0f] shadow-[0_24px_80px_rgba(15,23,42,0.28)] rounded-none sm:rounded-[2rem] border border-[#d6dbe7] dark:border-purple-500/30">
                    <div className="sticky top-0 z-10 bg-[#f3f4f7] dark:bg-[#13131a] px-6 py-6 sm:px-7">
                      <div className="flex items-start justify-between">
                        <Dialog.Title className="text-xl font-bold text-gray-900 dark:text-white">
                          {title}
                        </Dialog.Title>
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            type="button"
                            className="h-9 w-9 rounded-full border border-[#c7cdd9] dark:border-purple-500/30 text-slate-500 hover:text-slate-700 hover:bg-white/70 dark:text-gray-300 dark:hover:text-white dark:hover:bg-purple-500/10 transition-colors focus:outline-none"
                            onClick={onClose}
                          >
                            <span className="sr-only">Close panel</span>
                            <XMarkIcon className="h-5 w-5 mx-auto" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="relative flex-1 px-6 pb-6 sm:px-7 sm:pb-7">
                      {children}
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
