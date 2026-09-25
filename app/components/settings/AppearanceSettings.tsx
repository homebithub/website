import { Check, Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from '~/contexts/ThemeContext';

export function AppearanceSettings({ localPreview = false }: { localPreview?: boolean }) {
  const { themeCollection, setThemeCollection, themePreference, setThemePreference,
    appearanceSyncStatus, retryAppearanceSync } = useTheme();
  return <section aria-labelledby="appearance-heading" className="rounded-2xl border border-purple-200/50 bg-white p-5 sm:p-6 shadow-sm dark:border-purple-500/30 dark:bg-[#13131a]">
    <h2 id="appearance-heading" className="text-base font-semibold text-gray-900 dark:text-white">Appearance</h2>
    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Choose a collection, then make it light or dark.</p>
    <div role="radiogroup" aria-label="Theme collection" className="mt-5 grid gap-4 sm:grid-cols-2">
      {([
        { value: 'vivid', label: 'Vivid', detail: 'Our original look. Expressive purple, pink gradients and a soft glow.' },
        { value: 'refined', label: 'Refined', detail: 'A quieter look. Solid purple, neutral surfaces and subtle borders.' },
      ] as const).map(option => <button key={option.value} type="button" role="radio"
        tabIndex={themeCollection === option.value ? 0 : -1}
        onKeyDown={event => {
          if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
          event.preventDefault();
          const next = event.key === 'Home' ? 'vivid' : event.key === 'End' ? 'refined' : option.value === 'vivid' ? 'refined' : 'vivid';
          setThemeCollection(next);
          event.currentTarget.parentElement?.querySelector<HTMLButtonElement>(`[aria-label="${next === 'vivid' ? 'Vivid' : 'Refined'} collection"]`)?.focus();
        }}
        aria-checked={themeCollection === option.value} aria-label={`${option.label} collection`}
        onClick={() => setThemeCollection(option.value)} className="appearance-choice">
        <span aria-hidden="true" className={`appearance-swatch appearance-swatch-${option.value}`}><span/><span/><span/></span>
        <span className="flex items-center justify-between font-semibold">{option.label}{themeCollection === option.value && <Check aria-hidden="true" size={18}/>}</span>
        <span className="mt-2 block text-xs leading-relaxed text-gray-500 dark:text-gray-400">{option.detail}</span>
      </button>)}
    </div>
    <fieldset className="mt-6">
      <legend className="mb-3 text-sm font-medium text-gray-900 dark:text-gray-100">Color mode</legend>
      <div className="flex flex-wrap gap-2">
        {([{ value: 'light', label: 'Light', Icon: Sun }, { value: 'dark', label: 'Dark', Icon: Moon },
          { value: 'system', label: 'Use device setting', Icon: Monitor }] as const).map(({ value, label, Icon }) =>
          <label key={value} className={`flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-3 text-xs ${themePreference === value ? 'border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300' : 'border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-300'}`}>
            <input type="radio" name="appearance-mode" value={value} checked={themePreference === value} onChange={() => setThemePreference(value)} className="accent-purple-600"/>
            <Icon size={16} aria-hidden="true"/>{label}
          </label>)}
      </div>
    </fieldset>
    <p role="status" className="mt-4 text-xs text-gray-500 dark:text-gray-400">
      {appearanceSyncStatus === 'local' && (localPreview ? 'Preview choice saved on this device.' : 'Saved on this device. Sign in to sync your appearance across devices.')}
      {appearanceSyncStatus === 'saving' && 'Saving your appearance…'}
      {appearanceSyncStatus === 'saved' && 'Saved to your account. Applies on your other devices when you open or return to HomeBit.'}
      {appearanceSyncStatus === 'error' && <>Your appearance is shown here, but account sync failed. <button type="button" onClick={retryAppearanceSync} className="font-semibold text-purple-600 dark:text-purple-300 underline">Retry saving</button></>}
    </p>
  </section>;
}
