import { defaultAccount, mockReadContractReturn } from '@/lib/test-utils';
import { supportedTokens } from '@/lib/tokens';
import { render } from '@testing-library/react';
import { parseUnits } from 'viem';
import { arbitrum } from 'viem/chains';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAccount, useReadContract } from 'wagmi';
import { TokenBalance } from './TokenBalance';

const token = supportedTokens[arbitrum.id][0];

vi.mock('wagmi', () => {
  return {
    useAccount: vi.fn(() => ({
      address: undefined,
      isConnected: false,
    })),
    useReadContract: vi.fn(() => mockReadContractReturn()),
  };
});

describe('TokenBalance component', () => {
  beforeEach(() => {
    vi.mocked(useAccount).mockClear();
    vi.mocked(useReadContract).mockClear();
  });

  it('renders the nothing if user is not connected', () => {
    const { container } = render(<TokenBalance token={token} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('Renders error message if balance is not available', () => {
    vi.mocked(useAccount).mockReturnValue({
      address: defaultAccount,
      isConnected: true,
    } as unknown as ReturnType<typeof useAccount>);

    vi.mocked(useReadContract).mockReturnValueOnce(
      mockReadContractReturn({
        status: 'error',
      }),
    );

    const { getByText } = render(<TokenBalance token={token} />);

    expect(getByText('Unable to load balance')).toBeInTheDocument();
  });

  it('Renders loading dots', () => {
    vi.mocked(useAccount).mockReturnValue({
      address: defaultAccount,
      isConnected: true,
    } as unknown as ReturnType<typeof useAccount>);

    vi.mocked(useReadContract).mockReturnValueOnce(
      mockReadContractReturn({
        status: 'pending',
      }),
    );

    const { getByText } = render(<TokenBalance token={token} />);

    expect(getByText('...')).toBeInTheDocument();
  });

  it('Renders formatted balance', () => {
    vi.mocked(useAccount).mockReturnValue({
      address: defaultAccount,
      isConnected: true,
    } as unknown as ReturnType<typeof useAccount>);

    vi.mocked(useReadContract).mockReturnValueOnce(
      mockReadContractReturn({
        status: 'success',
        data: parseUnits('10', token.decimals),
      }),
    );

    const { getByText } = render(<TokenBalance token={token} />);

    expect(getByText(`10 ${token.symbol}`)).toBeInTheDocument();
  });
});
