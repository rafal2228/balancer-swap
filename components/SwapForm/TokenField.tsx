'use client';
import { AMOUNT_REGEX, clipAmount, formatAmount } from '@/lib/swap/tokenAmount';
import { useSwap } from '@/lib/swap/useSwap';
import { useSwapForm } from '@/lib/swap/useSwapForm';
import { Input } from '@/ui/input';
import { SwapKind } from '@balancer/sdk';
import { Label } from '@radix-ui/react-label';
import { LoaderCircle } from 'lucide-react';
import { TokenBalance } from '../TokenBalance';
import { TokenSelect } from './TokenSelect';

const useIsLoading = ({
  swapAmount,
  formState,
  swap,
  tokenType,
}: Pick<Props, 'swapAmount' | 'formState' | 'swap' | 'tokenType'>) => {
  if (
    swapAmount > 0n &&
    formState.swapKind === SwapKind.GivenOut &&
    tokenType === 'in'
  ) {
    return swap.swap.status === 'pending';
  }

  if (
    swapAmount > 0n &&
    formState.swapKind === SwapKind.GivenIn &&
    tokenType === 'out'
  ) {
    return swap.swap.status === 'pending';
  }

  return false;
};

type Props = {
  swapAmount: bigint;
  tokenType: 'in' | 'out';
  swap: ReturnType<typeof useSwap>;
  formState: ReturnType<typeof useSwapForm>[0];
  dispatch: ReturnType<typeof useSwapForm>[1];
};

export const TokenField = ({
  swapAmount,
  formState,
  swap,
  tokenType,
  dispatch,
}: Props) => {
  const amount = formatAmount({
    formState,
    swap: swap.swap.data,
    tokenType,
  });

  const token = tokenType === 'in' ? formState.tokenIn : formState.tokenOut;

  const isLoading = useIsLoading({
    swapAmount,
    formState,
    swap,
    tokenType,
  });

  return (
    <div className="grid gap-2">
      <Label htmlFor={tokenType === 'in' ? 'tokenIn' : 'tokenOut'}>
        {tokenType === 'in' ? 'Sell' : 'Buy'}:
      </Label>

      <div className="flex flex-row gap-2">
        <div className="grow relative">
          <Input
            className="w-full"
            id={tokenType === 'in' ? 'tokenIn' : 'tokenOut'}
            type="text"
            required
            disabled={isLoading}
            value={amount}
            onChange={(e) => {
              if (AMOUNT_REGEX.test(e.target.value)) {
                dispatch({
                  type:
                    tokenType === 'in'
                      ? 'ChangeTokenInAmount'
                      : 'ChangeTokenOutAmount',
                  payload: {
                    amount: clipAmount(e.target.value),
                  },
                });
              }
            }}
          />

          {isLoading && (
            <div className="absolute right-2 top-0 bottom-0 flex items-center text-muted-foreground animate-spin">
              <LoaderCircle />
            </div>
          )}
        </div>

        <div className="flex-initial">
          <TokenSelect
            value={token?.address}
            chainId={formState.chainId}
            onValueChange={(address) =>
              dispatch({
                type: tokenType === 'in' ? 'ChangeTokenIn' : 'ChangeTokenOut',
                payload: { address },
              })
            }
          />
        </div>
      </div>

      {token && (
        <div className="flex flex-row justify-end text-sm text-muted-foreground">
          <TokenBalance token={token} />
        </div>
      )}
    </div>
  );
};
