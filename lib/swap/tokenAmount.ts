import { Swap, SwapKind } from '@balancer/sdk';
import { formatUnits } from 'viem';
import { SwapFormState } from './useSwapForm';

const AMOUNT_PRECISION = 6;

export const AMOUNT_REGEX = new RegExp(`^\\d*\\.?\\d{0,${AMOUNT_PRECISION}}`);

export const formatAmount = ({
  formState,
  swap,
  tokenType,
}: {
  formState: SwapFormState;
  swap: Swap | undefined;
  tokenType: 'in' | 'out';
}) => {
  if (tokenType === 'out') {
    if (formState.swapKind === SwapKind.GivenOut) {
      return formState.amount;
    }

    const maybeAmount = swap?.outputAmount?.amount;
    const maybeDecimals = swap?.outputAmount?.token?.decimals;

    if (typeof maybeAmount !== 'bigint' || typeof maybeDecimals !== 'number') {
      return '0';
    }

    return (
      AMOUNT_REGEX.exec(formatUnits(maybeAmount, maybeDecimals))?.at(0) ?? '0'
    );
  }

  if (formState.swapKind === SwapKind.GivenIn) {
    return formState.amount;
  }

  const maybeAmount = swap?.inputAmount?.amount;
  const maybeDecimals = swap?.inputAmount?.token?.decimals;

  if (typeof maybeAmount !== 'bigint' || typeof maybeDecimals !== 'number') {
    return '0';
  }

  return (
    AMOUNT_REGEX.exec(formatUnits(maybeAmount, maybeDecimals))?.at(0) ?? '0'
  );
};
