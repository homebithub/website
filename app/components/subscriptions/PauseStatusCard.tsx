import React from 'react';
import { ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import type { PauseStatusResponse } from '~/types/payments';
import { formatDate } from '~/utils/formatting/currency';

interface PauseStatusCardProps {
  pauseStatus: PauseStatusResponse;
  loading?: boolean;
  onResume: () => void;
}

export function PauseStatusCard({ pauseStatus, loading, onResume }: PauseStatusCardProps) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-[#13131a] rounded-2xl shadow-lg dark:shadow-glow-md border-2 border-purple-100 dark:border-purple-500/30 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!pauseStatus.is_paused) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-6 border-2 border-yellow-200 dark:border-yellow-700">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
            <ClockIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
              Subscription Paused
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Your subscription is currently paused
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Paused On</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {pauseStatus.paused_at ? formatDate(pauseStatus.paused_at) : 'N/A'}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Will Resume On</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {pauseStatus.resume_at ? formatDate(pauseStatus.resume_at) : 'N/A'}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Days Remaining</span>
          <span className="font-bold text-yellow-600 dark:text-yellow-400">
            {pauseStatus.days_remaining} days
          </span>
        </div>
      </div>

      <button
        onClick={onResume}
        className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-medium shadow-lg"
      >
        Resume Subscription Now
      </button>

      {/* Pause History */}
      {pauseStatus.history && pauseStatus.history.length > 0 && (
        <div className="mt-6 pt-6 border-t border-yellow-200 dark:border-yellow-800">
          <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Pause History
          </h5>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {pauseStatus.history.map((history) => (
              <div
                key={history.id}
                className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-lg text-xs"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatDate(history.paused_at)} - {formatDate(history.resume_at)}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 capitalize">
                    Reason: {history.pause_reason.replace('_', ' ')}
                  </p>
                </div>
                {history.status === 'resumed' && (
                  <CheckCircleIcon className="w-4 h-4 text-green-500" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
