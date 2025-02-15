import { SwapKind } from '@balancer/sdk';
import { useReducer } from 'react';
import { Address } from 'viem';
import { arbitrum } from 'viem/chains';
import { SupportedChainId, SupportedToken, supportedTokens } from '../tokens';

type ChangeTokenIn = {
  type: 'ChangeTokenIn';
  payload: {
    address: Address;
  };
};

type ChangeTokenOut = {
  type: 'ChangeTokenOut';
  payload: {
    address: Address;
  };
};

type SwitchTokens = {
  type: 'SwitchTokens';
};

type ChangeTokenInAmount = {
  type: 'ChangeTokenInAmount';
  payload: {
    amount: string;
  };
};

type ChangeTokenOutAmount = {
  type: 'ChangeTokenOutAmount';
  payload: {
    amount: string;
  };
};

type ChangeSlippage = {
  type: 'ChangeSlippage';
  payload: {
    slippage: string;
  };
};

export type SwapFormState = {
  amount: string;
  slippage: string;
  tokenIn: SupportedToken | undefined;
  tokenOut: SupportedToken | undefined;
  chainId: SupportedChainId;
  swapKind: SwapKind;
};

type Action =
  | ChangeTokenIn
  | ChangeTokenOut
  | SwitchTokens
  | ChangeTokenInAmount
  | ChangeTokenOutAmount
  | ChangeSlippage;

const swapReducer = (state: SwapFormState, action: Action): SwapFormState => {
  switch (action.type) {
    case 'ChangeTokenIn': {
      const token = supportedTokens[state.chainId].find(
        (token) => token.address === action.payload.address,
      );

      if (!token) {
        return state;
      }

      if (token.address === state.tokenOut?.address) {
        return {
          ...state,
          tokenIn: state.tokenOut,
          tokenOut: undefined,
        };
      }

      return {
        ...state,
        tokenIn: token,
      };
    }
    case 'ChangeTokenOut': {
      const token = supportedTokens[state.chainId].find(
        (token) => token.address === action.payload.address,
      );

      if (!token) {
        return state;
      }

      if (token.address === state.tokenIn?.address) {
        return {
          ...state,
          tokenOut: token,
          tokenIn: undefined,
        };
      }

      return {
        ...state,
        tokenOut: token,
      };
    }
    case 'SwitchTokens': {
      return {
        ...state,
        tokenIn: state.tokenOut,
        tokenOut: state.tokenIn,
        swapKind:
          state.swapKind === SwapKind.GivenIn
            ? SwapKind.GivenOut
            : SwapKind.GivenIn,
      };
    }
    case 'ChangeTokenInAmount': {
      return {
        ...state,
        amount: action.payload.amount,
        swapKind: SwapKind.GivenIn,
      };
    }
    case 'ChangeTokenOutAmount': {
      return {
        ...state,
        amount: action.payload.amount,
        swapKind: SwapKind.GivenOut,
      };
    }
    case 'ChangeSlippage': {
      return {
        ...state,
        slippage: action.payload.slippage,
      };
    }
    default:
      return state;
  }
};

const defaultState: SwapFormState = {
  amount: '0',
  slippage: '0.5',
  tokenIn: supportedTokens[arbitrum.id][0],
  tokenOut: supportedTokens[arbitrum.id][1],
  chainId: arbitrum.id,
  swapKind: SwapKind.GivenIn,
};

export const useSwapForm = () => useReducer(swapReducer, defaultState);
