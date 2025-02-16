import { mockUseSwapReturn } from '@/lib/swap/useSwap.mock';
import * as swapFormMocks from '@/lib/swap/useSwapForm.mock';
import { fireEvent, render } from '@/lib/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { TokenField } from './TokenField';

describe('TokenField', () => {
  it('should render token amount from form state', () => {
    const formState = swapFormMocks.givenInState;
    const { container } = render(
      <TokenField
        dispatch={vi.fn()}
        formState={formState}
        tokenType="in"
        swap={mockUseSwapReturn()}
        swapAmount={0n}
      />,
    );

    const input = container.querySelector('input');

    expect(input).toBeInTheDocument();
    expect(input?.value).toEqual(formState.amount);
  });

  it('should clamp token amount on input change', () => {
    const formState = swapFormMocks.givenInState;
    const dispatch = vi.fn();
    const { container } = render(
      <TokenField
        dispatch={dispatch}
        formState={formState}
        tokenType="in"
        swap={mockUseSwapReturn()}
        swapAmount={0n}
      />,
    );

    const input = container.querySelector('input') as HTMLInputElement;

    fireEvent.change(input, {
      target: {
        value: '0.0000000',
      },
    });

    expect(dispatch).toHaveBeenCalledWith({
      type: 'ChangeTokenInAmount',
      payload: {
        amount: '0.000001',
      },
    });
  });

  it('should display loading indicator and disable input', () => {
    const formState = swapFormMocks.givenOutState;
    const { container } = render(
      <TokenField
        dispatch={vi.fn()}
        formState={formState}
        tokenType="in"
        swap={mockUseSwapReturn()}
        swapAmount={1000n}
      />,
    );

    const input = container.querySelector('input') as HTMLInputElement;

    expect(input).toBeDisabled();
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});
