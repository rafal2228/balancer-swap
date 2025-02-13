import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import { disconnectWithDefaultUser } from './lib/test-utils';

afterEach(() => {
  cleanup();
});

beforeEach(async () => {
  await disconnectWithDefaultUser();
});
