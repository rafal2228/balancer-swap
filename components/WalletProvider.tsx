'use client';
import { env } from '@/lib/env';
import {
  darkTheme,
  getDefaultConfig,
  lightTheme,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PropsWithChildren } from 'react';
import { WagmiProvider } from 'wagmi';
import { arbitrum } from 'wagmi/chains';

import '@rainbow-me/rainbowkit/styles.css';
import { useTheme } from 'next-themes';

const config = getDefaultConfig({
  appName: 'Balancer SWAP',
  projectId: env.walletConnectProjectId,
  chains: [arbitrum],
  ssr: true,
});

const queryClient = new QueryClient();

export function WalletProvider({ children }: PropsWithChildren) {
  const theme = useTheme();

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={theme.resolvedTheme === 'dark' ? darkTheme() : lightTheme()}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
