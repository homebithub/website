import { describe, expect, it } from 'vitest';
import { transformErrorMessage } from './errorMessages';

describe('transformErrorMessage', () => {
  it('turns the duplicate engagement review constraint into an actionable message', () => {
    expect(
      transformErrorMessage(
        'A record with the same value for engagement_id, reviewer_user_id, type already exists',
      ),
    ).toBe(
      'You have already reviewed this work engagement. You can leave another review after a new Homebit hire has ended.',
    );
  });

  it('does not display unknown database constraint details', () => {
    expect(
      transformErrorMessage('duplicate key value violates unique constraint "private_table_key"'),
    ).toBe('Something went wrong. Please try again or contact support if the problem persists.');
  });
});
