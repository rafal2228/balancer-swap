import { Slippage } from '@balancer/sdk';
import { describe, expect, it } from 'vitest';
import { formatSlippage, isValidSlippage, parseSlippage } from './slippage';

describe('parseSlippage', () => {
  it('should return zero', () => {
    expect(parseSlippage('abc')).toBe(0n);
    expect(parseSlippage('123.456.789')).toBe(0n);
  });

  it('should return the correct slippage', () => {
    expect(parseSlippage('0.5')).toBe(Slippage.fromPercentage('0.5').amount);
    expect(parseSlippage('1.23')).toBe(Slippage.fromPercentage('1.23').amount);
  });
});

describe('formatSlippage', () => {
  it('should return the correct formatted slippage', () => {
    const slippage = Slippage.fromPercentage('0.5').amount;
    expect(formatSlippage(slippage)).toBe('0.5');

    const slippage2 = Slippage.fromPercentage('1.23').amount;
    expect(formatSlippage(slippage2)).toBe('1.23');
  });
});

describe('isValidSlippage', () => {
  it('should return false for invalid input', () => {
    expect(isValidSlippage(undefined)).toBe(false);
    expect(isValidSlippage(0n)).toBe(false);
    expect(isValidSlippage(-1n)).toBe(false);
  });

  it('should return true for valid input', () => {
    const slippage = Slippage.fromPercentage('0.5').amount;
    expect(isValidSlippage(slippage)).toBe(true);
    const slippage2 = Slippage.fromPercentage('1.23').amount;
    expect(isValidSlippage(slippage2)).toBe(true);
  });

  it('should return false for slippage greater than 50%', () => {
    const slippage = Slippage.fromPercentage('50.01').amount;
    expect(isValidSlippage(slippage)).toBe(false);
  });
});
