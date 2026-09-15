import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  countUnattendedHiringRecords,
  isHiringRecordUnattended,
  markHiringRecordAttended,
} from './hiringAttention';

describe('hiring attention', () => {
  beforeEach(() => {
    const values = new Map<string, string>();
    vi.stubGlobal('window', {
      localStorage: {
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => values.set(key, value),
      },
      dispatchEvent: vi.fn(),
    });
    vi.stubGlobal('CustomEvent', class { constructor(public type: string, public init: unknown) {} });
    vi.stubGlobal('Event', class { constructor(public type: string) {} });
  });

  it('clears only the card that was interacted with', () => {
    const first = { id: '1', status: 'pending', updated_at: 'now' };
    const second = { id: '2', status: 'pending', updated_at: 'now' };
    expect(countUnattendedHiringRecords('househelp:p', [{ kind: 'request', records: [first, second] }])).toBe(2);
    markHiringRecordAttended('househelp:p', 'request', first);
    expect(isHiringRecordUnattended('househelp:p', 'request', first)).toBe(false);
    expect(isHiringRecordUnattended('househelp:p', 'request', second)).toBe(true);
  });

  it('makes an attended card new again after a status update', () => {
    const record = { id: '1', status: 'pending', updated_at: 'one' };
    markHiringRecordAttended('household:p', 'application', record);
    expect(isHiringRecordUnattended('household:p', 'application', { ...record, status: 'accepted', updated_at: 'two' })).toBe(true);
  });

  it('does not resurrect an attended card when one response includes updated_at', () => {
    const pageRecord = { id: '1', status: 'approved', created_at: 'created' };
    markHiringRecordAttended('household:p', 'application', pageRecord);

    expect(isHiringRecordUnattended('household:p', 'application', {
      ...pageRecord,
      updated_at: 'updated later',
    })).toBe(false);
  });

  it('honours marks written by clients that used updated_at in the version', () => {
    window.localStorage.setItem(
      'homebit:hiring-attention:v1:household:legacy',
      JSON.stringify({ 'application:1': 'approved|a previous updated timestamp' }),
    );

    expect(isHiringRecordUnattended('household:legacy', 'application', {
      id: '1',
      status: 'approved',
      created_at: 'created',
      updated_at: 'updated again',
    })).toBe(false);
  });

  it('does not double-count the same work record returned by legacy and current APIs', () => {
    const work = { id: 'job', status: 'active', created_at: 'now' };
    expect(countUnattendedHiringRecords('househelp:p', [
      { kind: 'work', records: [work] },
      { kind: 'work', records: [{ ...work }] },
    ])).toBe(1);
  });
});
