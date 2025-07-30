import React, { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, UserGroupIcon, HomeIcon } from '@heroicons/react/24/outline';

type UserType = 'househelp' | 'household';

interface SignupFlowProps {
  isOpen: boolean;
  onClose: () => void;
}

const SignupFlow: React.FC<SignupFlowProps> = ({ isOpen, onClose }) => {
  // State management
  const [userType, setUserType] = useState<UserType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle user type selection
  const handleUserTypeSelect = (type: UserType) => {
    setUserType(type);
    setIsSubmitting(true);

    // Close the modal after a short delay to show the selection
    setTimeout(() => {
      onClose();
      window.location.href = type === 'househelp' ? '/signup/househelp' : '/signup/household';
    }, 500);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95 translate-y-4"
              enterTo="opacity-100 scale-100 translate-y-0"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100 translate-y-0"
              leaveTo="opacity-0 scale-95 translate-y-4"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                <div className="absolute right-4 top-4">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    onClick={onClose}
                    disabled={isSubmitting}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="py-6 px-4 sm:px-6">
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">Join HomeXpert</h3>
                      <p className="text-gray-600">Select your account type to get started</p>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <button
                        onClick={() => handleUserTypeSelect('househelp')}
                        className={`p-6 border-2 rounded-xl text-left transition-all duration-200 ${
                          userType === 'househelp'
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                        }`}
                        disabled={isSubmitting}
                      >
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <UserGroupIcon className="h-6 w-6 text-white" />
                          </div>
                          <div className="ml-4">
                            <h4 className="text-lg font-semibold text-gray-900">Househelp</h4>
                            <p className="text-sm text-gray-500 mt-1">I'm looking for work opportunities</p>
                          </div>
                          {isSubmitting && userType === 'househelp' && (
                            <div className="ml-auto">
                              <div className="h-5 w-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                          )}
                        </div>
                      </button>

                      <button
                        onClick={() => handleUserTypeSelect('household')}
                        className={`p-6 border-2 rounded-xl text-left transition-all duration-200 ${
                          userType === 'household'
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                        }`}
                        disabled={isSubmitting}
                      >
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                            <HomeIcon className="h-6 w-6 text-white" />
                          </div>
                          <div className="ml-4">
                            <h4 className="text-lg font-semibold text-gray-900">Household</h4>
                            <p className="text-sm text-gray-500 mt-1">I need to hire help for my home</p>
                          </div>
                          {isSubmitting && userType === 'household' && (
                            <div className="ml-auto">
                              <div className="h-5 w-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                          )}
                        </div>
                      </button>
                    </div>

                    <div className="text-center pt-4">
                      <p className="text-sm text-gray-500">
                        Already have an account?{' '}
                        <a href="/login" className="text-indigo-600 hover:text-indigo-500 font-medium">
                          Sign in
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default SignupFlow;
