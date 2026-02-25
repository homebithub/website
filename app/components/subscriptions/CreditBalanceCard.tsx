import React from 'react';
import { WalletIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

interface CreditBalanceCardProps {
  creditBalance: number;
  formatted: string;
  loading?: boolean;
}

export function CreditBalanceCard({ creditBalance, formatted, loading }: CreditBalanceCardProps) {
  if (loading) {
    return (
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-700">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
        </div>
      </div>
    );
  }

  const hasCredit = creditBalance > 0;

  return (
    <div className={`rounded-xl p-6 border ${
      hasCredit
        ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700'
        : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${
            hasCredit
              ? 'bg-green-100 dark:bg-green-900/30'
              : 'bg-gray-200 dark:bg-gray-700'
          }`}>
            <WalletIcon className={`w-6 h-6 ${
              hasCredit
                ? 'text-green-600 dark:text-green-400'
                : 'text-gray-400'
            }`} />
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Credit Balance
            </h4>
            <p className={`text-2xl font-bold ${
              hasCredit
                ? 'text-green-600 dark:text-green-400'
                : 'text-gray-500 dark:text-gray-400'
            }`}>
              {formatted}
            </p>
          </div>
        </div>

        <div className="group relative">
          <InformationCircleIcon className="w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-help" />
          <div className="absolute right-0 top-6 w-64 p-3 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
            Credits from downgrades and cancellations. Automatically applied to your next payment.
          </div>
        </div>
      </div>

      {hasCredit && (
        <p className="mt-3 text-sm text-green-700 dark:text-green-400">
          Will be applied to your next payment
        </p>
      )}

      {!hasCredit && (
        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
          No credits available
        </p>
      )}
    </div>
  );
}
