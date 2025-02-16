import { SwapKind } from '@balancer/sdk';
import { parseUnits } from 'viem';
import { SwapFormState } from './useSwapForm';

export const parseFormAmount = (formState: SwapFormState) => {
  if (formState.swapKind === SwapKind.GivenIn) {
    if (!formState.tokenIn) {
      return 0n;
    }

    try {
      return parseUnits(formState.amount, formState.tokenIn.decimals);
    } catch {
      return 0n;
    }
  }

  if (!formState.tokenOut) {
    return 0n;
  }

  try {
    return parseUnits(formState.amount, formState.tokenOut.decimals);
  } catch {
    return 0n;
  }
};
