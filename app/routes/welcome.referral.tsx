import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { ArrowRight, CheckCircle2, Gift, Loader2 } from "lucide-react";
import {
  fetchMyReferralCode,
  redeemReferralCode,
  takePendingCode,
  type RedeemOutcome,
} from "~/services/referrals";

/**
 * "Were you invited by someone?"
 *
 * Asked here rather than on the signup form, where it used to sit as an
 * optional field at the bottom. Asking before the person has an account is
 * asking before they have seen what they joined — and an optional field at the
 * end of a long form is a field nobody reads. Here it is the only question on
 * the screen, and the offer it carries is worth reading.
 *
 * Skipping is a first-class answer. Most people were not invited by anyone, and
 * making them feel they are missing something they never had is a poor way to
 * begin. There is no second ask.
 */
export default function WelcomeReferral() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next") || "/";

  const [code, setCode] = useState("");
  const [benefit, setBenefit] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [outcome, setOutcome] = useState<RedeemOutcome | null>(null);

  useEffect(() => {
    // Someone who arrived through an invite link already gave us the code;
    // typing it again would be a strange thing to ask of them.
    setCode(takePendingCode());

    // What a code is worth comes from the live campaign, so changing the offer
    // changes this sentence with no deploy. If there is no campaign running,
    // there is nothing to ask about — move on rather than showing an empty
    // question.
    fetchMyReferralCode()
      .then((mine) => {
        if (!mine.available) {
          navigate(next, { replace: true });
          return;
        }
        setBenefit(mine.invitee_benefit || "");
      })
      .catch(() => {
        // The prompt is optional by nature; a failed lookup should not trap
        // anybody on it.
        setBenefit("");
      });
  }, [navigate, next]);

  const apply = useCallback(async () => {
    const entered = code.trim();
    if (!entered) return;
    setSubmitting(true);
    setError("");
    try {
      setOutcome(await redeemReferralCode(entered));
    } catch (failure: any) {
      setError(failure?.message || "We could not apply that code.");
    } finally {
      setSubmitting(false);
    }
  }, [code]);

  const goOn = () => navigate(next, { replace: true });

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-10">
      <div className="rounded-3xl border border-purple-200 bg-white p-6 shadow-xl dark:border-purple-500/30 dark:bg-[#111018]">
        {outcome ? (
          <>
            <h1 className="flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-white">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" aria-hidden="true" />
              Code applied
            </h1>
            {outcome.message && (
              <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-white/70">{outcome.message}</p>
            )}

            {outcome.outstanding.length > 0 && (
              <div className="mt-4 rounded-2xl border border-purple-100 bg-purple-50/60 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                <p className="text-xs font-semibold text-gray-900 dark:text-white">
                  {outcome.outstanding.length === 1 ? "One step to unlock it" : "To unlock it"}
                </p>
                <ul className="mt-2 space-y-1.5">
                  {outcome.outstanding.map((step) => (
                    <li key={step} className="flex gap-2 text-xs leading-5 text-gray-600 dark:text-white/65">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-500" />
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              type="button"
              onClick={goOn}
              className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 text-sm font-semibold text-white shadow-lg shadow-purple-950/40 transition hover:from-purple-500 hover:to-pink-500"
            >
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          </>
        ) : (
          <>
            <span className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-100 px-3 py-1 text-[10px] font-bold tracking-[0.16em] text-purple-700 dark:border-purple-400/25 dark:bg-purple-500/10 dark:text-purple-200">
              <Gift className="h-3.5 w-3.5" />
              WELCOME TO HOMEBIT
            </span>

            <h1 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
              Did someone invite you?
            </h1>
            <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-white/65">
              {benefit
                ? `Enter their code and ${benefit.charAt(0).toLowerCase()}${benefit.slice(1)}`
                : "If you have a referral code, enter it here to claim what it is worth."}
            </p>

            <label htmlFor="referral-code" className="sr-only">
              Referral code
            </label>
            <input
              id="referral-code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === "Enter") void apply();
              }}
              placeholder="ABCD1234"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              className="mt-5 w-full rounded-xl border border-purple-200 bg-white px-4 py-3 text-center text-lg font-semibold tracking-[0.2em] text-gray-900 placeholder:text-gray-300 focus:border-purple-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/20"
            />

            {error && (
              <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={() => void apply()}
              disabled={!code.trim() || submitting}
              className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 text-sm font-semibold text-white shadow-lg shadow-purple-950/40 transition hover:from-purple-500 hover:to-pink-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {submitting ? "Applying…" : "Apply code"}
            </button>

            <button
              type="button"
              onClick={goOn}
              className="mt-3 w-full text-center text-xs font-semibold text-gray-500 underline underline-offset-2 hover:text-gray-700 dark:text-white/50 dark:hover:text-white/80"
            >
              I wasn&apos;t invited — skip
            </button>
          </>
        )}
      </div>
    </main>
  );
}
