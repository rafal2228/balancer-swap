'use client';
import { parseSlippage } from '@/lib/swap/slippage';
import { useSwap } from '@/lib/swap/useSwap';
import { useSwapAmount } from '@/lib/swap/useSwapAmount';
import { useSwapForm } from '@/lib/swap/useSwapForm';
import { useTokenAmount } from '@/lib/swap/useTokenAmount';
import { SupportedChainId, supportedTokens } from '@/lib/tokens';
import { Button } from '@/ui/button';
import { Card, CardContent, CardHeader } from '@/ui/card';
import { Input } from '@/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select';
import { cn } from '@/utils';
import { SwapKind } from '@balancer/sdk';
import { Label } from '@radix-ui/react-label';
import { RefreshCcwDot, Settings } from 'lucide-react';
import Image from 'next/image';
import { ComponentProps } from 'react';
import { Address, formatUnits, parseUnits } from 'viem';
import { arbitrum } from 'viem/chains';
import { useAccount } from 'wagmi';

type Props = Omit<ComponentProps<'div'>, 'children'>;

const TokenSelect = ({
  value,
  chainId,
  onValueChange,
}: {
  value: Address | undefined;
  chainId: SupportedChainId;
  onValueChange(address: Address): void;
}) => {
  const tokens = supportedTokens[chainId];

  return (
    <Select value={value ?? ''} onValueChange={onValueChange}>
      <SelectTrigger className="w-[220px]">
        <SelectValue placeholder="Select token" />
      </SelectTrigger>

      <SelectContent>
        {tokens?.map((token) => (
          <SelectItem key={token.address} value={token.address}>
            <div className="flex gap-2 items-center">
              <Image
                src={token.logo}
                width={24}
                height={24}
                alt={token.symbol}
              />{' '}
              {token.symbol}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

const SwapConfiguration = ({
  slippage,
  onSlippageChange,
}: {
  slippage: string;
  onSlippageChange: (slippage: string) => void;
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          {slippage}% <Settings />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80" align="end">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Slippage</h4>
            <p className="text-sm text-muted-foreground">
              Slippage is the difference between the expected price of a trade
              and the price at which the trade is executed.
            </p>
          </div>
          <div className="grid gap-2">
            <Input
              id="slippage"
              className="col-span-2 h-8"
              value={slippage}
              onChange={(e) => onSlippageChange(e.target.value)}
            />

            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSlippageChange('0.5')}
              >
                0.5%
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSlippageChange('1')}
              >
                1%
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSlippageChange('2')}
              >
                2%
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export function SwapForm({ className, ...props }: Props) {
  const account = useAccount();
  const [formState, dispatch] = useSwapForm();

  const swapAmount = useSwapAmount({ formState });

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

  const tokenInAmount = useTokenAmount({
    formState,
    swap: swap.swap.data,
    tokenType: 'in',
  });

  const tokenOutAmount = useTokenAmount({
    formState,
    swap: swap.swap.data,
    tokenType: 'out',
  });

  const renderSubmit = () => {
    if (!account.isConnected) {
      return (
        <Button className="w-full" disabled>
          Connect wallet to swap
        </Button>
      );
    }

    if (!formState.tokenIn || !formState.tokenOut) {
      return (
        <Button className="w-full" disabled>
          Select tokens to swap
        </Button>
      );
    }

    if (swap.balance.data && swapAmount && swapAmount > swap.balance.data) {
      return (
        <Button className="w-full" disabled>
          Insufficient balance
        </Button>
      );
    }

    if (swap.requiresApproval) {
      if (swap.approval.status === 'pending') {
        return (
          <Button className="w-full" disabled>
            Approving token...
          </Button>
        );
      }

      return (
        <Button className="w-full" onClick={() => swap.handleApprove()}>
          Approve token to swap
        </Button>
      );
    }

    if (swap.swap.status === 'pending') {
      return (
        <Button className="w-full" disabled>
          Estimating swap...
        </Button>
      );
    }

    if (
      swap.swapCall.status === 'pending' ||
      swap.prepareTransaction.status === 'pending'
    ) {
      return (
        <Button className="w-full" disabled>
          Preparing swap call...
        </Button>
      );
    }

    if (swap.sendTransaction.status === 'pending') {
      return (
        <Button className="w-full" disabled>
          Swapping...
        </Button>
      );
    }

    return (
      <Button
        className="w-full"
        onClick={() => {
          swap.handleSwap();
        }}
      >
        Swap
      </Button>
    );
  };

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
              <div className="grid gap-2">
                <Label htmlFor="tokenIn">Sell:</Label>

                <div className="flex flex-row gap-2">
                  <Input
                    className="grow"
                    id="tokenIn"
                    type="text"
                    required
                    value={tokenInAmount}
                    onChange={(e) => {
                      dispatch({
                        type: 'ChangeTokenInAmount',
                        payload: { amount: e.target.value },
                      });
                    }}
                  />

                  <TokenSelect
                    value={formState.tokenIn?.address}
                    chainId={formState.chainId}
                    onValueChange={(address) =>
                      dispatch({
                        type: 'ChangeTokenIn',
                        payload: { address },
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="tokenOut">Buy:</Label>

                <div className="flex flex-row gap-2">
                  <Input
                    className="grow"
                    id="tokenOut"
                    type="text"
                    required
                    value={tokenOutAmount}
                    onChange={(e) => {
                      dispatch({
                        type: 'ChangeTokenOutAmount',
                        payload: { amount: e.target.value },
                      });
                    }}
                  />

                  <TokenSelect
                    value={formState.tokenOut?.address}
                    chainId={formState.chainId}
                    onValueChange={(address) =>
                      dispatch({
                        type: 'ChangeTokenOut',
                        payload: { address },
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {renderSubmit()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
