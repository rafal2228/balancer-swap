'use client';
import { useToast } from '@/hooks/use-toast';
import { parseFormAmount } from '@/lib/swap/parseFormAmount';
import { parseSlippage } from '@/lib/swap/slippage';
import { useOnSwapSuccess, useSwap } from '@/lib/swap/useSwap';
import { useSwapForm } from '@/lib/swap/useSwapForm';
import { Button } from '@/ui/button';
import { Card, CardContent, CardHeader } from '@/ui/card';
import { cn } from '@/utils';
import { RefreshCcwDot } from 'lucide-react';
import { ComponentProps, useEffect } from 'react';
import { arbitrum } from 'viem/chains';
import { useAccount } from 'wagmi';
import { SwapConfiguration } from './SwapConfiguration';
import { SwapError } from './SwapError';
import { SwapSubmit } from './SwapSubmit';
import { TokenField } from './TokenField';

type Props = Omit<ComponentProps<'div'>, 'children'>;

export function SwapForm({ className, ...props }: Props) {
  const account = useAccount();
  const { toast } = useToast();
  const [formState, dispatch] = useSwapForm();
  const swapAmount = parseFormAmount(formState);
  const parsedSlippage = parseSlippage(formState.slippage);

  const swap = useSwap({
    slippage: parsedSlippage,
    amount: swapAmount,
    chainId: arbitrum.id,
    tokenIn: formState.tokenIn,
    tokenOut: formState.tokenOut,
    swapKind: formState.swapKind,
    userAddress: account.address,
  });
  const refreshSwap = useOnSwapSuccess();
  const swapStatus = swap.receipt.data?.status;

  useEffect(() => {
    if (swapStatus === 'success') {
      refreshSwap();
      dispatch({ type: 'Reset' });
      toast({
        title: 'Swap success',
      });
    }

    if (swapStatus === 'reverted') {
      toast({
        title: 'Swap reverted',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [swapStatus]);

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() =>
                dispatch({
                  type: 'SwitchTokens',
                })
              }
            >
              Switch tokens
              <RefreshCcwDot />
            </Button>

            <SwapConfiguration
              slippage={formState.slippage}
              onSlippageChange={(slippage) =>
                dispatch({ type: 'ChangeSlippage', payload: { slippage } })
              }
            />
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <TokenField
                tokenType="in"
                swapAmount={swapAmount}
                swap={swap}
                formState={formState}
                dispatch={dispatch}
              />

              <TokenField
                tokenType="out"
                swapAmount={swapAmount}
                swap={swap}
                formState={formState}
                dispatch={dispatch}
              />
            </div>

            <SwapSubmit
              formState={formState}
              swap={swap}
              swapAmount={swapAmount}
              parsedSlippage={parsedSlippage}
            />

            <SwapError
              formState={formState}
              swap={swap}
              parsedSlippage={parsedSlippage}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
