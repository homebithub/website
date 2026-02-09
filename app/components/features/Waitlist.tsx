import React, { useEffect, useRef, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { FcGoogle } from 'react-icons/fc';
import { API_BASE_URL } from '~/config/api';

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
      const baseUrl = (typeof window !== 'undefined' && (window as any).ENV?.GATEWAY_API_BASE_URL)
        ? (window as any).ENV.GATEWAY_API_BASE_URL
        : API_BASE_URL;
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
      const baseUrl = (typeof window !== 'undefined' && (window as any).ENV?.GATEWAY_API_BASE_URL)
        ? (window as any).ENV.GATEWAY_API_BASE_URL
        : API_BASE_URL;
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
              <Dialog.Panel className="w-full max-w-lg sm:max-w-lg max-w-full transform overflow-hidden rounded-3xl bg-gradient-to-br from-purple-50 to-white dark:from-[#0a0a0f] dark:to-[#13131a] p-6 sm:p-10 text-left align-middle shadow-2xl dark:shadow-glow-lg border-2 border-purple-200 dark:border-purple-500/30 transition-all">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <Dialog.Title
                      as="h3"
                      className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
                    >
                      Join Our Waitlist 🎉
                    </Dialog.Title>
                    <button
                      type="button"
                      className="rounded-full p-2 text-purple-400 dark:text-purple-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
                      onClick={handleClose}
                      disabled={isSubmitting}
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                  <p className="text-sm text-purple-600 dark:text-purple-400">
                    Be the first to know when we launch! Get exclusive early access. ✨
                  </p>
                </div>

                {showSuccess && (
                  <div className="mb-6 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-700 p-5 shadow-md dark:shadow-glow-sm">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <span className="text-3xl">🎉</span>
                      </div>
                      <div className="ml-4">
                        <p className="text-base font-bold text-green-800 dark:text-green-300">
                          Successfully added to waitlist!
                        </p>
                        <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                          We'll notify you when Homebit is available. Check your email! 📧
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="mb-6 rounded-2xl bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-2 border-red-200 dark:border-red-700 p-5 shadow-md dark:shadow-glow-sm">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <span className="text-3xl">⚠️</span>
                      </div>
                      <div className="ml-4">
                        <p className="text-base font-semibold text-red-800 dark:text-red-300">
                          {error}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Google Sign-In Option */}
                {isClient && (
                  <div className="mb-6">
                    <p className="text-sm text-purple-700 dark:text-purple-400 font-medium mb-3 text-center">Quick signup with Google</p>
                    <div className="flex justify-center">
                      <button
                        type="button"
                        onClick={startOAuthWaitlist}
                        className="inline-flex items-center justify-center rounded-xl border-2 border-purple-200 dark:border-purple-500/50 bg-white dark:bg-[#13131a] px-6 py-1.5 text-base font-semibold text-gray-700 dark:text-gray-200 shadow-md dark:shadow-glow-sm hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-300 dark:hover:border-purple-500 hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                      >
                        <FcGoogle className="h-6 w-6 mr-3" />
                        Sign in with Google
                      </button>
                    </div>
                  </div>
                )}

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t-2 border-purple-200 dark:border-purple-500/30" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-4 bg-gradient-to-br from-purple-50 to-white dark:from-[#13131a] dark:to-[#0a0a0f] text-sm font-medium text-purple-600 dark:text-purple-400">or fill the form below</span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {!isGooglePrefilled ? (
                    <div>
                      <label htmlFor="first_name" className="block text-slate-900 dark:text-gray-200 mb-1 font-medium">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="first_name"
                        id="first_name"
                        required
                        value={formData.first_name}
                        onChange={handleInputChange}
                        className="auth-input"
                        placeholder="Enter your first name"
                        disabled={isSubmitting}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-between rounded-xl border border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20 px-4 py-1.5">
                      <div>
                        <p className="text-sm text-green-800 dark:text-green-300">
                          Signed in with Google as <span className="font-semibold">{formData.first_name}</span>
                        </p>
                        <p className="text-xs text-green-700 dark:text-green-400">{formData.email}</p>
                      </div>
                      <button type="button" onClick={clearGooglePrefill} className="text-xs text-green-800 dark:text-green-300 underline">
                        Change
                      </button>
                    </div>
                  )}

                  {!isGooglePrefilled && (
                    <div>
                      <label htmlFor="email" className="block text-slate-900 dark:text-gray-200 mb-1 font-medium">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="auth-input"
                        placeholder="Enter your email"
                        disabled={isSubmitting}
                      />
                    </div>
                  )}

                  <div>
                    <label htmlFor="phone" className="block text-slate-900 dark:text-gray-200 mb-1 font-medium">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="auth-input"
                      placeholder="0712345678"
                      disabled={isSubmitting}
                      ref={phoneInputRef}
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-slate-900 dark:text-gray-200 mb-1 font-medium">
                      Message
                    </label>
                    <textarea
                      name="message"
                      id="message"
                      rows={3}
                      value={formData.message}
                      onChange={handleInputChange}
                      className="auth-input min-h-[100px]"
                      placeholder="Anything else you would like to let us know?"
                      disabled={isSubmitting}
                      ref={messageRef}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-xl border-2 border-purple-200 dark:border-purple-500/50 bg-white dark:bg-[#13131a] px-6 py-1.5 text-base font-semibold text-purple-600 dark:text-purple-400 shadow-md dark:shadow-glow-sm hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-300 dark:hover:border-purple-500 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                      onClick={handleClose}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="glow-button inline-flex justify-center rounded-xl border-2 border-transparent bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-1.5 text-base font-bold text-white shadow-lg dark:shadow-glow-md hover:from-purple-700 hover:to-pink-700 dark:hover:shadow-glow-lg hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? '✨ Joining...' : '🚀 Join Waitlist'}
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
