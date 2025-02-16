'use client';
import { SLIPPAGE_REGEX } from '@/lib/swap/slippage';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/popover';
import { Settings } from 'lucide-react';

type Props = {
  slippage: string;
  onSlippageChange: (slippage: string) => void;
};

export const SwapConfiguration = ({ slippage, onSlippageChange }: Props) => {
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
              className="col-span-2 h-8"
              value={slippage}
              onChange={(e) => {
                if (SLIPPAGE_REGEX.test(e.target.value)) {
                  onSlippageChange(e.target.value.trim());
                }
              }}
            />

            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSlippageChange('0.5')}
              >
                0.5%
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSlippageChange('1')}
              >
                1%
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSlippageChange('2')}
              >
                2%
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
