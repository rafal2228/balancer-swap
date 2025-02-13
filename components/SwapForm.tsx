import { supportedTokens } from '@/lib/tokens';
import { Button } from '@/ui/button';
import { Card, CardContent, CardHeader } from '@/ui/card';
import { Input } from '@/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select';
import { cn } from '@/utils';
import { Label } from '@radix-ui/react-label';
import { RefreshCcwDot, Settings } from 'lucide-react';
import Image from 'next/image';
import { ComponentProps } from 'react';
import { Address, formatUnits } from 'viem';
import { arbitrum } from 'viem/chains';

type Props = Omit<ComponentProps<'div'>, 'children'>;

const slippageDecimals = 6;

const TokenSelect = ({
  value,
  chainId,
}: {
  value: Address;
  chainId: number;
}) => {
  const tokens = supportedTokens[chainId];

  return (
    <Select value={value}>
      <SelectTrigger className="w-[220px]">
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

const SwapConfiguration = (props: { slippage: bigint }) => {
  const slippage = formatUnits(props.slippage, slippageDecimals);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          {slippage}% <Settings />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80" align="end">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Slippage</h4>
            <p className="text-sm text-muted-foreground">
              Slippage is the difference between the expected price of a trade
              and the price at which the trade is executed.
            </p>
          </div>
          <div className="grid gap-2">
            <Input
              id="slippage"
              value={slippage}
              className="col-span-2 h-8"
              readOnly
            />

            <div className="flex gap-2">
              <Button variant="ghost" size="sm">
                0.5%
              </Button>
              <Button variant="ghost" size="sm">
                1%
              </Button>
              <Button variant="ghost" size="sm">
                2%
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export function SwapForm({ className, ...props }: Props) {
  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button variant="outline">
              Switch tokens
              <RefreshCcwDot />
            </Button>

            <SwapConfiguration slippage={500000n} />
          </div>
        </CardHeader>

        <CardContent>
          <form className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <div className="grid gap-2">
                <Label htmlFor="tokenIn">Sell:</Label>

                <div className="flex flex-row gap-2">
                  <Input className="grow" id="tokenIn" type="text" required />

                  <TokenSelect
                    value={supportedTokens[arbitrum.id][0].address}
                    chainId={arbitrum.id}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="tokenOut">Buy:</Label>

                <div className="flex flex-row gap-2">
                  <Input className="grow" id="tokenOut" type="text" required />

                  <TokenSelect
                    value={supportedTokens[arbitrum.id][1].address}
                    chainId={arbitrum.id}
                  />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full">
              Swap
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
