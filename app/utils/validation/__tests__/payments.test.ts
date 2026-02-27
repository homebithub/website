import { describe, it, expect } from 'vitest';
import {
  formatPhoneNumber,
  validatePhoneNumber,
  validateNickname,
  validatePauseDuration,
  validatePauseReason,
  validateCancelReason,
  validateFeedback,
  validateUUID,
  maskPhoneNumber,
  maskCardNumber,
} from '../payments';

describe('payments validation', () => {
  describe('formatPhoneNumber', () => {
    it('formats phone with +254 prefix', () => {
      expect(formatPhoneNumber('+254712345678')).toBe('+254712345678');
    });

    it('adds + to 254 prefix', () => {
      expect(formatPhoneNumber('254712345678')).toBe('+254712345678');
    });

    it('converts 0 prefix to +254', () => {
      expect(formatPhoneNumber('0712345678')).toBe('+254712345678');
    });

    it('adds +254 to 7 prefix', () => {
      expect(formatPhoneNumber('712345678')).toBe('+254712345678');
    });

    it('adds +254 to 1 prefix', () => {
      expect(formatPhoneNumber('110123456')).toBe('+254110123456');
    });

    it('removes spaces', () => {
      expect(formatPhoneNumber('0712 345 678')).toBe('+254712345678');
    });

    it('removes dashes', () => {
      expect(formatPhoneNumber('0712-345-678')).toBe('+254712345678');
    });

    it('removes parentheses', () => {
      expect(formatPhoneNumber('(0712) 345678')).toBe('+254712345678');
    });

    it('handles empty string', () => {
      expect(formatPhoneNumber('')).toBe('');
    });

    it('preserves already formatted numbers', () => {
      expect(formatPhoneNumber('+254712345678')).toBe('+254712345678');
    });
  });

  describe('validatePhoneNumber', () => {
    it('validates correct Kenyan phone (7 prefix)', () => {
      expect(validatePhoneNumber('+254712345678')).toBeNull();
    });

    it('validates correct Kenyan phone (1 prefix)', () => {
      expect(validatePhoneNumber('+254110123456')).toBeNull();
    });

    it('validates phone with 0 prefix', () => {
      expect(validatePhoneNumber('0712345678')).toBeNull();
    });

    it('validates phone without prefix', () => {
      expect(validatePhoneNumber('712345678')).toBeNull();
    });

    it('rejects empty phone', () => {
      expect(validatePhoneNumber('')).toBe('Phone number is required');
    });

    it('rejects invalid prefix', () => {
      expect(validatePhoneNumber('+254912345678')).toContain('valid Kenyan phone');
    });

    it('rejects too short number', () => {
      expect(validatePhoneNumber('071234567')).toContain('valid Kenyan phone');
    });

    it('rejects too long number', () => {
      expect(validatePhoneNumber('07123456789')).toContain('valid Kenyan phone');
    });

    it('rejects non-Kenyan number', () => {
      expect(validatePhoneNumber('+1234567890')).toContain('valid Kenyan phone');
    });
  });

  describe('validateNickname', () => {
    it('allows valid nickname', () => {
      expect(validateNickname('My Card')).toBeNull();
    });

    it('allows empty nickname (optional)', () => {
      expect(validateNickname('')).toBeNull();
    });

    it('rejects whitespace-only nickname', () => {
      expect(validateNickname('   ')).toBe('Nickname cannot be empty');
    });

    it('rejects nickname over 50 characters', () => {
      const longNickname = 'a'.repeat(51);
      expect(validateNickname(longNickname)).toBe('Nickname must be 50 characters or less');
    });

    it('allows nickname exactly 50 characters', () => {
      const nickname = 'a'.repeat(50);
      expect(validateNickname(nickname)).toBeNull();
    });

    it('allows nickname with special characters', () => {
      expect(validateNickname('My Card #1')).toBeNull();
    });
  });

  describe('validatePauseDuration', () => {
    it('validates minimum duration (7 days)', () => {
      expect(validatePauseDuration(7)).toBeNull();
    });

    it('validates maximum duration (90 days)', () => {
      expect(validatePauseDuration(90)).toBeNull();
    });

    it('validates mid-range duration', () => {
      expect(validatePauseDuration(30)).toBeNull();
    });

    it('rejects duration below minimum', () => {
      expect(validatePauseDuration(6)).toBe('Pause duration must be between 7 and 90 days');
    });

    it('rejects duration above maximum', () => {
      expect(validatePauseDuration(91)).toBe('Pause duration must be between 7 and 90 days');
    });

    it('rejects zero duration', () => {
      expect(validatePauseDuration(0)).toBe('Please select a pause duration');
    });

    it('rejects NaN', () => {
      expect(validatePauseDuration(NaN)).toBe('Please select a pause duration');
    });

    it('rejects negative duration', () => {
      expect(validatePauseDuration(-5)).toBe('Pause duration must be between 7 and 90 days');
    });
  });

  describe('validatePauseReason', () => {
    it('validates vacation reason', () => {
      expect(validatePauseReason('vacation')).toBeNull();
    });

    it('validates financial reason', () => {
      expect(validatePauseReason('financial')).toBeNull();
    });

    it('validates not_using reason', () => {
      expect(validatePauseReason('not_using')).toBeNull();
    });

    it('validates other reason', () => {
      expect(validatePauseReason('other')).toBeNull();
    });

    it('rejects empty reason', () => {
      expect(validatePauseReason('')).toBe('Please select a reason for pausing');
    });

    it('rejects invalid reason', () => {
      expect(validatePauseReason('invalid_reason')).toBe('Please select a valid reason');
    });
  });

  describe('validateCancelReason', () => {
    it('validates price reason', () => {
      expect(validateCancelReason('price')).toBeNull();
    });

    it('validates features reason', () => {
      expect(validateCancelReason('features')).toBeNull();
    });

    it('validates not_using reason', () => {
      expect(validateCancelReason('not_using')).toBeNull();
    });

    it('validates found_alternative reason', () => {
      expect(validateCancelReason('found_alternative')).toBeNull();
    });

    it('validates other reason', () => {
      expect(validateCancelReason('other')).toBeNull();
    });

    it('rejects empty reason', () => {
      expect(validateCancelReason('')).toBe('Please select a reason for cancellation');
    });

    it('rejects invalid reason', () => {
      expect(validateCancelReason('invalid')).toBe('Please select a valid reason');
    });
  });

  describe('validateFeedback', () => {
    it('allows valid feedback', () => {
      expect(validateFeedback('Great service!')).toBeNull();
    });

    it('allows empty feedback (optional)', () => {
      expect(validateFeedback('')).toBeNull();
    });

    it('allows feedback up to 500 characters', () => {
      const feedback = 'a'.repeat(500);
      expect(validateFeedback(feedback)).toBeNull();
    });

    it('rejects feedback over 500 characters', () => {
      const feedback = 'a'.repeat(501);
      expect(validateFeedback(feedback)).toBe('Feedback must be 500 characters or less');
    });

    it('allows multiline feedback', () => {
      expect(validateFeedback('Line 1\nLine 2\nLine 3')).toBeNull();
    });
  });

  describe('validateUUID', () => {
    it('validates correct UUID v4', () => {
      expect(validateUUID('123e4567-e89b-12d3-a456-426614174000')).toBeNull();
    });

    it('validates UUID with uppercase', () => {
      expect(validateUUID('123E4567-E89B-12D3-A456-426614174000')).toBeNull();
    });

    it('validates UUID with mixed case', () => {
      expect(validateUUID('123e4567-E89B-12d3-A456-426614174000')).toBeNull();
    });

    it('rejects empty UUID', () => {
      expect(validateUUID('')).toBe('ID is required');
    });

    it('rejects UUID without dashes', () => {
      expect(validateUUID('123e4567e89b12d3a456426614174000')).toBe('Invalid ID format');
    });

    it('rejects UUID with wrong format', () => {
      expect(validateUUID('123e4567-e89b-12d3-a456')).toBe('Invalid ID format');
    });

    it('rejects UUID with invalid characters', () => {
      expect(validateUUID('123g4567-e89b-12d3-a456-426614174000')).toBe('Invalid ID format');
    });

    it('rejects too short UUID', () => {
      expect(validateUUID('123e4567-e89b-12d3-a456-42661417400')).toBe('Invalid ID format');
    });

    it('rejects too long UUID', () => {
      expect(validateUUID('123e4567-e89b-12d3-a456-4266141740000')).toBe('Invalid ID format');
    });
  });

  describe('maskPhoneNumber', () => {
    it('masks Kenyan phone number', () => {
      expect(maskPhoneNumber('+254712345678')).toBe('+254****5678');
    });

    it('masks phone with 0 prefix', () => {
      expect(maskPhoneNumber('0712345678')).toBe('+254****5678');
    });

    it('masks phone without prefix', () => {
      expect(maskPhoneNumber('712345678')).toBe('+254****5678');
    });

    it('handles empty phone', () => {
      expect(maskPhoneNumber('')).toBe('');
    });

    it('handles short phone', () => {
      expect(maskPhoneNumber('1234')).toBe('+254****1234');
    });

    it('preserves formatting before masking', () => {
      expect(maskPhoneNumber('0712 345 678')).toBe('+254****5678');
    });
  });

  describe('maskCardNumber', () => {
    it('masks card number', () => {
      expect(maskCardNumber('4242')).toBe('****4242');
    });

    it('handles empty last4', () => {
      expect(maskCardNumber('')).toBe('');
    });

    it('masks single digit', () => {
      expect(maskCardNumber('5')).toBe('****5');
    });

    it('masks two digits', () => {
      expect(maskCardNumber('42')).toBe('****42');
    });

    it('masks three digits', () => {
      expect(maskCardNumber('424')).toBe('****424');
    });
  });

  describe('Edge Cases', () => {
    it('handles null-like values gracefully', () => {
      expect(formatPhoneNumber(null as any)).toBe('');
      expect(maskPhoneNumber(null as any)).toBe('');
      expect(maskCardNumber(null as any)).toBe('');
    });

    it('handles undefined values gracefully', () => {
      expect(formatPhoneNumber(undefined as any)).toBe('');
      expect(maskPhoneNumber(undefined as any)).toBe('');
      expect(maskCardNumber(undefined as any)).toBe('');
    });

    it('validates boundary values', () => {
      expect(validatePauseDuration(7)).toBeNull();
      expect(validatePauseDuration(90)).toBeNull();
      expect(validatePauseDuration(6)).not.toBeNull();
      expect(validatePauseDuration(91)).not.toBeNull();
    });
  });
});
