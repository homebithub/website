import { expect, it } from 'vitest';
import { notificationDestination } from './notificationDestination';
it('routes actionable notification metadata and event types', () => {
  expect(notificationDestination({ id: '1', metadata: { conversation_id: 'a b' } })).toBe('/inbox?conversation=a%20b');
  expect(notificationDestination({ id: '2', type: 'subscription_expired' })).toBe('/subscriptions');
  expect(notificationDestination({ id: '3', type: 'application_accepted' })).toBe('/hiring');
  expect(notificationDestination({ id: '4', type: 'news' })).toBeNull();
});
it('does not follow unsafe or external notification links', () => {
  for (const url of ['//evil.test/inbox', 'javascript:alert(1)', 'https://evil.test/inbox', '/\\evil.test/inbox']) {
    expect(notificationDestination({ id: '1', url })).toBeNull();
  }
});
