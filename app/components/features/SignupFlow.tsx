import React, { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, UserGroupIcon, HomeIcon } from '@heroicons/react/24/outline';

type UserType = 'househelp' | 'household';

interface SignupFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onUserTypeSelected?: (userType: UserType) => void;
}

const SignupFlow: React.FC<SignupFlowProps> = ({ isOpen, onClose, onUserTypeSelected }) => {
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
      // Trigger the profile completion modal
      if (onUserTypeSelected) {
        onUserTypeSelected(type);
      }
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
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-3xl bg-white p-8 shadow-2xl transition-all border border-gray-100">
                <div className="absolute right-6 top-6">
                  <button
                    type="button"
                    className="rounded-full bg-gray-100 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                    onClick={onClose}
                    disabled={isSubmitting}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>

                <div className="pt-2 pb-6">
                  <div className="space-y-8">
                    <div className="text-center">
                      <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                        <UserGroupIcon className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Join HomeXpert</h3>
                      <p className="text-lg text-gray-600 leading-relaxed">Select your account type to get started on your journey</p>
                    </div>

                    <div className="grid grid-cols-1 gap-5">
                      <button
                        onClick={() => handleUserTypeSelect('househelp')}
                        className={`group relative p-8 border-2 rounded-2xl text-left transition-all duration-300 transform hover:scale-[1.02] ${
                          userType === 'househelp'
                            ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-purple-100 shadow-lg'
                            : 'border-gray-200 hover:border-purple-300 hover:bg-gradient-to-br hover:from-purple-50/50 hover:to-purple-100/50 hover:shadow-md'
                        }`}
                        disabled={isSubmitting}
                      >
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                            <UserGroupIcon className="h-8 w-8 text-white" />
                          </div>
                          <div className="ml-6 flex-1">
                            <h4 className="text-xl font-bold text-gray-900 mb-1">Househelp</h4>
                            <p className="text-base text-gray-600 leading-relaxed">I'm looking for work opportunities and want to offer my services</p>
                          </div>
                          {isSubmitting && userType === 'househelp' && (
                            <div className="ml-4">
                              <div className="h-6 w-6 border-3 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                          )}
                        </div>
                      </button>

                      <button
                        onClick={() => handleUserTypeSelect('household')}
                        className={`group relative p-8 border-2 rounded-2xl text-left transition-all duration-300 transform hover:scale-[1.02] ${
                          userType === 'household'
                            ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-purple-100 shadow-lg'
                            : 'border-gray-200 hover:border-purple-300 hover:bg-gradient-to-br hover:from-purple-50/50 hover:to-purple-100/50 hover:shadow-md'
                        }`}
                        disabled={isSubmitting}
                      >
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                            <HomeIcon className="h-8 w-8 text-white" />
                          </div>
                          <div className="ml-6 flex-1">
                            <h4 className="text-xl font-bold text-gray-900 mb-1">Household</h4>
                            <p className="text-base text-gray-600 leading-relaxed">I need to hire help for my home and family needs</p>
                          </div>
                          {isSubmitting && userType === 'household' && (
                            <div className="ml-4">
                              <div className="h-6 w-6 border-3 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                          )}
                        </div>
                      </button>
                    </div>

                    <div className="text-center pt-6 border-t border-gray-100">
                      <p className="text-base text-gray-600">
                        Already have an account?{' '}
                        <a href="/login" className="text-purple-600 hover:text-purple-700 font-semibold transition-colors duration-200">
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
