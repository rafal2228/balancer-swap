import { parseUnits } from 'viem';
import { describe, expect, it } from 'vitest';
import { parseFormAmount } from './parseFormAmount';
import * as swapFormMocks from './useSwapForm.mock';

describe('parseFormAmount', () => {
  it('should return 0 if tokenIn is not selected', () => {
    expect(
      parseFormAmount(
        swapFormMocks.mockSwapFormState({
          ...swapFormMocks.givenInState,
          tokenIn: undefined,
        }),
      ),
    ).toBe(0n);
  });

  it('should return 0 if tokenOut is not selected', () => {
    expect(
      parseFormAmount(
        swapFormMocks.mockSwapFormState({
          ...swapFormMocks.givenOutState,
          tokenOut: undefined,
        }),
      ),
    ).toBe(0n);
  });

  it('should parse given in amount', () => {
    expect(parseFormAmount(swapFormMocks.givenInState)).toBe(
      parseUnits(
        swapFormMocks.givenInState.amount,
        swapFormMocks.givenInState.tokenIn?.decimals ?? 18,
      ),
    );
  });

  it('should parse given out amount', () => {
    expect(parseFormAmount(swapFormMocks.givenOutState)).toBe(
      parseUnits(
        swapFormMocks.givenOutState.amount,
        swapFormMocks.givenOutState.tokenOut?.decimals ?? 18,
      ),
    );
  });
});
