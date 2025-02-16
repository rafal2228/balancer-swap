import { vi } from 'vitest';
import {
  mockUsePrepareTransactionRequestReturn,
  mockUseQueryReturn,
  mockUseSendTransactionReturn,
  mockUseTransactionReceiptReturn,
  mockUseWriteContractReturn,
  mockReadContractReturn,
} from '../test-utils';
import type { useSwap } from './useSwap';

export type UseSwapReturn = ReturnType<typeof useSwap>;

export const mockUseSwapReturn = (
  partial?: Partial<UseSwapReturn>,
): UseSwapReturn => ({
  allowance: mockReadContractReturn(),
  balance: mockReadContractReturn(),
  approval: mockUseWriteContractReturn(),
  handleApprove: vi.fn(),
  handleSwap: vi.fn(),
  swap: mockUseQueryReturn(),
  prepareTransaction: mockUsePrepareTransactionRequestReturn(),
  prepareTransactionEnabled: false,
  receipt: mockUseTransactionReceiptReturn(),
  requiresApproval: false,
  sendTransaction: mockUseSendTransactionReturn(),
  swapCall: mockUseQueryReturn(),
  swapEnabled: false,
  tokenInAmount: undefined,
  ...partial,
});
