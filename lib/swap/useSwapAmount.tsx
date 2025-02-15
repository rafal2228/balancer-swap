import { SwapKind } from '@balancer/sdk';
import { SwapFormState } from './useSwapForm';
import { parseUnits } from 'viem';

type Props = {
  formState: SwapFormState;
};

export const useSwapAmount = ({ formState }: Props) => {
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
