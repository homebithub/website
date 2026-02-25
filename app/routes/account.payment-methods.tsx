import { useNavigate, useLocation } from "react-router";
import React, { useEffect, useState, Fragment } from "react";
import { Dialog, Transition } from '@headlessui/react';
import { 
  CreditCardIcon,
  XMarkIcon,
  PlusIcon,
  CheckCircleIcon,
  TrashIcon,
  PencilIcon,
  DevicePhoneMobileIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { Navigation } from "~/components/Navigation";
import { ErrorAlert } from '~/components/ui/ErrorAlert';
import { SuccessAlert } from '~/components/ui/SuccessAlert';
import { PurpleThemeWrapper } from '~/components/layout/PurpleThemeWrapper';
import { Footer } from "~/components/Footer";
import { useAuth } from "~/contexts/useAuth";
import { Loading } from "~/components/Loading";
import {
  listPaymentMethods,
  addPaymentMethod,
  setDefaultPaymentMethod,
  updatePaymentMethodNickname,
  deletePaymentMethod,
} from '~/utils/api/paymentMethods';
import type { PaymentMethod, AddPaymentMethodRequest } from '~/types/payments';
import { validatePhoneNumber, validateNickname, formatPhoneNumber } from '~/utils/validation/payments';
import { formatDate } from '~/utils/formatting/currency';

export default function PaymentMethodsPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // State
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [deletingMethod, setDeletingMethod] = useState<PaymentMethod | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [processingAction, setProcessingAction] = useState(false);
  
  // Add payment method form state
  const [addForm, setAddForm] = useState({
    type: 'mpesa' as const,
    phone_number: '',
    nickname: '',
    is_default: false,
  });
  const [addFormErrors, setAddFormErrors] = useState<Record<string, string>>({});
  
  // Edit nickname form state
  const [editNickname, setEditNickname] = useState('');
  const [editNicknameError, setEditNicknameError] = useState('');

  // Fetch payment methods
  const fetchPaymentMethods = React.useCallback(async () => {
    setDataLoading(true);
    setErrorMessage('');
    try {
      const methods = await listPaymentMethods();
      setPaymentMethods(methods);
    } catch (error) {
      console.error('Failed to fetch payment methods:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to load payment methods');
    } finally {
      setDataLoading(false);
    }
  }, []);

  // Auth check
  useEffect(() => {
    if (!loading && !user) {
      const returnUrl = encodeURIComponent(location.pathname);
      navigate(`/login?redirect=${returnUrl}`);
    }
  }, [user, loading, navigate, location.pathname]);

  // Fetch data on mount
  useEffect(() => {
    if (user) {
      fetchPaymentMethods();
    }
  }, [user, fetchPaymentMethods]);

  // Handle add payment method
  const handleAddPaymentMethod = async () => {
    // Validate form
    const errors: Record<string, string> = {};
    
    if (addForm.type === 'mpesa') {
      const phoneError = validatePhoneNumber(addForm.phone_number);
      if (phoneError) errors.phone_number = phoneError;
    }
    
    const nicknameError = validateNickname(addForm.nickname);
    if (nicknameError) errors.nickname = nicknameError;
    
    if (Object.keys(errors).length > 0) {
      setAddFormErrors(errors);
      return;
    }
    
    setProcessingAction(true);
    setErrorMessage('');
    
    try {
      const request: AddPaymentMethodRequest = {
        type: addForm.type,
        phone_number: formatPhoneNumber(addForm.phone_number),
        nickname: addForm.nickname || undefined,
        is_default: addForm.is_default,
      };
      
      await addPaymentMethod(request);
      setSuccessMessage('Payment method added successfully');
      setShowAddModal(false);
      setAddForm({
        type: 'mpesa',
        phone_number: '',
        nickname: '',
        is_default: false,
      });
      setAddFormErrors({});
      await fetchPaymentMethods();
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      console.error('Failed to add payment method:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to add payment method');
    } finally {
      setProcessingAction(false);
    }
  };

  // Handle set default
  const handleSetDefault = async (methodId: string) => {
    setProcessingAction(true);
    setErrorMessage('');
    
    try {
      await setDefaultPaymentMethod(methodId);
      setSuccessMessage('Default payment method updated');
      await fetchPaymentMethods();
      
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      console.error('Failed to set default:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to set default payment method');
    } finally {
      setProcessingAction(false);
    }
  };

  // Handle update nickname
  const handleUpdateNickname = async () => {
    if (!editingMethod) return;
    
    const error = validateNickname(editNickname);
    if (error) {
      setEditNicknameError(error);
      return;
    }
    
    setProcessingAction(true);
    setErrorMessage('');
    
    try {
      await updatePaymentMethodNickname(editingMethod.id, { nickname: editNickname });
      setSuccessMessage('Nickname updated successfully');
      setEditingMethod(null);
      setEditNickname('');
      setEditNicknameError('');
      await fetchPaymentMethods();
      
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      console.error('Failed to update nickname:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to update nickname');
    } finally {
      setProcessingAction(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deletingMethod) return;
    
    setProcessingAction(true);
    setErrorMessage('');
    
    try {
      await deletePaymentMethod(deletingMethod.id);
      setSuccessMessage('Payment method removed successfully');
      setDeletingMethod(null);
      await fetchPaymentMethods();
      
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      console.error('Failed to delete payment method:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to remove payment method');
    } finally {
      setProcessingAction(false);
    }
  };

  // Get payment method icon
  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case 'mpesa':
        return <DevicePhoneMobileIcon className="w-6 h-6" />;
      case 'card':
        return <CreditCardIcon className="w-6 h-6" />;
      default:
        return <CreditCardIcon className="w-6 h-6" />;
    }
  };

  // Get masked display
  const getMaskedDisplay = (method: PaymentMethod) => {
    if (method.type === 'mpesa' && method.phone_number) {
      return method.phone_number;
    }
    if (method.type === 'card' && method.card_last4) {
      return `•••• ${method.card_last4}`;
    }
    return 'N/A';
  };

  if (loading) {
    return <Loading text="Checking authentication..." />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <PurpleThemeWrapper variant="light" bubbles={false} bubbleDensity="low" className="flex-1">
        <main className="flex-1 flex flex-col justify-center items-center px-4 py-8">
          <div className="w-full max-w-6xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                  <CreditCardIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Payment Methods
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Manage your saved payment methods
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:from-purple-700 hover:to-pink-700 transition-all"
              >
                <PlusIcon className="w-5 h-5" />
                Add Payment Method
              </button>
            </div>

            {/* Success/Error Messages */}
            {successMessage && <SuccessAlert message={successMessage} className="mb-4" />}
            {errorMessage && <ErrorAlert message={errorMessage} className="mb-4" />}

            {/* Payment Methods Grid */}
            {dataLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              </div>
            ) : paymentMethods.length === 0 ? (
              <div className="bg-white dark:bg-[#13131a] rounded-2xl shadow-lg dark:shadow-glow-md border-2 border-purple-100 dark:border-purple-500/30 p-12 text-center">
                <CreditCardIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No Payment Methods
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Add a payment method to get started with subscriptions
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:from-purple-700 hover:to-pink-700 transition-all"
                >
                  <PlusIcon className="w-5 h-5" />
                  Add Payment Method
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className="bg-white dark:bg-[#13131a] rounded-2xl shadow-lg dark:shadow-glow-md border-2 border-purple-100 dark:border-purple-500/30 p-6 hover:border-purple-300 dark:hover:border-purple-400 transition-all"
                  >
                    {/* Card Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                          {getPaymentMethodIcon(method.type)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                            {method.type}
                          </p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {getMaskedDisplay(method)}
                          </p>
                        </div>
                      </div>
                      {method.is_default && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          <CheckCircleIcon className="w-3.5 h-3.5" />
                          Default
                        </span>
                      )}
                    </div>

                    {/* Nickname */}
                    {method.nickname && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                        {method.nickname}
                      </p>
                    )}

                    {/* Last Used */}
                    {method.last_used_at && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                        Last used: {formatDate(method.last_used_at)}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                      {!method.is_default && (
                        <button
                          onClick={() => handleSetDefault(method.id)}
                          disabled={processingAction}
                          className="flex-1 px-3 py-1.5 text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors disabled:opacity-50"
                        >
                          Set Default
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setEditingMethod(method);
                          setEditNickname(method.nickname || '');
                          setEditNicknameError('');
                        }}
                        disabled={processingAction}
                        className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                        aria-label="Edit nickname"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingMethod(method)}
                        disabled={processingAction}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                        aria-label="Delete payment method"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </PurpleThemeWrapper>
      <Footer />

      {/* Add Payment Method Modal */}
      <Transition appear show={showAddModal} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => !processingAction && setShowAddModal(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-xl transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <Dialog.Title className="text-xl font-bold text-gray-900 dark:text-white">
                      Add Payment Method
                    </Dialog.Title>
                    <button
                      onClick={() => !processingAction && setShowAddModal(false)}
                      disabled={processingAction}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
                    >
                      <XMarkIcon className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Type Selector */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Payment Type
                      </label>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setAddForm({ ...addForm, type: 'mpesa' })}
                          className={`flex-1 p-3 rounded-xl border-2 transition-all ${
                            addForm.type === 'mpesa'
                              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                              : 'border-gray-300 dark:border-gray-600 hover:border-purple-300'
                          }`}
                        >
                          <DevicePhoneMobileIcon className="w-6 h-6 mx-auto mb-1 text-purple-600 dark:text-purple-400" />
                          <p className="text-sm font-medium text-gray-900 dark:text-white">M-Pesa</p>
                        </button>
                        <button
                          onClick={() => setAddForm({ ...addForm, type: 'card' })}
                          disabled
                          className="flex-1 p-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 opacity-50 cursor-not-allowed"
                        >
                          <CreditCardIcon className="w-6 h-6 mx-auto mb-1 text-gray-400" />
                          <p className="text-sm font-medium text-gray-400">Card (Soon)</p>
                        </button>
                      </div>
                    </div>

                    {/* Phone Number */}
                    {addForm.type === 'mpesa' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          M-Pesa Phone Number
                        </label>
                        <input
                          type="tel"
                          value={addForm.phone_number}
                          onChange={(e) => {
                            setAddForm({ ...addForm, phone_number: e.target.value });
                            setAddFormErrors({ ...addFormErrors, phone_number: '' });
                          }}
                          placeholder="+254712345678"
                          className={`w-full px-4 py-2 border-2 rounded-xl focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900/30 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                            addFormErrors.phone_number
                              ? 'border-red-500 focus:border-red-500'
                              : 'border-gray-300 dark:border-gray-600 focus:border-purple-500'
                          }`}
                        />
                        {addFormErrors.phone_number && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                            {addFormErrors.phone_number}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Enter number in format: +254XXXXXXXXX
                        </p>
                      </div>
                    )}

                    {/* Nickname */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nickname (Optional)
                      </label>
                      <input
                        type="text"
                        value={addForm.nickname}
                        onChange={(e) => {
                          setAddForm({ ...addForm, nickname: e.target.value });
                          setAddFormErrors({ ...addFormErrors, nickname: '' });
                        }}
                        placeholder="e.g., Personal M-Pesa"
                        maxLength={50}
                        className={`w-full px-4 py-2 border-2 rounded-xl focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900/30 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                          addFormErrors.nickname
                            ? 'border-red-500 focus:border-red-500'
                            : 'border-gray-300 dark:border-gray-600 focus:border-purple-500'
                        }`}
                      />
                      {addFormErrors.nickname && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {addFormErrors.nickname}
                        </p>
                      )}
                    </div>

                    {/* Set as Default */}
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="is_default"
                        checked={addForm.is_default}
                        onChange={(e) => setAddForm({ ...addForm, is_default: e.target.checked })}
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <label htmlFor="is_default" className="text-sm text-gray-700 dark:text-gray-300">
                        Set as default payment method
                      </label>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={() => !processingAction && setShowAddModal(false)}
                        disabled={processingAction}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddPaymentMethod}
                        disabled={processingAction || !addForm.phone_number}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                      >
                        {processingAction ? 'Adding...' : 'Add Payment Method'}
                      </button>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Edit Nickname Modal */}
      <Transition appear show={editingMethod !== null} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => !processingAction && setEditingMethod(null)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-xl transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <Dialog.Title className="text-xl font-bold text-gray-900 dark:text-white">
                      Edit Nickname
                    </Dialog.Title>
                    <button
                      onClick={() => !processingAction && setEditingMethod(null)}
                      disabled={processingAction}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
                    >
                      <XMarkIcon className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nickname
                      </label>
                      <input
                        type="text"
                        value={editNickname}
                        onChange={(e) => {
                          setEditNickname(e.target.value);
                          setEditNicknameError('');
                        }}
                        placeholder="e.g., Personal M-Pesa"
                        maxLength={50}
                        className={`w-full px-4 py-2 border-2 rounded-xl focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900/30 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                          editNicknameError
                            ? 'border-red-500 focus:border-red-500'
                            : 'border-gray-300 dark:border-gray-600 focus:border-purple-500'
                        }`}
                      />
                      {editNicknameError && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {editNicknameError}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={() => !processingAction && setEditingMethod(null)}
                        disabled={processingAction}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleUpdateNickname}
                        disabled={processingAction}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                      >
                        {processingAction ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Delete Confirmation Modal */}
      <Transition appear show={deletingMethod !== null} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => !processingAction && setDeletingMethod(null)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-xl transition-all">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex-shrink-0 p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                      <ExclamationTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="flex-1">
                      <Dialog.Title className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        Remove Payment Method
                      </Dialog.Title>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Are you sure you want to remove this payment method?
                      </p>
                      {deletingMethod && (
                        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {getMaskedDisplay(deletingMethod)}
                          </p>
                          {deletingMethod.nickname && (
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {deletingMethod.nickname}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => !processingAction && setDeletingMethod(null)}
                      disabled={processingAction}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={processingAction}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      {processingAction ? 'Removing...' : 'Remove'}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}

export { ErrorBoundary } from "~/components/ErrorBoundary";
