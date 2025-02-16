import { clipAmount, formatAmount } from '@/lib/swap/tokenAmount';
import { Swap } from '@balancer/sdk';
import { formatUnits, parseUnits } from 'viem';
import { describe, expect, it } from 'vitest';
import * as swapFormMocks from './useSwapForm.mock';

describe('formatAmount', () => {
  it('should return form state amount', () => {
    // Given in
    expect(
      formatAmount({
        formState: swapFormMocks.mockSwapFormState({
          ...swapFormMocks.givenInState,
          amount: '10',
        }),
        swap: undefined,
        tokenType: 'in',
      }),
    ).toBe('10');

    // Given out
    expect(
      formatAmount({
        formState: swapFormMocks.mockSwapFormState({
          ...swapFormMocks.givenOutState,
          amount: '10',
        }),
        swap: undefined,
        tokenType: 'out',
      }),
    ).toBe('10');
  });

  it('should default to 0 if swap amount is unavailable', () => {
    // Given in
    expect(
      formatAmount({
        formState: swapFormMocks.givenInState,
        swap: undefined,
        tokenType: 'out',
      }),
    ).toBe('0');

    // Given out
    expect(
      formatAmount({
        formState: swapFormMocks.givenOutState,
        swap: undefined,
        tokenType: 'in',
      }),
    ).toBe('0');
  });

  it('should format given in swap amount with full precision', () => {
    const formState = swapFormMocks.givenInState;
    const decimals = formState.tokenOut?.decimals ?? 18;
    const amount = parseUnits('12345.6789', decimals);

    expect(
      formatAmount({
        formState,
        swap: {
          outputAmount: {
            amount,
            token: {
              decimals,
            },
          },
        } as unknown as Swap,
        tokenType: 'out',
      }),
    ).toBe(formatUnits(amount, formState.tokenOut?.decimals ?? 18));
  });

  it('should format given out swap amount with full precision', () => {
    const formState = swapFormMocks.givenOutState;
    const decimals = formState.tokenIn?.decimals ?? 18;
    const amount = parseUnits('12345.6789', decimals);

    expect(
      formatAmount({
        formState,
        swap: {
          inputAmount: {
            amount,
            token: {
              decimals,
            },
          },
        } as unknown as Swap,
        tokenType: 'in',
      }),
    ).toBe(formatUnits(amount, decimals));
  });
});

describe('clipAmount', () => {
  it('should clip the amount to the correct precision', () => {
    const amount = '10.123456789';
    expect(clipAmount(amount)).toBe('10.123456');
  });

  it('should not clip the amount if it is already at the correct precision', () => {
    const amount = '10.12345';
    expect(clipAmount(amount)).toBe('10.12345');
  });

  it('should return the original amount if it does not contain a decimal point', () => {
    const amount = '10';
    expect(clipAmount(amount)).toBe('10');
  });

  it('should return the original amount if the decimal part is empty', () => {
    const amount = '10.';
    expect(clipAmount(amount)).toBe('10.');
  });

  it('should round the amount to at least 1 if it too small', () => {
    const amount = '0.00000000001234';
    expect(clipAmount(amount)).toBe('0.000001');
  });
});
