import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';

/**
 * Asks one question: did the work happen?
 *
 * Reached from an email, by someone who is probably not signed in and may be on a
 * slow phone. So it holds one question, three buttons, and nothing else — no
 * navigation, no upsell, nothing that competes with answering.
 *
 * The link that gets here carries no answer, only a token. Three answer-bearing
 * links in one email would be fired by the mail client's own prefetcher and record
 * an outcome nobody chose, which would corrupt the exact data this exists to
 * collect. Opening this page changes nothing; a button press is the write.
 */

type Prompt = {
  counterpart_name?: string;
  already_answered?: boolean;
  previous_answer?: string;
};

const ANSWERS: { value: string; label: string; hint: string }[] = [
  { value: 'started', label: 'Yes, they started', hint: 'The work went ahead' },
  { value: 'not_yet', label: 'Not yet', hint: 'Still going ahead, just not started' },
  { value: 'did_not_start', label: 'No, it fell through', hint: 'It is not going to happen' },
];

function describeAnswer(value?: string): string {
  return ANSWERS.find((answer) => answer.value === value)?.label ?? 'your answer';
}

export default function WorkOutcome() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';

  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('This link is missing its token. Please open the most recent email we sent you.');
      setLoading(false);
      return;
    }

    let cancelled = false;
    fetch(`/api/work-outcome?token=${encodeURIComponent(token)}`)
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (cancelled) return;
        if (!response.ok) {
          setError(payload?.message || 'This link is no longer valid.');
          return;
        }
        const data = (payload?.data ?? payload) as Prompt;
        setPrompt(data);
        // A link opened twice should acknowledge the earlier answer rather than
        // silently asking again, which reads as the first press not having worked.
        if (data?.already_answered) setSaved(data.previous_answer || '');
      })
      .catch(() => {
        if (!cancelled) setError('We could not load this page. Please check your connection.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const answer = useCallback(
    async (response: string) => {
      setSaving(response);
      setError(null);
      try {
        const result = await fetch('/api/work-outcome', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, response }),
        });
        const payload = await result.json().catch(() => ({}));
        if (!result.ok) {
          setError(payload?.message || 'We could not record that.');
          return;
        }
        setSaved(response);
      } catch {
        setError('We could not reach us just now. Please try again.');
      } finally {
        setSaving(null);
      }
    },
    [token],
  );

  const who = prompt?.counterpart_name || 'the other person';

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50 px-4 py-12 dark:from-[#0a0a0f] dark:via-[#13131a] dark:to-[#0a0a0f]">
      <div className="w-full max-w-md rounded-3xl border border-purple-200/60 bg-white p-7 shadow-xl dark:border-purple-500/25 dark:bg-[#13131a]">
        <p className="text-xs font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-400">
          Homebit
        </p>

        {loading && (
          <p className="mt-5 text-sm text-gray-500 dark:text-gray-400">Loading…</p>
        )}

        {!loading && error && (
          <>
            <h1 className="mt-3 text-lg font-bold text-gray-900 dark:text-white">
              This link isn’t working
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{error}</p>
          </>
        )}

        {!loading && !error && saved !== null && (
          <>
            <h1 className="mt-3 text-lg font-bold text-gray-900 dark:text-white">Thank you</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              You told us: <strong>{describeAnswer(saved)}</strong>. That’s all we needed — you can
              close this page.
            </p>
            {saved === 'started' && (
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
                You can now leave {who} a review from your Homebit account.
              </p>
            )}
          </>
        )}

        {!loading && !error && saved === null && (
          <>
            <h1 className="mt-3 text-lg font-bold leading-snug text-gray-900 dark:text-white">
              Did {who} start work?
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              One tap, and we won’t ask again. It helps us keep reviews honest.
            </p>

            <div className="mt-6 flex flex-col gap-2.5">
              {ANSWERS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => answer(option.value)}
                  disabled={saving !== null}
                  className="group flex w-full items-center justify-between gap-3 rounded-xl border-2 border-purple-200 bg-white px-4 py-3 text-left transition hover:border-purple-400 hover:bg-purple-50 disabled:opacity-50 dark:border-purple-500/30 dark:bg-[#0f0f16] dark:hover:border-purple-400/60 dark:hover:bg-purple-950/30"
                >
                  <span>
                    <span className="block text-sm font-semibold text-gray-900 dark:text-white">
                      {option.label}
                    </span>
                    <span className="block text-xs text-gray-500 dark:text-gray-400">
                      {option.hint}
                    </span>
                  </span>
                  {saving === option.value && (
                    <span className="text-xs text-purple-600 dark:text-purple-300">Saving…</span>
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export { ErrorBoundary } from '~/components/ErrorBoundary';
