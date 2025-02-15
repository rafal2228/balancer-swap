import { Slippage } from '@balancer/sdk';
import { formatEther } from 'viem';

export const SLIPPAGE_REGEX = /^\d*\.?\d*$/;

export const parseSlippage = (slippage: string): bigint => {
  if (!SLIPPAGE_REGEX.test(slippage)) {
    return 0n;
  }

  try {
    return Slippage.fromPercentage(slippage as `${number}`).amount;
  } catch {
    return 0n;
  }
};

export const formatSlippage = (slippage: bigint): string => {
  return formatEther(slippage * 100n);
};

export const isValidSlippage = (
  slippage: bigint | undefined,
): slippage is bigint =>
  typeof slippage === 'bigint' &&
  0n < slippage &&
  Slippage.fromPercentage('50').amount >= slippage;
