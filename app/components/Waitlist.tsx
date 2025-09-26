import React, { useEffect, useRef, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { FcGoogle } from 'react-icons/fc';

interface WaitlistProps {
  isOpen: boolean;
  onClose: () => void;
  prefillEmail?: string;
  prefillFirstName?: string;
  prefillError?: string;
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

export function Waitlist({ isOpen, onClose, prefillEmail, prefillFirstName, prefillError }: WaitlistProps) {
  const [formData, setFormData] = useState<WaitlistFormData>({
    phone: '',
    email: '',
    first_name: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isGooglePrefilled, setIsGooglePrefilled] = useState(false);
  const phoneInputRef = useRef<HTMLInputElement | null>(null);
  const messageRef = useRef<HTMLTextAreaElement | null>(null);

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
      const normalizeKenyanPhone = (phone: string) => {
        const p = phone.trim();
        if (p.startsWith('+254')) return p;
        if (p.startsWith('254')) return `+254${p.slice(3)}`;
        if (p.startsWith('0')) return `+254${p.slice(1)}`;
        return p;
      };
      const payload: WaitlistFormData = {
        ...formData,
        phone: normalizeKenyanPhone(formData.phone),
      };
      const baseUrl = (typeof window !== 'undefined' && (window as any).ENV?.AUTH_API_BASE_URL)
        ? (window as any).ENV.AUTH_API_BASE_URL
        : 'https://api.homexpert.co.ke/auth';
      const response = await fetch(`${baseUrl}/api/v1/waitlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data: WaitlistResponse = await response.json().catch(() => ({ success: false } as any));

      if (response.ok && data?.success) {
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
        // Prefer detailed validation messages if present
        const anyData: any = data as any;
        const validation = anyData?.errors ? Object.values(anyData.errors as Record<string, string>).join('\n') : null;
        const message = validation || anyData?.error || 'An error occurred while joining the waitlist';
        setError(message);
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

  // ---------- Google Sign-In Integration ----------
  // Keep types local to this file to avoid global type edits
  type GoogleCredentialResponse = { credential: string };

  function parseJwt(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  }

  const handleGoogleCredential = (response: GoogleCredentialResponse) => {
    const payload = parseJwt(response.credential);
    if (!payload) return;

    const email: string = payload.email || '';
    const firstName: string = payload.given_name || payload.givenName || (payload.name ? String(payload.name).split(' ')[0] : '');

    setFormData(prev => ({
      ...prev,
      email: email || prev.email,
      first_name: firstName || prev.first_name,
    }));
    setIsGooglePrefilled(true);

    // Focus remaining fields (phone first, then message)
    setTimeout(() => {
      if (phoneInputRef.current) {
        phoneInputRef.current.focus();
      } else if (messageRef.current) {
        messageRef.current.focus();
      }
    }, 50);
  };

  // Initialize Google button when modal opens
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Apply prefill from props when modal opens (e.g., after OAuth callback)
  useEffect(() => {
    if (!isOpen) return;
    if (prefillEmail || prefillFirstName) {
      setFormData(prev => ({
        ...prev,
        email: prefillEmail || prev.email,
        first_name: prefillFirstName || prev.first_name,
      }));
      setIsGooglePrefilled(true);
    }
    if (prefillError) {
      setError(prefillError);
    }
  }, [isOpen, prefillEmail, prefillFirstName, prefillError]);

  useEffect(() => {
    if (!isOpen) return;
    // Safe-guard for SSR
    if (typeof window === 'undefined') return;
    // Ensure script is ready
    const clientId = (window as any).ENV?.GOOGLE_CLIENT_ID;
    const google = (window as any).google;
    if (!clientId) return;

    function init() {
      if (!(window as any).google?.accounts?.id) {
        // Retry shortly if script hasn't finished loading yet
        setTimeout(init, 200);
        return;
      }
      (window as any).google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCredential,
        auto_select: false,
        context: 'signin',
      });
      const container = document.getElementById('google-waitlist-button');
      if (container && container.childElementCount === 0) {
        (window as any).google.accounts.id.renderButton(container, {
          theme: 'outline',
          size: 'large',
          width: 320,
          type: 'standard',
          shape: 'pill',
          logo_alignment: 'left',
          text: 'continue_with',
        });
      }
    }
    init();
  }, [isOpen]);

  // Start OAuth-based Google flow using backend URL to ensure server-verified identity
  const startOAuthWaitlist = async () => {
    try {
      const baseUrl = (typeof window !== 'undefined' && (window as any).ENV?.AUTH_API_BASE_URL)
        ? (window as any).ENV.AUTH_API_BASE_URL
        : 'https://api.homexpert.co.ke/auth';
      // Include phone/message in state so callback can auto-create waitlist if possible
      const normalizeKenyanPhone = (phone: string) => {
        const p = phone.trim();
        if (!p) return '';
        if (p.startsWith('+254')) return p;
        if (p.startsWith('254')) return `+254${p.slice(3)}`;
        if (p.startsWith('0')) return `+254${p.slice(1)}`;
        return p;
      };
      const statePayload = {
        phone: formData.phone ? normalizeKenyanPhone(formData.phone) : undefined,
        message: formData.message || undefined,
      };
      const state = encodeURIComponent(JSON.stringify(statePayload));
      const resp = await fetch(`${baseUrl}/api/v1/auth/google/url?flow=waitlist&state=${state}`);
      const data = await resp.json();
      if (data?.url) {
        window.location.href = data.url as string;
      } else {
        setError('Failed to start Google sign-in. Please try again.');
      }
    } catch (e) {
      setError('Network error starting Google sign-in.');
    }
  };

  const clearGooglePrefill = () => {
    setIsGooglePrefilled(false);
    setFormData(prev => ({ ...prev, email: '', first_name: '' }));
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
                    className="text-xl sm:text-2xl font-medium leading-7 text-gray-900"
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

                {/* Google Sign-In Option */}
                {isClient && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Continue with Google</p>
                    <div id="google-waitlist-button" className="flex justify-center"></div>
                    <div className="mt-3 flex justify-center">
                      <button
                        type="button"
                        onClick={startOAuthWaitlist}
                        className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                      >
                        <FcGoogle className="h-5 w-5 mr-2" />
                        Sign in with Google
                      </button>
                    </div>
                  </div>
                )}

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-2 bg-white text-sm text-gray-500">or fill the form</span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {!isGooglePrefilled ? (
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
                  ) : (
                    <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-4 py-3">
                      <div>
                        <p className="text-sm text-green-800">
                          Signed in with Google as <span className="font-semibold">{formData.first_name}</span>
                        </p>
                        <p className="text-xs text-green-700">{formData.email}</p>
                      </div>
                      <button type="button" onClick={clearGooglePrefill} className="text-xs text-green-800 underline">
                        Change
                      </button>
                    </div>
                  )}

                  {!isGooglePrefilled && (
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
                  )}

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
                      ref={phoneInputRef}
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
                      ref={messageRef}
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
