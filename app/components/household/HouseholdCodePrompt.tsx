import { useState } from 'react';
import { validateInviteCode } from '~/utils/householdApi';

interface HouseholdCodePromptProps {
  onJoinExisting: (code: string) => void;
  onCreateNew: () => void;
  loading?: boolean;
}

export function HouseholdCodePrompt({
  onJoinExisting,
  onCreateNew,
  loading = false,
}: HouseholdCodePromptProps) {
  const [inviteCode, setInviteCode] = useState('');
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<{
    household_name: string;
    role: string;
  } | null>(null);

  const handleValidateCode = async () => {
    if (!inviteCode.trim()) {
      setError('Please enter an invite code');
      return;
    }

    setValidating(true);
    setError(null);

    try {
      const result = await validateInviteCode(inviteCode.trim().toUpperCase());
      setValidationResult({
        household_name: result.household_name,
        role: result.role,
      });
    } catch (err: any) {
      setError(err.message || 'Invalid invite code');
      setValidationResult(null);
    } finally {
      setValidating(false);
    }
  };

  const handleJoin = () => {
    if (validationResult) {
      onJoinExisting(inviteCode.trim().toUpperCase());
    }
  };

  const formatInviteCode = (value: string) => {
    // Remove non-alphanumeric characters
    const cleaned = value.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    
    // Format as HH-XXXX-XXXX
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 6) return `${cleaned.slice(0, 2)}-${cleaned.slice(2)}`;
    return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 6)}-${cleaned.slice(6, 10)}`;
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatInviteCode(e.target.value);
    setInviteCode(formatted);
    setError(null);
    setValidationResult(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-8 bg-white dark:bg-[#13131a] rounded-2xl shadow-xl dark:shadow-glow border-2 border-purple-200 dark:border-purple-500/30">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
          Join or Create Household
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          Do you have a household invite code from a family member?
        </p>
      </div>

      {/* Join Existing Household Section */}
      <div className="mb-8 p-6 bg-purple-50 dark:bg-purple-900/20 rounded-xl border-2 border-purple-200 dark:border-purple-500/30">
        <h3 className="text-xl font-bold text-primary-600 dark:text-purple-400 mb-4 flex items-center">
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Join Existing Household
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-primary-600 dark:text-purple-400 mb-2">
              Enter Invite Code
            </label>
            <input
              type="text"
              value={inviteCode}
              onChange={handleCodeChange}
              placeholder="HH-XXXX-XXXX"
              maxLength={12}
              className="w-full h-14 text-xl font-mono text-center px-4 py-3 rounded-xl border-2 bg-white dark:bg-[#13131a] text-gray-900 dark:text-white border-purple-200 dark:border-purple-500/30 shadow-sm dark:shadow-inner-glow focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 uppercase"
              disabled={validating || loading}
            />
            {error && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-2 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </p>
            )}
            {validationResult && (
              <div className="mt-3 p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-500/30 rounded-lg">
                <p className="text-green-800 dark:text-green-300 font-semibold flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Valid Code!
                </p>
                <p className="text-green-700 dark:text-green-400 mt-1">
                  Household: <span className="font-bold">{validationResult.household_name}</span>
                </p>
                <p className="text-green-700 dark:text-green-400">
                  You'll join as: <span className="font-bold capitalize">{validationResult.role}</span>
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            {!validationResult ? (
              <button
                type="button"
                onClick={handleValidateCode}
                disabled={!inviteCode || validating || loading}
                className="flex-1 px-6 py-3 rounded-xl bg-purple-600 text-white font-bold text-lg shadow-lg hover:bg-purple-700 hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {validating ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Validating...
                  </span>
                ) : (
                  '🔍 Validate Code'
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleJoin}
                disabled={loading}
                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg shadow-lg hover:from-purple-700 hover:to-pink-700 hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '⏳ Joining...' : '✅ Join This Household'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t-2 border-gray-300 dark:border-gray-600"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white dark:bg-[#13131a] text-gray-500 dark:text-gray-400 font-bold uppercase">
            Or
          </span>
        </div>
      </div>

      {/* Create New Household Section */}
      <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 rounded-xl border-2 border-purple-200 dark:border-purple-500/30">
        <h3 className="text-xl font-bold text-primary-600 dark:text-purple-400 mb-4 flex items-center">
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create New Household
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Don't have a code? Create a new household profile and invite family members later.
        </p>
        <button
          type="button"
          onClick={onCreateNew}
          disabled={loading}
          className="w-full px-6 py-3 rounded-xl bg-white dark:bg-[#13131a] text-purple-600 dark:text-purple-400 font-bold text-lg border-2 border-purple-300 dark:border-purple-500/50 shadow-md hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          🏠 Create New Household
        </button>
      </div>

      {/* Help Text */}
      <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>
          💡 <span className="font-semibold">Tip:</span> If you're the first in your family to sign up, create a new household.
          You can invite others later!
        </p>
      </div>
    </div>
  );
}
