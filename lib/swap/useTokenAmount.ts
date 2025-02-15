import { Swap, SwapKind } from '@balancer/sdk';
import { formatUnits } from 'viem';
import { SwapFormState } from './useSwapForm';

type Props = {
  formState: SwapFormState;
  swap: Swap | undefined;
  tokenType: 'in' | 'out';
};

export const useTokenAmount = ({ formState, swap, tokenType }: Props) => {
  if (tokenType === 'out') {
    if (formState.swapKind === SwapKind.GivenOut) {
      return formState.amount;
    }

    const maybeAmount = swap?.outputAmount?.amount;
    const maybeDecimals = swap?.outputAmount?.token?.decimals;

    if (typeof maybeAmount !== 'bigint' || typeof maybeDecimals !== 'number') {
      return '0';
    }

    return formatUnits(maybeAmount, maybeDecimals);
  }

  if (formState.swapKind === SwapKind.GivenIn) {
    return formState.amount;
  }

  const maybeAmount = swap?.inputAmount?.amount;
  const maybeDecimals = swap?.inputAmount?.token?.decimals;

  if (typeof maybeAmount !== 'bigint' || typeof maybeDecimals !== 'number') {
    return '0';
  }

  return formatUnits(maybeAmount, maybeDecimals);
};
