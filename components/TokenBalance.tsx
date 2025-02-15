import { SupportedToken } from '@/lib/tokens';
import { erc20Abi, formatUnits } from 'viem';
import { useAccount, useReadContract } from 'wagmi';

type Props = {
  token: SupportedToken;
};

export const TokenBalance = ({ token }: Props) => {
  const account = useAccount();
  const balance = useReadContract({
    abi: erc20Abi,
    address: token.address,
    functionName: 'balanceOf',
    args: !!account.address ? [account.address] : undefined,
    query: {
      enabled: !!account.address,
    },
  });

  if (!account.isConnected) {
    return null;
  }

  if (balance.status === 'error') {
    return <span>Unable to load balance</span>;
  }

  if (balance.status === 'pending') {
    return <span>...</span>;
  }

  return (
    <span>
      {formatUnits(balance.data, token.decimals)} {token.symbol}
    </span>
  );
};
