import { TokenSelect } from '@/components/SwapForm/TokenSelect';
import { supportedTokens } from '@/lib/tokens';
import { fireEvent, render } from '@testing-library/react';
import { arbitrum } from 'viem/chains';
import { describe, expect, it, vi } from 'vitest';

describe('TokenSelect', () => {
  it('renders select token placeholder', () => {
    const { getByText } = render(
      <TokenSelect
        value={undefined}
        chainId={arbitrum.id}
        onValueChange={vi.fn()}
      />,
    );
    expect(getByText('Select token')).toBeInTheDocument();
  });

  it('renders selected token symbol', () => {
    const token = supportedTokens[arbitrum.id][0];

    const { getByText } = render(
      <TokenSelect
        value={token.address}
        chainId={arbitrum.id}
        onValueChange={vi.fn()}
      />,
    );

    expect(getByText(token.symbol)).toBeInTheDocument();
  });

  it('renders token list on select open', () => {
    const { getByRole } = render(
      <TokenSelect
        value={undefined}
        chainId={arbitrum.id}
        onValueChange={vi.fn()}
      />,
    );

    fireEvent.click(getByRole('combobox'));

    const menu = getByRole('presentation');

    for (const token of supportedTokens[arbitrum.id]) {
      expect(menu.textContent).includes(token.symbol);
    }
  });

  it('calls onValueChange with selected token', () => {
    const token = supportedTokens[arbitrum.id][0];
    const onValueChange = vi.fn();

    const { getByRole, getByText } = render(
      <TokenSelect
        value={undefined}
        chainId={arbitrum.id}
        onValueChange={onValueChange}
      />,
    );

    fireEvent.click(getByRole('combobox'));
    fireEvent.click(getByText(token.symbol));

    expect(onValueChange).toHaveBeenCalledWith(token.address);
  });
});
