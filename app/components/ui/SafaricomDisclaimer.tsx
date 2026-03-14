import React from 'react';

/**
 * Disclaimer banner informing users to use Safaricom phone numbers for OTP.
 */
export function SafaricomDisclaimer({ className = '' }: { className?: string }) {
  return (
    <div className={`rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700/40 px-4 py-3 ${className}`}>
      <div className="flex items-start gap-2.5">
        <span className="text-lg mt-0.5 shrink-0">📱</span>
        <p className="text-sm text-green-800 dark:text-green-300 leading-snug">
          <span className="font-semibold">Please use a Safaricom number</span> to receive your OTP.
          <span className="text-green-600 dark:text-green-400"> Airtel and Telkom will be supported soon.</span>
        </p>
      </div>
    </div>
  );
}
