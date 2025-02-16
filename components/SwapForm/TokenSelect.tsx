'use client';
import { SupportedChainId, supportedTokens } from '@/lib/tokens';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select';
import Image from 'next/image';
import { Address } from 'viem';

type Props = {
  value: Address | undefined;
  chainId: SupportedChainId;
  onValueChange(address: Address): void;
};

export const TokenSelect = ({ value, chainId, onValueChange }: Props) => {
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
