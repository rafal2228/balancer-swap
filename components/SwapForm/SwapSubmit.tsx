'use client';
import { isValidSlippage } from '@/lib/swap/slippage';
import { useSwap } from '@/lib/swap/useSwap';
import { useSwapForm } from '@/lib/swap/useSwapForm';
import { Button } from '@/ui/button';
import { LoaderCircle } from 'lucide-react';
import { useAccount, useSwitchChain } from 'wagmi';

type Props = {
  formState: ReturnType<typeof useSwapForm>[0];
  swap: ReturnType<typeof useSwap>;
  swapAmount: bigint;
  parsedSlippage: bigint;
};

export const SwapSubmit = ({
  formState,
  swap,
  swapAmount,
  parsedSlippage,
}: Props) => {
  const account = useAccount();
  const switchChain = useSwitchChain();

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

  if (formState.chainId !== account.chainId) {
    return (
      <Button
        className="w-full"
        onClick={() => switchChain.switchChain({ chainId: formState.chainId })}
      >
        Switch network
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
    return (
      <Button className="w-full" disabled>
        Fill the form to swap
      </Button>
    );
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
