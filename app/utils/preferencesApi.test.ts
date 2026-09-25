import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
const service = vi.hoisted(() => ({ getPreferences: vi.fn(), updatePreferences: vi.fn() }));
const identity = vi.hoisted(() => ({ userId: 'account-1' as string | null }));
vi.mock('~/services/grpc/authServices', () => ({ preferencesService: service }));
vi.mock('~/utils/authStorage', () => ({ getStoredUserId: () => identity.userId }));
import { fetchPreferences, updatePreferences } from './preferencesApi';

let stored: Map<string, string>;
function newDevice() {
  stored = new Map();
  vi.stubGlobal('window', { localStorage: { getItem: (key: string) => stored.get(key) ?? null,
    setItem: (key: string, value: string) => stored.set(key, value) } });
}
beforeEach(() => { vi.resetAllMocks(); identity.userId = 'account-1'; newDevice(); });
afterEach(() => vi.unstubAllGlobals());
describe('account appearance preferences', () => {
  it('saves collection and mode through the account API and restores them on a fresh device', async () => {
    let account = { theme: 'dark', theme_collection: 'vivid', compact_view: true };
    service.updatePreferences.mockImplementation(async (_id, patch) => ({ preferences: account = { ...account, ...patch } }));
    service.getPreferences.mockImplementation(async () => ({ preferences: account }));
    await updatePreferences({ theme: 'light', theme_collection: 'refined' });
    expect(service.updatePreferences).toHaveBeenCalledWith('account-1', { theme: 'light', theme_collection: 'refined' });
    newDevice();
    expect((await fetchPreferences())?.settings).toMatchObject({ theme: 'light', theme_collection: 'refined', compact_view: true });
  });
  it('does not leak the previous account collection into an account with no choice', async () => {
    stored.set('homebit_preferences', JSON.stringify({ theme: 'dark', theme_collection: 'refined' }));
    service.getPreferences.mockResolvedValue({ preferences: {} });
    expect((await fetchPreferences())?.settings).toMatchObject({ theme: 'system', theme_collection: 'vivid' });
  });
  it('keeps anonymous changes local', async () => {
    identity.userId = null;
    await updatePreferences({ theme_collection: 'refined' });
    expect(service.updatePreferences).not.toHaveBeenCalled();
    expect((await fetchPreferences())?.settings.theme_collection).toBe('refined');
  });
  it('surfaces a failed save instead of claiming it synced', async () => {
    service.updatePreferences.mockRejectedValue(new Error('offline'));
    await expect(updatePreferences({ theme_collection: 'refined' })).rejects.toThrow('offline');
  });
});
