'use client';
import { isValidSlippage } from '@/lib/swap/slippage';
import { useSwap } from '@/lib/swap/useSwap';
import { useSwapForm } from '@/lib/swap/useSwapForm';
import { Alert, AlertDescription, AlertTitle } from '@/ui/alert';
import { SwapKind } from '@balancer/sdk';
import { AlertCircle } from 'lucide-react';

type Props = {
  formState: ReturnType<typeof useSwapForm>[0];
  swap: ReturnType<typeof useSwap>;
  parsedSlippage: bigint;
};

export const SwapError = ({ formState, swap, parsedSlippage }: Props) => {
  if (!isValidSlippage(parsedSlippage)) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Incorrect slippage</AlertTitle>
        <AlertDescription>
          Slippage needs to be greater than 0% and smaller or equal to 50%
        </AlertDescription>
      </Alert>
    );
  }

  const usedToken =
    formState.swapKind === SwapKind.GivenIn
      ? formState.tokenIn
      : formState.tokenOut;

  if (usedToken && swap.balance.status === 'error') {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{usedToken.symbol} balance error</AlertTitle>
        <AlertDescription>
          {swap.balance.error.message || 'Unable to fetch balance'}
        </AlertDescription>
      </Alert>
    );
  }

  if (usedToken && swap.allowance.status === 'error') {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{usedToken.symbol} allowance error</AlertTitle>
        <AlertDescription>
          {swap.allowance.error.message || 'Unable to fetch allowance'}
        </AlertDescription>
      </Alert>
    );
  }

  if (swap.swap.status === 'error') {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Swap preparation error</AlertTitle>
        <AlertDescription>
          {swap.swap.error.message || 'Unable to find swap path'}
        </AlertDescription>
      </Alert>
    );
  }

  if (swap.swapCall.status === 'error') {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Swap preparation error</AlertTitle>
        <AlertDescription>
          {swap.swapCall.error.message || 'Unable to prepare swap call'}
        </AlertDescription>
      </Alert>
    );
  }

  if (swap.prepareTransaction.status === 'error') {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Transaction preparation error</AlertTitle>
        <AlertDescription>
          {swap.prepareTransaction.error.message ||
            'Unable to prepare swap transaction'}
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};
