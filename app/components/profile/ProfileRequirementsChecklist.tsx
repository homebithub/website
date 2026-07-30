import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import type { MissingRequirement } from '~/hooks/useOnboardingProgress';
import { profileFeatureLabel } from '~/utils/profileFeatures';

type ProfileRequirementsChecklistProps = {
  missing: MissingRequirement[];
  completedItems?: number;
  totalItems?: number;
  percentage?: number;
  /** Invoked with the requirement's action so the page opens the right editor. */
  onResolve: (requirement: MissingRequirement) => void;
};

/**
 * Lists what is still required for a 100% profile.
 *
 * A percentage alone tells someone they are unfinished without telling them
 * what to do, and the aggregate "profile features" count hides which of
 * several catalogue features is unanswered. Each row names one requirement and
 * links to the editor that satisfies it.
 */
export function ProfileRequirementsChecklist({
  missing,
  completedItems,
  totalItems,
  percentage,
  onResolve,
}: ProfileRequirementsChecklistProps) {
  const complete = missing.length === 0;

  return (
    <div className="bg-white p-6 border-t border-purple-200/40 dark:bg-[#13131a] dark:border-purple-500/30">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-xs font-semibold text-purple-700 dark:text-purple-400">
            {complete ? '✅ Profile complete' : '📝 What’s left to complete'}
          </h2>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
            {complete
              ? 'Every requirement is met. Your profile is fully visible to the people you want to reach.'
              : 'Finish these to reach 100%. A complete profile is easier for the right people to find.'}
          </p>
        </div>
        {typeof completedItems === 'number' && typeof totalItems === 'number' && (
          <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
            {completedItems} of {totalItems}
            {typeof percentage === 'number' ? ` · ${percentage}%` : ''}
          </span>
        )}
      </div>

      {complete ? (
        <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-xs font-medium text-green-800 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-300">
          <CheckCircleIcon className="h-4 w-4 shrink-0" />
          Nothing outstanding.
        </div>
      ) : (
        <ul className="space-y-2">
          {missing.map((requirement) => (
            <li key={requirement.id}>
              <button
                type="button"
                onClick={() => onResolve(requirement)}
                className="group flex w-full items-center justify-between gap-3 rounded-xl border border-purple-200 bg-purple-50/60 px-4 py-3 text-left transition hover:border-purple-400 hover:bg-purple-50 dark:border-purple-500/25 dark:bg-purple-950/20 dark:hover:border-purple-400/60 dark:hover:bg-purple-950/40"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span
                    className="h-4 w-4 shrink-0 rounded-full border-2 border-purple-400 dark:border-purple-500/60"
                    aria-hidden="true"
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-semibold text-gray-900 dark:text-white">
                      {requirement.action === 'features'
                        ? profileFeatureLabel(requirement.label)
                        : requirement.label}
                    </span>
                    <span className="block text-[11px] text-gray-500 dark:text-gray-400">
                      {describeAction(requirement.action)}
                    </span>
                  </span>
                </span>
                <ArrowRightIcon className="h-4 w-4 shrink-0 text-purple-500 transition-transform group-hover:translate-x-0.5 dark:text-purple-300" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function describeAction(action: string): string {
  switch (action) {
    case 'features':
      return 'Choose an option under Profile Choices';
    case 'location':
      return 'Add the ward where you are based';
    case 'photo':
      return 'Upload at least one photo';
    case 'verification':
      return 'Verify your identity with Smile ID';
    default:
      return 'Open to complete';
  }
}

export default ProfileRequirementsChecklist;
