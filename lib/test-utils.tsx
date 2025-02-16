import { Toaster } from '@/ui/toaster';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import {
  QueryClient,
  QueryClientProvider,
  UseMutationResult,
  UseQueryResult,
} from '@tanstack/react-query';
import {
  act,
  render as baseRender,
  RenderOptions,
} from '@testing-library/react';
import { PropsWithChildren, ReactElement } from 'react';
import { vi } from 'vitest';
import {
  createConfig,
  http,
  UsePrepareTransactionRequestReturnType,
  UseReadContractReturnType,
  UseSendTransactionReturnType,
  UseTransactionReceiptReturnType,
  UseWriteContractReturnType,
  WagmiProvider,
} from 'wagmi';
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

export const mockUseQueryReturn = <T extends UseQueryResult>(
  partial?: Partial<T>,
): T =>
  ({
    data: undefined,
    error: null,
    status: 'pending',
    refetch: vi.fn(),
    ...partial,
  }) as unknown as T;

export const mockReadContractReturn = <T extends UseReadContractReturnType>(
  partial?: Partial<T>,
): T =>
  ({
    data: undefined,
    error: null,
    status: 'pending',
    queryKey: [],
    refetch: vi.fn(),
    ...partial,
  }) as unknown as T;

export const mockUseMutationReturn = <T extends UseMutationResult>(
  partial?: Partial<T>,
): T =>
  ({
    data: undefined,
    error: null,
    status: 'pending',
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    ...partial,
  }) as unknown as T;

export const mockUseWriteContractReturn = <
  T extends UseWriteContractReturnType,
>(
  partial?: Partial<T>,
): T =>
  ({
    data: undefined,
    error: null,
    status: 'pending',
    writeContract: vi.fn(),
    writeContractAsync: vi.fn(),
    ...partial,
  }) as unknown as T;

export const mockUseSendTransactionReturn = <
  T extends UseSendTransactionReturnType,
>(
  partial?: Partial<T>,
): T =>
  ({
    data: undefined,
    error: null,
    status: 'pending',
    sendTransaction: vi.fn(),
    sendTransactionAsync: vi.fn(),
    ...partial,
  }) as unknown as T;

export const mockUseTransactionReceiptReturn = <
  T extends UseTransactionReceiptReturnType,
>(
  partial?: Partial<T>,
): T =>
  ({
    data: undefined,
    error: null,
    status: 'pending',
    ...partial,
  }) as unknown as T;

export const mockUsePrepareTransactionRequestReturn = <
  T extends UsePrepareTransactionRequestReturnType,
>(
  partial?: Partial<T>,
): T =>
  ({
    data: undefined,
    error: null,
    status: 'pending',
    ...partial,
  }) as unknown as T;
