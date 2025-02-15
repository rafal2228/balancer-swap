import { Slippage } from '@balancer/sdk';
import { formatEther } from 'viem';

export const parseSlippage = (slippage: string): bigint => {
  if (!/^\d*\.?\d*$/.test(slippage)) {
    return 0n;
  }

  return Slippage.fromPercentage(slippage as `${number}`).amount;
};

export const formatSlippage = (slippage: bigint): string => {
  return formatEther(slippage * 100n);
};
