import { expect, it } from 'vitest';
import { hiringDestination, notificationDestination } from './notificationDestination';

it('keeps non-hiring destinations and unrecognized events unchanged', () => {
  expect(notificationDestination({ id: '1', metadata: { conversation_id: 'a b' } })).toBe('/inbox?conversation=a%20b');
  expect(notificationDestination({ id: '2', type: 'subscription_expired' })).toBe('/subscriptions');
  expect(notificationDestination({ id: '4', type: 'news' })).toBeNull();
});

it.each([
  ['application_received', 'household', 'applicants'],
  ['application_accepted', 'CLT', 'awaiting'],
  ['application_shortlisted', 'household', 'shortlisted'],
  ['application_declined', 'household', 'closed'],
  ['application_closed', 'household', 'closed'],
  ['application_approved', 'household', 'hired'],
  ['employment_contract_fully_signed', 'household', 'hired'],
  ['application_invited', 'SVC_PVD', 'offers'],
  ['application_shortlisted', 'service_provider', 'interests'],
  ['application_rejected', 'househelp', 'interests'],
  ['application_approved', 'service_provider', 'interests'],
  ['hire_request_received', 'service_provider', 'requests'],
  ['employment_contract_sent', 'service_provider', 'employment-contracts'],
  ['employment_contract_fully_signed', 'service_provider', 'employment-contracts'],
  ['contract_terminated', 'service_provider', 'work-history'],
])('routes %s for %s to the %s tab, including old generic action URLs', (type, profile, tab) => {
  const prefix = ['household', 'CLT'].includes(profile) ? 'household' : 'service-provider';
  for (const action_url of [undefined, '/hiring', 'http://homebit.co.ke/hiring', 'https://homebit.co.ke/hiring']) {
    expect(notificationDestination({ id: '1', type, metadata: { action_url } }, profile))
      .toBe(`/${prefix}/hiring?tab=${tab}`);
  }
});

it('resolves the current profile at click time, corrects mismatched links, and preserves valid tabs and other parameters', () => {
  const item = { id: '1', type: 'application_received', metadata: JSON.stringify({ action_url: '/hiring?job=12' }) };
  expect(notificationDestination(item, 'household')).toBe('/household/hiring?job=12&tab=applicants');
  expect(notificationDestination(item, 'service_provider')).toBe('/service-provider/hiring?job=12&tab=interests');
  expect(notificationDestination({ id: '1', url: '/household/hiring?tab=awaiting', type: 'application_invited' }, 'service_provider'))
    .toBe('/service-provider/hiring?tab=offers');
  expect(notificationDestination({ id: '1', url: '/service-provider/hiring?tab=employment-contracts#details' }, 'service_provider'))
    .toBe('/service-provider/hiring?tab=employment-contracts#details');
});

it('uses notification action metadata and supports legacy PWA links', () => {
  expect(notificationDestination({ id: '1', metadata: { action: 'application_invited' } }, 'service_provider'))
    .toBe('/service-provider/hiring?tab=offers');
  expect(hiringDestination('household', '?source=pwa-shortcut')).toBe('/household/hiring?source=pwa-shortcut&tab=applicants');
  expect(hiringDestination('service_provider', '?tab=not-a-tab')).toBe('/service-provider/hiring?tab=interests');
});

it('does not follow unsafe or external notification links', () => {
  for (const url of ['//evil.test/inbox', 'javascript:alert(1)', 'https://evil.test/inbox', '/\\evil.test/inbox', 'https://homebit.co.ke.evil.test/hiring', 'https://user:pass@homebit.co.ke/hiring']) {
    expect(notificationDestination({ id: '1', url })).toBeNull();
  }
});
