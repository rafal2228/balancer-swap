import {
  BalancerApi,
  Slippage,
  Swap,
  SwapKind,
  Token,
  TokenAmount,
} from '@balancer/sdk';
import { Address } from 'viem';
import { SupportedChainId, supportedRPCs, SupportedToken } from '../tokens';

export const prepareSwap = async (config: {
  swapKind: SwapKind;
  chainId: SupportedChainId;
  tokenIn: SupportedToken;
  tokenOut: SupportedToken;
  amount: bigint;
}) => {
  const tokenIn = new Token(
    config.chainId,
    config.tokenIn.address,
    config.tokenIn.decimals,
    config.tokenIn.symbol,
  );

  const tokenOut = new Token(
    config.chainId,
    config.tokenOut.address,
    config.tokenOut.decimals,
    config.tokenOut.symbol,
  );

  const swapAmount = TokenAmount.fromRawAmount(
    config.swapKind === SwapKind.GivenIn ? tokenIn : tokenOut,
    config.amount,
  );

  const balancerApi = new BalancerApi(
    'https://api-v3.balancer.fi/',
    config.chainId,
  );

  const paths = await balancerApi.sorSwapPaths.fetchSorSwapPaths({
    chainId: config.chainId,
    tokenIn: tokenIn.address,
    tokenOut: tokenOut.address,
    swapKind: config.swapKind,
    swapAmount,
  });

  return new Swap({
    chainId: config.chainId,
    paths,
    swapKind: config.swapKind,
  });
};

export const prepareSwapCall = async ({
  userAddress,
  slippage,
  chainId,
  swap,
  deadline = 999999999999999999n,
  wethIsEth = false,
}: {
  userAddress: Address;
  slippage: bigint;
  chainId: SupportedChainId;
  swap: Swap;
  deadline?: bigint;
  wethIsEth?: boolean;
}) => {
  const queryOutput = await swap.query(supportedRPCs[chainId]);

  if (swap.protocolVersion === 2) {
    return swap.buildCall({
      slippage: Slippage.fromRawAmount(slippage),
      deadline,
      queryOutput,
      wethIsEth,
      sender: userAddress,
      recipient: userAddress,
    });
  }

  return swap.buildCall({
    slippage: Slippage.fromRawAmount(slippage),
    deadline,
    queryOutput,
    wethIsEth,
  });
};
