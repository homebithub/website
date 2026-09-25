export type ThemePreference = 'system' | 'light' | 'dark';
export type ThemeCollection = 'vivid' | 'refined';
export type Appearance = { theme: ThemePreference; theme_collection: ThemeCollection };

export const normalizeAppearance = (value: Partial<Appearance> = {}): Appearance => ({
  theme: value.theme === 'light' || value.theme === 'dark' ? value.theme : 'system',
  theme_collection: value.theme_collection === 'refined' ? 'refined' : 'vivid',
});

// Shared by the blocking bootstrap and React to avoid a flash of another collection.
export const appearanceBootstrap = `(function(){var p='system',c='vivid';try{p=localStorage.getItem('themePreference')||'system';c=localStorage.getItem('themeCollection')||'vivid'}catch(e){}var d=p==='dark'||(p!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);document.documentElement.dataset.themeCollection=c==='refined'?'refined':'vivid'})()`;
