'use client';
import {
  isValidSlippage,
  parseSlippage,
  SLIPPAGE_REGEX,
} from '@/lib/swap/slippage';
import { AMOUNT_REGEX, formatAmount } from '@/lib/swap/tokenAmount';
import { useSwap } from '@/lib/swap/useSwap';
import { useSwapAmount } from '@/lib/swap/useSwapAmount';
import { useSwapForm } from '@/lib/swap/useSwapForm';
import { SupportedChainId, supportedTokens } from '@/lib/tokens';
import { Alert, AlertDescription, AlertTitle } from '@/ui/alert';
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
import {
  AlertCircle,
  LoaderCircle,
  RefreshCcwDot,
  Settings,
} from 'lucide-react';
import Image from 'next/image';
import { ComponentProps } from 'react';
import { Address } from 'viem';
import { arbitrum } from 'viem/chains';
import { useAccount } from 'wagmi';
import { TokenBalance } from './TokenBalance';

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
      <SelectTrigger className="w-[160px]">
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

const TokenField = ({
  swapAmount,
  formState,
  swap,
  tokenType,
  dispatch,
}: {
  swapAmount: bigint;
  tokenType: 'in' | 'out';
  swap: ReturnType<typeof useSwap>;
  formState: ReturnType<typeof useSwapForm>[0];
  dispatch: ReturnType<typeof useSwapForm>[1];
}) => {
  const amount = formatAmount({
    formState,
    swap: swap.swap.data,
    tokenType,
  });

  const token = tokenType === 'in' ? formState.tokenIn : formState.tokenOut;

  const isLoading = (() => {
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
  })();

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
                    amount:
                      AMOUNT_REGEX.exec(e.target.value)?.at(0) ??
                      e.target.value,
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
              onChange={(e) => {
                if (SLIPPAGE_REGEX.test(e.target.value)) {
                  onSlippageChange(e.target.value.trim());
                }
              }}
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

  const renderSubmit = () => {
    if (!isValidSlippage(parsedSlippage)) {
      return (
        <Button className="w-full" disabled>
          Incorrect slippage
        </Button>
      );
    }

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

    if (
      swap.balance.status === 'success' &&
      swap.tokenInAmount &&
      swap.tokenInAmount > swap.balance.data
    ) {
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
            Approving token
            <LoaderCircle className="animate-spin" />
          </Button>
        );
      }

      return (
        <Button className="w-full" onClick={() => swap.handleApprove()}>
          Approve token to swap
        </Button>
      );
    }

    if (swapAmount === 0n) {
      return <Button className="w-full">Swap</Button>;
    }

    if (swap.swap.status === 'pending') {
      return (
        <Button className="w-full" disabled>
          Estimating swap
          <LoaderCircle className="animate-spin" />
        </Button>
      );
    }

    if (
      swap.swapCall.status === 'pending' ||
      swap.prepareTransaction.status === 'pending'
    ) {
      return (
        <Button className="w-full" disabled>
          Preparing swap call
          <LoaderCircle className="animate-spin" />
        </Button>
      );
    }

    if (swap.sendTransaction.status === 'pending') {
      return (
        <Button className="w-full" disabled>
          Swapping
          <LoaderCircle className="animate-spin" />
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

  const renderError = () => {
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

            {renderSubmit()}

            {renderError()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
