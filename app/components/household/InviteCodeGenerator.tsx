import { useState } from 'react';
import { createInvitation, type HouseholdInvitation } from '~/utils/householdApi';

interface InviteCodeGeneratorProps {
  householdId: string;
  onInviteCreated?: (invitation: HouseholdInvitation) => void;
}

export function InviteCodeGenerator({
  householdId,
  onInviteCreated,
}: InviteCodeGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invitation, setInvitation] = useState<HouseholdInvitation | null>(null);
  const [copied, setCopied] = useState(false);

  // Form state
  const [role, setRole] = useState<'admin' | 'member'>('member');
  const [expiresInDays, setExpiresInDays] = useState(7);
  const [maxUses, setMaxUses] = useState(1);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);

    try {
      const newInvitation = await createInvitation(householdId, {
        role,
        expires_in_days: expiresInDays,
        max_uses: maxUses,
      });

      setInvitation(newInvitation);
      onInviteCreated?.(newInvitation);
    } catch (err: any) {
      setError(err.message || 'Failed to create invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (invitation) {
      navigator.clipboard.writeText(invitation.invite_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyLink = () => {
    if (invitation?.share_url) {
      navigator.clipboard.writeText(invitation.share_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setInvitation(null);
    setError(null);
    setRole('member');
    setExpiresInDays(7);
    setMaxUses(1);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="px-6 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold shadow-lg hover:from-purple-700 hover:to-pink-700 hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500"
      >
        <span className="flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Invite Family Member
        </span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#13131a] rounded-2xl shadow-2xl dark:shadow-glow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-purple-200 dark:border-purple-500/30">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <svg className="w-7 h-7 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Invite Family Member
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 rounded-xl p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          {!invitation ? (
            /* Generation Form */
            <div className="space-y-6">
              <p className="text-gray-600 dark:text-gray-300">
                Generate a unique invite code to share with your family member. They'll need to enter this code during signup.
              </p>

              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-500/30 rounded-xl">
                  <p className="text-red-800 dark:text-red-300 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                  </p>
                </div>
              )}

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-semibold text-primary-600 dark:text-purple-400 mb-3">
                  Member Role
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setRole('member')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      role === 'member'
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 shadow-md'
                        : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-500/50'
                    }`}
                  >
                    <div className="text-left">
                      <div className="font-bold text-gray-900 dark:text-white mb-1">Member</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Can manage househelps
                      </div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      role === 'admin'
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 shadow-md'
                        : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-500/50'
                    }`}
                  >
                    <div className="text-left">
                      <div className="font-bold text-gray-900 dark:text-white mb-1">Admin</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Can invite & manage members
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Expiry */}
              <div>
                <label className="block text-sm font-semibold text-primary-600 dark:text-purple-400 mb-2">
                  Expires In
                </label>
                <select
                  value={expiresInDays}
                  onChange={(e) => setExpiresInDays(Number(e.target.value))}
                  className="w-full h-12 px-4 py-3 rounded-xl border-2 bg-white dark:bg-[#13131a] text-gray-900 dark:text-white border-purple-200 dark:border-purple-500/30 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value={1}>1 day</option>
                  <option value={3}>3 days</option>
                  <option value={7}>7 days (recommended)</option>
                  <option value={14}>14 days</option>
                  <option value={30}>30 days</option>
                </select>
              </div>

              {/* Max Uses */}
              <div>
                <label className="block text-sm font-semibold text-primary-600 dark:text-purple-400 mb-2">
                  Maximum Uses
                </label>
                <select
                  value={maxUses}
                  onChange={(e) => setMaxUses(Number(e.target.value))}
                  className="w-full h-12 px-4 py-3 rounded-xl border-2 bg-white dark:bg-[#13131a] text-gray-900 dark:text-white border-purple-200 dark:border-purple-500/30 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value={1}>1 person (recommended)</option>
                  <option value={2}>2 people</option>
                  <option value={3}>3 people</option>
                  <option value={5}>5 people</option>
                </select>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full px-6 py-1 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg shadow-lg hover:from-purple-700 hover:to-pink-700 hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </span>
                ) : (
                  '✨ Generate Invite Code'
                )}
              </button>
            </div>
          ) : (
            /* Success View */
            <div className="space-y-6">
              <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-500/30 rounded-xl">
                <div className="text-3xl mb-3">🎉</div>
                <h3 className="text-2xl font-bold text-green-800 dark:text-green-300 mb-2">
                  Invite Code Generated!
                </h3>
                <p className="text-green-700 dark:text-green-400">
                  Share this code with your family member
                </p>
              </div>

              {/* Invite Code Display */}
              <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border-2 border-purple-300 dark:border-purple-500/50">
                <label className="block text-sm font-semibold text-primary-600 dark:text-purple-400 mb-3 text-center">
                  Invite Code
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex-1 text-center">
                    <div className="text-2xl font-mono font-bold text-purple-600 dark:text-purple-400 tracking-wider">
                      {invitation.invite_code}
                    </div>
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className="px-4 py-1.5 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500"
                    title="Copy code"
                  >
                    {copied ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-gray-600 dark:text-gray-400 mb-1">Role</div>
                  <div className="font-bold text-gray-900 dark:text-white capitalize">{invitation.role}</div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-gray-600 dark:text-gray-400 mb-1">Expires</div>
                  <div className="font-bold text-gray-900 dark:text-white">
                    {new Date(invitation.expires_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-gray-600 dark:text-gray-400 mb-1">Max Uses</div>
                  <div className="font-bold text-gray-900 dark:text-white">{invitation.max_uses}</div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-gray-600 dark:text-gray-400 mb-1">Used</div>
                  <div className="font-bold text-gray-900 dark:text-white">{invitation.uses_count}</div>
                </div>
              </div>

              {/* Share Options */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-500/30 rounded-xl">
                <div className="text-sm text-blue-800 dark:text-blue-300 mb-3 font-semibold">
                  💡 How to share:
                </div>
                <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-2">
                  <li className="flex items-start">
                    <span className="mr-2">📱</span>
                    <span>Send the code via SMS or WhatsApp</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✉️</span>
                    <span>Email the code to your family member</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">💬</span>
                    <span>Tell them the code in person</span>
                  </li>
                </ul>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  className="flex-1 px-6 py-1.5 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  Generate Another
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-6 py-1.5 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
