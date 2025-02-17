import { Address } from 'viem';
import { arbitrum } from 'viem/chains';

export type SupportedToken = {
  address: Address;
  symbol: string;
  decimals: number;
  logo: string;
  chainId: number;
};

export type SupportedChainId = typeof arbitrum.id;

export const supportedRPCs: Record<SupportedChainId, string> = {
  [arbitrum.id]: arbitrum.rpcUrls.default.http[0],
};

export const supportedTokens: Record<SupportedChainId, SupportedToken[]> = {
  [arbitrum.id]: [
    {
      address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
      symbol: 'USDC',
      decimals: 6,
      logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
      chainId: arbitrum.id,
    },
    {
      address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
      symbol: 'WETH',
      decimals: 18,
      logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
      chainId: arbitrum.id,
    },
  ],
};
