import { describe, it, expect } from 'vitest';
import { formatCurrency } from '../format';

describe('format utility', () => {
  describe('formatCurrency', () => {
    describe('USD Currency', () => {
      it('formats whole dollar amounts', () => {
        expect(formatCurrency(100, 'USD')).toBe('$100.00');
      });

      it('formats cents', () => {
        expect(formatCurrency(0.99, 'USD')).toBe('$0.99');
      });

      it('formats large amounts with commas', () => {
        expect(formatCurrency(1000, 'USD')).toBe('$1,000.00');
      });

      it('formats very large amounts', () => {
        expect(formatCurrency(1000000, 'USD')).toBe('$1,000,000.00');
      });

      it('formats decimal amounts', () => {
        expect(formatCurrency(123.45, 'USD')).toBe('$123.45');
      });

      it('formats zero', () => {
        expect(formatCurrency(0, 'USD')).toBe('$0.00');
      });

      it('formats negative amounts', () => {
        expect(formatCurrency(-50, 'USD')).toBe('-$50.00');
      });

      it('formats negative decimal amounts', () => {
        expect(formatCurrency(-123.45, 'USD')).toBe('-$123.45');
      });

      it('rounds to two decimal places', () => {
        expect(formatCurrency(123.456, 'USD')).toBe('$123.46');
      });

      it('rounds down when appropriate', () => {
        expect(formatCurrency(123.454, 'USD')).toBe('$123.45');
      });
    });

    describe('EUR Currency', () => {
      it('formats EUR amounts', () => {
        expect(formatCurrency(100, 'EUR')).toBe('€100.00');
      });

      it('formats large EUR amounts', () => {
        expect(formatCurrency(1000, 'EUR')).toBe('€1,000.00');
      });

      it('formats EUR decimals', () => {
        expect(formatCurrency(123.45, 'EUR')).toBe('€123.45');
      });

      it('formats negative EUR amounts', () => {
        expect(formatCurrency(-50, 'EUR')).toBe('-€50.00');
      });
    });

    describe('GBP Currency', () => {
      it('formats GBP amounts', () => {
        expect(formatCurrency(100, 'GBP')).toBe('£100.00');
      });

      it('formats large GBP amounts', () => {
        expect(formatCurrency(1000, 'GBP')).toBe('£1,000.00');
      });

      it('formats GBP decimals', () => {
        expect(formatCurrency(123.45, 'GBP')).toBe('£123.45');
      });
    });

    describe('JPY Currency', () => {
      it('formats JPY amounts without decimals', () => {
        expect(formatCurrency(100, 'JPY')).toBe('¥100');
      });

      it('formats large JPY amounts', () => {
        expect(formatCurrency(1000, 'JPY')).toBe('¥1,000');
      });

      it('rounds JPY amounts', () => {
        expect(formatCurrency(123.45, 'JPY')).toBe('¥123');
      });
    });

    describe('Other Currencies', () => {
      it('formats CAD', () => {
        expect(formatCurrency(100, 'CAD')).toBe('CA$100.00');
      });

      it('formats AUD', () => {
        expect(formatCurrency(100, 'AUD')).toBe('A$100.00');
      });

      it('formats CHF', () => {
        const result = formatCurrency(100, 'CHF');
        // CHF uses non-breaking space in some locales
        expect(result).toMatch(/CHF\s100\.00/);
      });

      it('formats CNY', () => {
        expect(formatCurrency(100, 'CNY')).toBe('CN¥100.00');
      });

      it('formats INR', () => {
        expect(formatCurrency(100, 'INR')).toBe('₹100.00');
      });
    });

    describe('Edge Cases', () => {
      it('handles very small amounts', () => {
        expect(formatCurrency(0.01, 'USD')).toBe('$0.01');
      });

      it('handles very large amounts', () => {
        expect(formatCurrency(999999999.99, 'USD')).toBe('$999,999,999.99');
      });

      it('handles fractional cents', () => {
        expect(formatCurrency(0.001, 'USD')).toBe('$0.00');
      });

      it('handles negative zero', () => {
        // JavaScript treats -0 and 0 differently, formatter may show -$0.00
        const result = formatCurrency(-0, 'USD');
        expect(result).toMatch(/^-?\$0\.00$/);
      });

      it('handles scientific notation', () => {
        expect(formatCurrency(1e6, 'USD')).toBe('$1,000,000.00');
      });

      it('handles negative scientific notation', () => {
        expect(formatCurrency(-1e3, 'USD')).toBe('-$1,000.00');
      });
    });

    describe('Precision', () => {
      it('maintains precision for two decimal places', () => {
        expect(formatCurrency(123.45, 'USD')).toBe('$123.45');
      });

      it('adds trailing zeros', () => {
        expect(formatCurrency(123.4, 'USD')).toBe('$123.40');
      });

      it('adds both trailing zeros', () => {
        expect(formatCurrency(123, 'USD')).toBe('$123.00');
      });

      it('rounds three decimal places up', () => {
        expect(formatCurrency(123.456, 'USD')).toBe('$123.46');
      });

      it('rounds three decimal places down', () => {
        expect(formatCurrency(123.454, 'USD')).toBe('$123.45');
      });

      it('handles banker\'s rounding', () => {
        expect(formatCurrency(123.455, 'USD')).toBe('$123.46');
      });
    });

    describe('Thousands Separators', () => {
      it('adds separator for thousands', () => {
        expect(formatCurrency(1000, 'USD')).toBe('$1,000.00');
      });

      it('adds separator for ten thousands', () => {
        expect(formatCurrency(10000, 'USD')).toBe('$10,000.00');
      });

      it('adds separator for hundred thousands', () => {
        expect(formatCurrency(100000, 'USD')).toBe('$100,000.00');
      });

      it('adds separator for millions', () => {
        expect(formatCurrency(1000000, 'USD')).toBe('$1,000,000.00');
      });

      it('adds multiple separators', () => {
        expect(formatCurrency(1234567.89, 'USD')).toBe('$1,234,567.89');
      });
    });

    describe('Negative Numbers', () => {
      it('formats negative with minus sign', () => {
        expect(formatCurrency(-100, 'USD')).toBe('-$100.00');
      });

      it('formats negative decimals', () => {
        expect(formatCurrency(-123.45, 'USD')).toBe('-$123.45');
      });

      it('formats negative large amounts', () => {
        expect(formatCurrency(-1000, 'USD')).toBe('-$1,000.00');
      });

      it('formats negative cents', () => {
        expect(formatCurrency(-0.99, 'USD')).toBe('-$0.99');
      });
    });
  });
});
