import { Slippage, Swap, SwapKind } from '@balancer/sdk';
import { graphql, GraphQLVariables, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { parseUnits } from 'viem';
import { arbitrum } from 'viem/chains';
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { defaultAccount } from '../test-utils';
import { supportedRPCs, supportedTokens } from '../tokens';
import { prepareSwap, prepareSwapCall } from './prepare';
import { sorSwapPathsGivenIn, sorSwapPathsGivenOut } from './prepare.mock';
import { parseSlippage } from './slippage';

const server = setupServer();

beforeAll(() => {
  server.listen({
    onUnhandledRequest: 'error',
  });
});

afterAll(() => server.close());

afterEach(() => server.resetHandlers());

describe('prepareSwap', () => {
  it('should prepare given in swap', async () => {
    let vars: GraphQLVariables | undefined;

    server.use(
      graphql.query('MyQuery', ({ variables }) => {
        vars = variables;

        return HttpResponse.json(sorSwapPathsGivenIn);
      }),
    );

    const swap = await prepareSwap({
      swapKind: SwapKind.GivenIn,
      chainId: arbitrum.id,
      tokenIn: supportedTokens[arbitrum.id][0],
      tokenOut: supportedTokens[arbitrum.id][1],
      amount: parseUnits('10', supportedTokens[arbitrum.id][0].decimals),
    });

    if (!vars) {
      throw new Error('No variables');
    }

    expect(swap.inputAmount.amount).toBe(parseUnits('10', 6));
    expect(vars.swapType).toBe('EXACT_IN');
  });

  it('should prepare given out swap', async () => {
    let vars: GraphQLVariables | undefined;

    server.use(
      graphql.query('MyQuery', ({ variables }) => {
        vars = variables;

        return HttpResponse.json(sorSwapPathsGivenOut);
      }),
    );

    const swap = await prepareSwap({
      swapKind: SwapKind.GivenOut,
      chainId: arbitrum.id,
      tokenIn: supportedTokens[arbitrum.id][1],
      tokenOut: supportedTokens[arbitrum.id][0],
      amount: parseUnits('10', supportedTokens[arbitrum.id][0].decimals),
    });

    if (!vars) {
      throw new Error('No variables');
    }

    expect(swap.outputAmount.amount).toBe(parseUnits('10', 6));
    expect(vars.swapType).toBe('EXACT_OUT');
  });

  it('should correctly encode high precision values', async () => {
    let vars: GraphQLVariables | undefined;

    server.use(
      graphql.query('MyQuery', ({ variables }) => {
        vars = variables;

        return HttpResponse.json(sorSwapPathsGivenIn);
      }),
    );

    await prepareSwap({
      swapKind: SwapKind.GivenIn,
      chainId: arbitrum.id,
      tokenIn: supportedTokens[arbitrum.id][1],
      tokenOut: supportedTokens[arbitrum.id][0],
      amount: parseUnits(
        '0.000000000567',
        supportedTokens[arbitrum.id][1].decimals,
      ),
    });

    if (!vars) {
      throw new Error('No variables');
    }

    expect(vars.swapAmount).toBe('0.000000000567');
  });
});

describe('prepareSwapCall', () => {
  it('should provide correct call data', async () => {
    const swap = {
      query: vi.fn().mockResolvedValue({}),
      buildCall: vi.fn().mockResolvedValue({}),
      protocolVersion: 3,
    } as unknown as Swap;
    const slippage = parseSlippage('0.5');

    await prepareSwapCall({
      userAddress: defaultAccount,
      slippage,
      chainId: arbitrum.id,
      swap,
    });

    expect(swap.query).toHaveBeenCalledWith(supportedRPCs[arbitrum.id]);
    expect(swap.buildCall).toHaveBeenCalledWith(
      expect.objectContaining({
        slippage: Slippage.fromRawAmount(slippage),
      }),
    );
  });

  it('should pass userAddress to protocol version 2 call', async () => {
    const swap = {
      query: vi.fn(),
      buildCall: vi.fn(),
      protocolVersion: 2,
    } as unknown as Swap;
    const slippage = parseSlippage('0.5');

    await prepareSwapCall({
      userAddress: defaultAccount,
      slippage,
      chainId: arbitrum.id,
      swap,
    });

    expect(swap.query).toHaveBeenCalledWith(supportedRPCs[arbitrum.id]);
    expect(swap.buildCall).toHaveBeenCalledWith(
      expect.objectContaining({
        slippage: Slippage.fromRawAmount(slippage),
        sender: defaultAccount,
        recipient: defaultAccount,
      }),
    );
  });
});
