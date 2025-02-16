import { SwapKind } from '@balancer/sdk';
import { defaultState, SwapFormState } from './useSwapForm';

export const mockSwapFormState = (partial: Partial<SwapFormState>) => ({
  ...defaultState,
  ...partial,
});

export const givenInState = mockSwapFormState({
  swapKind: SwapKind.GivenIn,
  amount: '10',
});

export const givenOutState = mockSwapFormState({
  swapKind: SwapKind.GivenOut,
  amount: '10',
});

export const incorrectSlippage = mockSwapFormState({
  slippage: '100',
});
