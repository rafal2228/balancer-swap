import { SwapKind } from '@balancer/sdk';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useSwapForm } from './useSwapForm';
import { zeroAddress } from 'viem';

describe('useSwapForm', () => {
  it('should unset token out when token in is changed to the same token', () => {
    const { result } = renderHook(() => useSwapForm());

    expect(result.current[0].tokenOut).not.toBeUndefined();

    act(() => {
      result.current[1]({
        type: 'ChangeTokenIn',
        payload: {
          address: result.current[0].tokenOut?.address!,
        },
      });
    });

    expect(result.current[0].tokenOut).toBeUndefined();
  });

  it('should not update token in if set to unknown token', () => {
    const { result } = renderHook(() => useSwapForm());

    const tokenIn = result.current[0].tokenIn;

    act(() => {
      result.current[1]({
        type: 'ChangeTokenIn',
        payload: {
          address: zeroAddress,
        },
      });
    });

    expect(result.current[0].tokenIn).toBe(tokenIn);
  });

  it('should unset token in when token out is changed to the same token', () => {
    const { result } = renderHook(() => useSwapForm());

    expect(result.current[0].tokenIn).not.toBeUndefined();

    act(() => {
      result.current[1]({
        type: 'ChangeTokenOut',
        payload: {
          address: result.current[0].tokenIn?.address!,
        },
      });
    });

    expect(result.current[0].tokenIn).toBeUndefined();
  });

  it('should not update token out if set to unknown token', () => {
    const { result } = renderHook(() => useSwapForm());

    const tokenOut = result.current[0].tokenOut;

    act(() => {
      result.current[1]({
        type: 'ChangeTokenOut',
        payload: {
          address: zeroAddress,
        },
      });
    });

    expect(result.current[0].tokenOut).toBe(tokenOut);
  });

  it('should switch tokens', () => {
    const { result } = renderHook(() => useSwapForm());

    const tokenIn = result.current[0].tokenIn;
    const tokenOut = result.current[0].tokenOut;

    expect(tokenIn).not.toBe(tokenOut);
    expect(tokenIn).not.toBeUndefined();
    expect(tokenOut).not.toBeUndefined();

    act(() => {
      result.current[1]({
        type: 'SwitchTokens',
      });
    });

    expect(tokenIn).toBe(result.current[0].tokenOut);
    expect(tokenOut).toBe(result.current[0].tokenIn);
  });

  it('should change swap kind to given out on token switch', () => {
    const { result } = renderHook(() => useSwapForm());

    expect(result.current[0].swapKind).toBe(SwapKind.GivenIn);

    act(() => {
      result.current[1]({
        type: 'SwitchTokens',
      });
    });

    expect(result.current[0].swapKind).toBe(SwapKind.GivenOut);
  });

  it('should change swap kind when token amount gets updated', () => {
    const { result } = renderHook(() => useSwapForm());

    expect(result.current[0].swapKind).toBe(SwapKind.GivenIn);

    act(() => {
      result.current[1]({
        type: 'ChangeTokenOutAmount',
        payload: {
          amount: '10',
        },
      });
    });

    expect(result.current[0].swapKind).toBe(SwapKind.GivenOut);
    expect(result.current[0].amount).toBe('10');

    act(() => {
      result.current[1]({
        type: 'ChangeTokenInAmount',
        payload: {
          amount: '20',
        },
      });
    });

    expect(result.current[0].swapKind).toBe(SwapKind.GivenIn);
    expect(result.current[0].amount).toBe('20');
  });

  it('should update slippage', () => {
    const { result } = renderHook(() => useSwapForm());

    expect(result.current[0].slippage).toBe('0.5');

    act(() => {
      result.current[1]({
        type: 'ChangeSlippage',
        payload: {
          slippage: '1.23',
        },
      });
    });

    expect(result.current[0].slippage).toBe('1.23');
  });

  it('should retain chain id and slippage on form reset', () => {
    const { result } = renderHook(() => useSwapForm());

    const slippage = '1.23';
    const chainId = result.current[0].chainId;

    act(() => {
      result.current[1]({
        type: 'ChangeSlippage',
        payload: {
          slippage,
        },
      });
    });

    act(() => {
      result.current[1]({
        type: 'Reset',
      });
    });

    expect(result.current[0].slippage).toBe(slippage);
    expect(result.current[0].chainId).toBe(chainId);
  });
});
