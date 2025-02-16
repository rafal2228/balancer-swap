import { MAX_UINT256, SwapKind, VAULT, VAULT_V3 } from '@balancer/sdk';
import { useQuery } from '@tanstack/react-query';
import invariant from 'tiny-invariant';
import { Address, erc20Abi } from 'viem';
import {
  usePrepareTransactionRequest,
  useReadContract,
  useSendTransaction,
  useWriteContract,
} from 'wagmi';
import { SupportedChainId, SupportedToken, supportedTokens } from '../tokens';
import { prepareSwap, prepareSwapCall } from './prepare';
import { isValidSlippage } from './slippage';

type Props = {
  userAddress: Address | undefined;
  amount: bigint | undefined;
  slippage: bigint | undefined;
  chainId: SupportedChainId | undefined;
  swapKind: SwapKind | undefined;
  tokenIn: SupportedToken | undefined;
  tokenOut: SupportedToken | undefined;
};

const isValidTokens = (
  props: Pick<Props, 'chainId' | 'tokenIn' | 'tokenOut'>,
): props is Required<Pick<Props, 'chainId' | 'tokenIn' | 'tokenOut'>> => {
  if (typeof props.chainId !== 'number') {
    return false;
  }

  const supportedTokensOnChain = supportedTokens[props.chainId];

  return (
    Array.isArray(supportedTokensOnChain) &&
    !!props.tokenIn &&
    !!props.tokenOut &&
    supportedTokensOnChain.includes(props.tokenIn) &&
    supportedTokensOnChain.includes(props.tokenOut)
  );
};

const isValidSwapKind = (
  swapKind: SwapKind | undefined,
): swapKind is SwapKind =>
  (typeof swapKind === 'number' && swapKind === SwapKind.GivenIn) ||
  swapKind === SwapKind.GivenOut;

const isValidAmount = (amount: bigint | undefined): amount is bigint =>
  typeof amount === 'bigint' && amount > 0n;

const getVaultAddress = (
  chainId: SupportedChainId | undefined,
  protocolVersion: 2 | 3 | undefined,
) => {
  if (typeof chainId !== 'number' || typeof protocolVersion !== 'number') {
    return undefined;
  }

  return protocolVersion === 2 ? VAULT[chainId] : VAULT_V3[chainId];
};

const MAX_BIGINT = BigInt(MAX_UINT256);

export const useSwap = ({
  userAddress,
  amount,
  slippage,
  chainId,
  swapKind,
  tokenIn,
  tokenOut,
}: Props) => {
  const swapEnabled =
    isValidAmount(amount) &&
    isValidTokens({ chainId, tokenIn, tokenOut }) &&
    isValidSwapKind(swapKind);

  const swap = useQuery({
    enabled: swapEnabled,
    queryKey: ['useSwap', 'swap', swapKind, chainId, tokenIn, tokenOut, amount],
    queryFn: () => {
      invariant(amount, 'Amount is required');
      invariant(chainId, 'ChainId is required');
      invariant(tokenIn, 'TokenIn is required');
      invariant(tokenOut, 'TokenOut is required');
      invariant(isValidSwapKind(swapKind), 'SwapKind is required');

      return prepareSwap({
        amount,
        chainId,
        swapKind,
        tokenIn,
        tokenOut,
      });
    },
  });

  // We need to check swap kind - for givenIn the swap object does not contain correct inputAmount.amount value
  const tokenInAmount =
    swapKind === SwapKind.GivenIn ? amount : swap.data?.inputAmount.amount;

  const balance = useReadContract({
    abi: erc20Abi,
    address: tokenIn?.address,
    functionName: 'balanceOf',
    args: typeof userAddress === 'string' ? [userAddress] : undefined,
    query: {
      enabled: typeof userAddress === 'string',
    },
  });

  const vaultAddress = getVaultAddress(chainId, swap.data?.protocolVersion);

  const allowanceEnabled =
    swapEnabled &&
    typeof userAddress === 'string' &&
    typeof vaultAddress === 'string';

  const allowance = useReadContract({
    abi: erc20Abi,
    address: tokenIn?.address,
    functionName: 'allowance',
    args: allowanceEnabled ? [userAddress, vaultAddress] : undefined,
    query: {
      enabled: allowanceEnabled,
    },
  });

  const requiresApproval =
    allowanceEnabled &&
    isValidAmount(tokenInAmount) &&
    allowance.status === 'success' &&
    allowance.data < tokenInAmount;

  const approval = useWriteContract({
    mutation: {
      onSuccess() {
        allowance.refetch();
      },
    },
  });

  const handleApprove = () => {
    if (!requiresApproval) {
      return;
    }

    invariant(tokenIn, 'TokenIn is required');
    invariant(vaultAddress, 'VaultAddress is required');

    approval.writeContract({
      abi: erc20Abi,
      address: tokenIn.address,
      functionName: 'approve',
      args: [vaultAddress, MAX_BIGINT],
    });
  };

  const swapCallEnabled =
    swapEnabled &&
    swap.status === 'success' &&
    typeof tokenInAmount === 'bigint' &&
    balance.status === 'success' &&
    balance.data >= tokenInAmount &&
    allowance.status === 'success' &&
    !requiresApproval &&
    isValidSlippage(slippage);

  const swapCall = useQuery({
    enabled: swapCallEnabled,
    queryKey: [
      'useSwap',
      'swapCall',
      userAddress,
      slippage,
      chainId,
      swap.data,
    ],
    queryFn: () => {
      invariant(userAddress, 'UserAddress is required');
      invariant(slippage, 'Slippage is required');
      invariant(chainId, 'ChainId is required');
      invariant(swap.data, 'Swap is required');

      return prepareSwapCall({
        userAddress,
        slippage,
        chainId,
        swap: swap.data,
      });
    },
  });

  const prepareTransactionEnabled =
    swapCallEnabled && swapCall.status === 'success';

  const prepareTransaction = usePrepareTransactionRequest({
    to: swapCall.data?.to,
    data: swapCall.data?.callData,
    value: swapCall.data?.value,
    query: {
      enabled: prepareTransactionEnabled,
    },
  });

  const sendTransaction = useSendTransaction();

  const handleSwap = async () => {
    if (!prepareTransactionEnabled || prepareTransaction.status !== 'success') {
      return;
    }

    sendTransaction.sendTransaction(prepareTransaction.data);
  };

  return {
    tokenInAmount,
    allowance,
    approval,
    balance,
    prepareTransaction,
    prepareTransactionEnabled,
    requiresApproval,
    swap,
    swapEnabled,
    swapCall,
    sendTransaction,
    handleApprove,
    handleSwap,
  };
};
