import { Toaster } from '@/ui/toaster';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  act,
  render as baseRender,
  RenderOptions,
} from '@testing-library/react';
import { PropsWithChildren, ReactElement } from 'react';
import { createConfig, http, WagmiProvider } from 'wagmi';
import { connect, disconnect } from 'wagmi/actions';
import { arbitrum } from 'wagmi/chains';
import { mock } from 'wagmi/connectors';
import { hashFn } from 'wagmi/query';

export * from '@testing-library/react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryKeyHashFn: hashFn,
    },
  },
});

export const defaultAccount =
  '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266' as const;

const config = createConfig({
  chains: [arbitrum],
  connectors: [
    mock({
      accounts: [defaultAccount],
    }),
  ],
  storage: null,
  transports: {
    [arbitrum.id]: http(),
  },
});

const Providers = ({ children }: PropsWithChildren) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}

          <Toaster />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export const connectWithDefaultUser = () => {
  return act(() => connect(config, { connector: config.connectors[0] }));
};

export const disconnectWithDefaultUser = () => {
  return act(() => disconnect(config, { connector: config.connectors[0] }));
};

export const render = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) =>
  baseRender(ui, {
    wrapper: Providers,
    ...options,
  });
