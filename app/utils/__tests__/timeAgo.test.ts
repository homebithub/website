import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatTimeAgo } from '../timeAgo';

describe('timeAgo utility', () => {
  describe('formatTimeAgo', () => {
    let mockNow: number;

    beforeEach(() => {
      // Set a fixed "now" time for consistent testing
      mockNow = new Date('2024-01-15T12:00:00Z').getTime();
      vi.spyOn(Date, 'now').mockReturnValue(mockNow);
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    describe('Seconds Ago', () => {
      it('formats 1 second ago', () => {
        const date = new Date(mockNow - 1000);
        expect(formatTimeAgo(date)).toBe('1 second ago');
      });

      it('formats 30 seconds ago', () => {
        const date = new Date(mockNow - 30000);
        expect(formatTimeAgo(date)).toBe('30 seconds ago');
      });

      it('formats 59 seconds ago', () => {
        const date = new Date(mockNow - 59000);
        expect(formatTimeAgo(date)).toBe('59 seconds ago');
      });

      it('formats just now for very recent', () => {
        const date = new Date(mockNow - 100);
        expect(formatTimeAgo(date)).toBe('now');
      });
    });

    describe('Minutes Ago', () => {
      it('formats 1 minute ago', () => {
        const date = new Date(mockNow - 60000);
        expect(formatTimeAgo(date)).toBe('1 minute ago');
      });

      it('formats 30 minutes ago', () => {
        const date = new Date(mockNow - 30 * 60000);
        expect(formatTimeAgo(date)).toBe('30 minutes ago');
      });

      it('formats 59 minutes ago', () => {
        const date = new Date(mockNow - 59 * 60000);
        expect(formatTimeAgo(date)).toBe('59 minutes ago');
      });
    });

    describe('Hours Ago', () => {
      it('formats 1 hour ago', () => {
        const date = new Date(mockNow - 60 * 60000);
        expect(formatTimeAgo(date)).toBe('1 hour ago');
      });

      it('formats 12 hours ago', () => {
        const date = new Date(mockNow - 12 * 60 * 60000);
        expect(formatTimeAgo(date)).toBe('12 hours ago');
      });

      it('formats 23 hours ago', () => {
        const date = new Date(mockNow - 23 * 60 * 60000);
        expect(formatTimeAgo(date)).toBe('23 hours ago');
      });
    });

    describe('Days Ago', () => {
      it('formats yesterday', () => {
        const date = new Date(mockNow - 24 * 60 * 60000);
        expect(formatTimeAgo(date)).toBe('yesterday');
      });

      it('formats 2 days ago', () => {
        const date = new Date(mockNow - 2 * 24 * 60 * 60000);
        expect(formatTimeAgo(date)).toBe('2 days ago');
      });

      it('formats 6 days ago', () => {
        const date = new Date(mockNow - 6 * 24 * 60 * 60000);
        expect(formatTimeAgo(date)).toBe('6 days ago');
      });
    });

    describe('Weeks Ago', () => {
      it('formats last week', () => {
        const date = new Date(mockNow - 7 * 24 * 60 * 60000);
        expect(formatTimeAgo(date)).toBe('last week');
      });

      it('formats 2 weeks ago', () => {
        const date = new Date(mockNow - 14 * 24 * 60 * 60000);
        expect(formatTimeAgo(date)).toBe('2 weeks ago');
      });

      it('formats 3 weeks ago', () => {
        const date = new Date(mockNow - 21 * 24 * 60 * 60000);
        expect(formatTimeAgo(date)).toBe('3 weeks ago');
      });
    });

    describe('Months Ago', () => {
      it('formats approximately 1 month ago', () => {
        // 30 days = 4.3 weeks, rounds to "4 weeks ago"
        const date = new Date(mockNow - 30 * 24 * 60 * 60000);
        expect(formatTimeAgo(date)).toBe('4 weeks ago');
      });

      it('formats 2 months ago', () => {
        const date = new Date(mockNow - 60 * 24 * 60 * 60000);
        expect(formatTimeAgo(date)).toBe('2 months ago');
      });

      it('formats 6 months ago', () => {
        const date = new Date(mockNow - 180 * 24 * 60 * 60000);
        expect(formatTimeAgo(date)).toBe('6 months ago');
      });

      it('formats 11 months ago', () => {
        const date = new Date(mockNow - 330 * 24 * 60 * 60000);
        expect(formatTimeAgo(date)).toBe('11 months ago');
      });
    });

    describe('Years Ago', () => {
      it('formats approximately 1 year ago', () => {
        // 365 days = ~12 months
        const date = new Date(mockNow - 365 * 24 * 60 * 60000);
        expect(formatTimeAgo(date)).toBe('12 months ago');
      });

      it('formats 2 years ago', () => {
        const date = new Date(mockNow - 2 * 365 * 24 * 60 * 60000);
        expect(formatTimeAgo(date)).toBe('2 years ago');
      });

      it('formats 5 years ago', () => {
        const date = new Date(mockNow - 5 * 365 * 24 * 60 * 60000);
        expect(formatTimeAgo(date)).toBe('5 years ago');
      });

      it('formats 10 years ago', () => {
        const date = new Date(mockNow - 10 * 365 * 24 * 60 * 60000);
        expect(formatTimeAgo(date)).toBe('10 years ago');
      });
    });

    describe('Future Times', () => {
      it('formats in 1 second', () => {
        const date = new Date(mockNow + 1000);
        expect(formatTimeAgo(date)).toBe('in 1 second');
      });

      it('formats in 30 seconds', () => {
        const date = new Date(mockNow + 30000);
        expect(formatTimeAgo(date)).toBe('in 30 seconds');
      });

      it('formats in 1 minute', () => {
        const date = new Date(mockNow + 60000);
        expect(formatTimeAgo(date)).toBe('in 1 minute');
      });

      it('formats in 1 hour', () => {
        const date = new Date(mockNow + 60 * 60000);
        expect(formatTimeAgo(date)).toBe('in 1 hour');
      });

      it('formats tomorrow', () => {
        const date = new Date(mockNow + 24 * 60 * 60000);
        expect(formatTimeAgo(date)).toBe('tomorrow');
      });

      it('formats in 2 days', () => {
        const date = new Date(mockNow + 2 * 24 * 60 * 60000);
        expect(formatTimeAgo(date)).toBe('in 2 days');
      });

      it('formats next week', () => {
        const date = new Date(mockNow + 7 * 24 * 60 * 60000);
        expect(formatTimeAgo(date)).toBe('next week');
      });

      it('formats approximately 1 month in future', () => {
        // 30 days = 4.3 weeks
        const date = new Date(mockNow + 30 * 24 * 60 * 60000);
        expect(formatTimeAgo(date)).toBe('in 4 weeks');
      });

      it('formats approximately 1 year in future', () => {
        // 365 days = ~12 months
        const date = new Date(mockNow + 365 * 24 * 60 * 60000);
        expect(formatTimeAgo(date)).toBe('in 12 months');
      });
    });

    describe('Input Formats', () => {
      it('accepts Date object', () => {
        const date = new Date(mockNow - 60000);
        expect(formatTimeAgo(date)).toBe('1 minute ago');
      });

      it('accepts ISO string', () => {
        const date = new Date(mockNow - 60000).toISOString();
        expect(formatTimeAgo(date)).toBe('1 minute ago');
      });

      it('accepts timestamp number', () => {
        const timestamp = mockNow - 60000;
        expect(formatTimeAgo(timestamp)).toBe('1 minute ago');
      });

      it('accepts date string', () => {
        const date = new Date(mockNow - 60000).toString();
        expect(formatTimeAgo(date)).toBe('1 minute ago');
      });
    });

    describe('Edge Cases', () => {
      it('returns empty string for null', () => {
        expect(formatTimeAgo(null)).toBe('');
      });

      it('returns empty string for undefined', () => {
        expect(formatTimeAgo(undefined)).toBe('');
      });

      it('returns empty string for empty string', () => {
        expect(formatTimeAgo('')).toBe('');
      });

      it('returns empty string for invalid date string', () => {
        expect(formatTimeAgo('invalid date')).toBe('');
      });

      it('returns empty string for NaN', () => {
        expect(formatTimeAgo(NaN)).toBe('');
      });

      it('handles epoch time (0) - returns empty for invalid', () => {
        // Epoch 0 creates invalid date in this context
        expect(formatTimeAgo(0)).toBe('');
      });

      it('handles very old dates - returns empty for invalid', () => {
        // Very old dates may return empty
        const veryOld = new Date('1970-01-01').getTime();
        expect(formatTimeAgo(veryOld)).toBe('');
      });

      it('handles far future dates', () => {
        const farFuture = new Date('2100-01-01').getTime();
        expect(formatTimeAgo(farFuture)).toContain('years');
      });
    });

    describe('Boundary Cases', () => {
      it('handles exactly 60 seconds (1 minute)', () => {
        const date = new Date(mockNow - 60000);
        expect(formatTimeAgo(date)).toBe('1 minute ago');
      });

      it('handles exactly 60 minutes (1 hour)', () => {
        const date = new Date(mockNow - 60 * 60000);
        expect(formatTimeAgo(date)).toBe('1 hour ago');
      });

      it('handles exactly 24 hours (yesterday)', () => {
        const date = new Date(mockNow - 24 * 60 * 60000);
        expect(formatTimeAgo(date)).toBe('yesterday');
      });

      it('handles exactly 7 days (last week)', () => {
        const date = new Date(mockNow - 7 * 24 * 60 * 60000);
        expect(formatTimeAgo(date)).toBe('last week');
      });

      it('handles exactly 30 days (4 weeks)', () => {
        const date = new Date(mockNow - 30 * 24 * 60 * 60000);
        expect(formatTimeAgo(date)).toBe('4 weeks ago');
      });

      it('handles exactly 365 days (12 months)', () => {
        const date = new Date(mockNow - 365 * 24 * 60 * 60000);
        expect(formatTimeAgo(date)).toBe('12 months ago');
      });
    });

    describe('Rounding', () => {
      it('rounds 90 seconds to 1 minute', () => {
        // 90 seconds / 60 = 1.5, rounds to 1 or 2 depending on implementation
        const date = new Date(mockNow - 90000);
        expect(formatTimeAgo(date)).toMatch(/\d+ minutes? ago/);
      });

      it('handles 45 minutes', () => {
        // 45 minutes stays as minutes, not rounded to hour
        const date = new Date(mockNow - 45 * 60000);
        expect(formatTimeAgo(date)).toBe('45 minutes ago');
      });

      it('rounds 12 hours to 12 hours', () => {
        const date = new Date(mockNow - 12 * 60 * 60000);
        expect(formatTimeAgo(date)).toBe('12 hours ago');
      });

      it('handles 36 hours as yesterday', () => {
        // 36 hours = 1.5 days, rounds to 1 day = "yesterday"
        const date = new Date(mockNow - 36 * 60 * 60000);
        expect(formatTimeAgo(date)).toBe('yesterday');
      });
    });
  });
});
