import React from 'react';
import { Briefcase, CheckCircle, Clock, XCircle } from 'lucide-react';

interface HireContextBannerProps {
  hireRequestStatus?: string;
  hireRequestId?: string;
  onViewDetails?: () => void;
  onSendHireRequest?: () => void;
  userRole: 'household' | 'househelp';
}

export default function HireContextBanner({
  hireRequestStatus,
  hireRequestId,
  onViewDetails,
  onSendHireRequest,
  userRole,
}: HireContextBannerProps) {
  if (!hireRequestStatus && userRole === 'household') {
    // No hire request yet - show option to send one
    return (
      <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-3">
          <Briefcase className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-1">
              Ready to hire?
            </h4>
            <p className="text-sm text-purple-700 dark:text-purple-300 mb-3">
              Send a formal hire request with job details, salary, and schedule
            </p>
            <button
              onClick={onSendHireRequest}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 font-semibold transition-all shadow-lg hover:shadow-xl text-sm"
            >
              Send Hire Request
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!hireRequestStatus) {
    return null;
  }

  const getStatusConfig = () => {
    switch (hireRequestStatus) {
      case 'pending':
        return {
          icon: <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />,
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          textColor: 'text-yellow-900 dark:text-yellow-100',
          subTextColor: 'text-yellow-700 dark:text-yellow-300',
          title: userRole === 'household' ? 'Hire Request Pending' : 'Hire Request Received',
          message: userRole === 'household' 
            ? 'Waiting for response to your hire request'
            : 'You have a pending hire request. Review and respond.',
        };
      case 'accepted':
        return {
          icon: <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />,
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800',
          textColor: 'text-green-900 dark:text-green-100',
          subTextColor: 'text-green-700 dark:text-green-300',
          title: userRole === 'household' ? 'Hire Request Accepted!' : 'You Accepted This Request',
          message: userRole === 'household'
            ? 'Great! You can now create an employment contract.'
            : 'The household can now finalize the contract.',
        };
      case 'declined':
        return {
          icon: <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />,
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800',
          textColor: 'text-red-900 dark:text-red-100',
          subTextColor: 'text-red-700 dark:text-red-300',
          title: userRole === 'household' ? 'Hire Request Declined' : 'You Declined This Request',
          message: userRole === 'household'
            ? 'The househelp declined your hire request.'
            : 'You can discuss other opportunities.',
        };
      case 'finalized':
        return {
          icon: <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-800',
          textColor: 'text-blue-900 dark:text-blue-100',
          subTextColor: 'text-blue-700 dark:text-blue-300',
          title: 'Contract Created',
          message: 'An employment contract has been created for this hire request.',
        };
      default:
        return null;
    }
  };

  const config = getStatusConfig();
  if (!config) return null;

  return (
    <div className={`${config.bgColor} border ${config.borderColor} rounded-lg p-4 mb-4`}>
      <div className="flex items-start gap-3">
        {config.icon}
        <div className="flex-1">
          <h4 className={`font-semibold ${config.textColor} mb-1`}>
            {config.title}
          </h4>
          <p className={`text-sm ${config.subTextColor} mb-3`}>
            {config.message}
          </p>
          {onViewDetails && (
            <button
              onClick={onViewDetails}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors text-sm"
            >
              View Details
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
