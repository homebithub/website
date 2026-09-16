import { describe, expect, it } from 'vitest';

import { subjectOf } from './session';

function tokenFor(payload: Record<string, unknown>) {
  const encoded = btoa(JSON.stringify(payload))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  return `header.${encoded}.signature`;
}

describe('subjectOf', () => {
  it('prefers the auth user_id used by Gateway ownership checks', () => {
    expect(subjectOf(tokenFor({ user_id: 'account-from-token', sub: 'legacy-subject' }))).toBe('account-from-token');
  });

  it('falls back to sub for tokens issued before user_id was added', () => {
    expect(subjectOf(tokenFor({ sub: 'account-from-subject' }))).toBe('account-from-subject');
  });

  it('does not trust a malformed token enough to reject a session', () => {
    expect(subjectOf('not-a-jwt')).toBeNull();
    expect(subjectOf(tokenFor({ user_id: 42 }))).toBeNull();
  });
});
