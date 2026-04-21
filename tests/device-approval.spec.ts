import { test, expect } from '@playwright/test';

const DEVICE_EVENT = {
  event_type: 'auth.device.pending_confirmation',
  device_id: 'device-debug-01',
  device_name: 'MacBook Pro Debug',
  device_type: 'desktop',
  browser: 'Playwright',
  os: 'DebugOS',
  ip_address: '203.0.113.42',
  country: 'Kenya',
  city: 'Nairobi',
  confirmation_token: 'mock-confirm-token',
  confirmation_url: '/devices/confirm?token=mock-confirm-token',
};

test.describe('Device approval banner', () => {
  test('surfaces pending approval badge and banner when SSE event arrives', async ({ page }) => {
    await page.goto('/debug/device-auth');

    // Ensure the helper exists and inject a deterministic payload
    await page.waitForFunction(() => typeof window !== 'undefined' && !!(window as any).__HOME_BIT_SSE_DEBUG__);
    await page.evaluate((payload) => {
      const injector = (window as any).__HOME_BIT_SSE_DEBUG__;
      injector?.(payload);
    }, DEVICE_EVENT);

    // Banner should become visible
    const banner = page.getByTestId('device-approval-banner');
    await expect(banner).toBeVisible();
    await expect(banner).toHaveText(/Approve MacBook Pro Debug/i);
    await expect(banner).toContainText('Playwright');
    await expect(banner).toContainText('Nairobi');

    // Badge should appear on desktop bell
    const desktopBadge = page.getByTestId('device-approval-count');
    await expect(desktopBadge).toHaveText('1');

    // Dismiss to ensure it disappears
    await page.getByRole('button', { name: /dismiss/i }).click();
    await expect(banner).not.toBeVisible({ timeout: 5000 });

    // Inject again to validate mobile badge behaviour (via viewport change)
    await page.setViewportSize({ width: 430, height: 932 });
    await page.evaluate((payload) => {
      const injector = (window as any).__HOME_BIT_SSE_DEBUG__;
      injector?.(payload);
    }, DEVICE_EVENT);

    // Open mobile menu and ensure badge is present
    await page.getByRole('button', { name: /menu/i }).click();
    const mobileBadge = page.getByTestId('device-approval-count-mobile');
    await expect(mobileBadge).toHaveText('1');
  });
});
