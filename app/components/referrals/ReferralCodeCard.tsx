import { useEffect, useState } from "react";
import { Check, Copy, Gift, Share2 } from "lucide-react";
import { fetchMyReferralCode, type MyReferralCode } from "~/services/referrals";

/**
 * Your referral code, and the three ways people actually pass one on.
 *
 * Copy for anywhere, the phone's own share sheet where there is one, and
 * WhatsApp explicitly — which is how this market shares things, and where a
 * prefilled message beats a bare link every time.
 *
 * On the household profile this sits near the household code, which is a
 * different thing entirely: that one adds a partner to this household, this one
 * invites strangers to Homebit. Two codes on one screen is a good way to have
 * the wrong one sent to the wrong person, so `distinguishFrom` names the
 * neighbour in plain words rather than leaving the reader to work it out.
 */
export function ReferralCodeCard({
  distinguishFrom = "",
  className = "",
}: {
  distinguishFrom?: string;
  className?: string;
}) {
  const [referral, setReferral] = useState<MyReferralCode | null>(null);
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    fetchMyReferralCode()
      .then(setReferral)
      .catch(() => setReferral(null));
    setCanShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  // No campaign running means nothing to share and nothing to explain. An empty
  // card promising a reward that does not exist is worse than no card.
  if (!referral?.available || !referral.code) return null;

  const link =
    typeof window === "undefined"
      ? ""
      : `${window.location.origin}/signup?ref=${encodeURIComponent(referral.code)}`;

  const message = `${referral.benefit || "Join me on Homebit."} Use my code ${referral.code}: ${link}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${referral.code} — ${link}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked. The code is on screen and selectable, which is the
      // fallback everybody already knows.
    }
  };

  const share = async () => {
    try {
      await navigator.share({ title: "Join me on Homebit", text: message, url: link });
    } catch {
      // Cancelled, or the sheet refused. Nothing to report — they chose not to.
    }
  };

  return (
    <div
      className={`bg-white dark:bg-[#13131a] p-6 border-t border-purple-200/40 dark:border-purple-500/30 ${className}`}
    >
      <div className="mb-4">
        <h2 className="text-xs font-semibold text-purple-700 dark:text-purple-400">
          🎁 Your Referral Code
        </h2>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          {referral.benefit || "Invite someone to Homebit and you both get something."}
          {distinguishFrom ? ` This is not your ${distinguishFrom} — it invites new people to Homebit.` : ""}
        </p>
      </div>

      <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-500/30 rounded-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
              Share this code:
            </p>
            <p className="text-lg font-bold text-purple-900 dark:text-purple-100 tracking-[0.2em] font-mono">
              {referral.code}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void copy()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-semibold hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-all"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied" : "Copy"}
            </button>

            <a
              href={`https://wa.me/?text=${encodeURIComponent(message)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-all"
            >
              <Gift className="w-4 h-4" />
              WhatsApp
            </a>

            {canShare && (
              <button
                type="button"
                onClick={() => void share()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
