import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface WaitlistProps {
  isOpen: boolean;
  onClose: () => void;
}

interface WaitlistFormData {
  phone: string;
  email: string;
  first_name: string;
  message: string;
}

interface WaitlistResponse {
  data?: {
    id: string;
    phone: string;
    email: string;
    first_name: string;
    message: string;
    created_at: string;
    updated_at: string;
  };
  success: boolean;
  error?: string;
}

export function Waitlist({ isOpen, onClose }: WaitlistProps) {
  const [formData, setFormData] = useState<WaitlistFormData>({
    phone: '',
    email: '',
    first_name: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('https://api.homexpert.co.ke/api/v1/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data: WaitlistResponse = await response.json();

      if (data.success) {
        setShowSuccess(true);
        setFormData({
          phone: '',
          email: '',
          first_name: '',
          message: ''
        });
        // Auto-hide success message and close modal after 3 seconds
        setTimeout(() => {
          setShowSuccess(false);
          onClose();
        }, 3000);
      } else {
        setError(data.error || 'An error occurred while joining the waitlist');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setError(null);
      setShowSuccess(false);
      onClose();
    }
  };

  return (
    <Transition appear show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg sm:max-w-lg max-w-full transform overflow-hidden rounded-2xl bg-white p-4 sm:p-8 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Join Our Waitlist
                  </Dialog.Title>
                  <button
                    type="button"
                    className="rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    onClick={handleClose}
                    disabled={isSubmitting}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {showSuccess && (
                  <div className="mb-4 rounded-md bg-green-50 p-4">
                    <div className="flex">
                      <div className="ml-3">
                        <p className="text-sm font-medium text-green-800">
                          Successfully added to waitlist!
                        </p>
                        <p className="text-sm text-green-700 mt-1">
                          We'll notify you when HomeXpert is available.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="mb-4 rounded-md bg-red-50 p-4">
                    <div className="flex">
                      <div className="ml-3">
                        <p className="text-sm font-medium text-red-800">
                          {error}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="first_name" className="block text-slate-900 mb-1 font-medium">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      id="first_name"
                      required
                      value={formData.first_name}
                      onChange={handleInputChange}
                      className="w-full h-12 text-base px-3 sm:px-4 py-2 sm:py-3 rounded-lg border bg-white text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-500 transition border-primary-200"
                      placeholder="Enter your first name"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-slate-900 mb-1 font-medium">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full h-12 text-base px-3 sm:px-4 py-2 sm:py-3 rounded-lg border bg-white text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-500 transition border-primary-200"
                      placeholder="Enter your email"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-slate-900 mb-1 font-medium">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full h-12 text-base px-3 sm:px-4 py-2 sm:py-3 rounded-lg border bg-white text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-500 transition border-primary-200"
                      placeholder="0712345678"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-slate-900 mb-1 font-medium">
                      Message
                    </label>
                    <textarea
                      name="message"
                      id="message"
                      rows={3}
                      value={formData.message}
                      onChange={handleInputChange}
                      className="w-full text-base px-3 sm:px-4 py-2 sm:py-3 rounded-lg border bg-white text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-500 transition border-primary-200"
                      placeholder="Anything else you would like to let us know?"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                      onClick={handleClose}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex justify-center rounded-md border border-transparent bg-purple-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Joining...' : 'Join Waitlist'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
