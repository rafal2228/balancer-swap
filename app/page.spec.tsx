import {
  connectWithDefaultUser,
  defaultAccount,
  render,
  screen,
  waitFor,
} from '@/lib/test-utils';
import { describe, expect, it } from 'vitest';
import HomePage from './page';

describe('HomePage', () => {
  it('renders logo and connect button', () => {
    const { getByText, container } = render(<HomePage />);

    expect(getByText('Connect Wallet')).toBeVisible();
    expect(
      container.querySelector('svg[aria-label="Balancer Simple Swap"]'),
    ).toBeVisible();
  });

  it('should allow user to select wallet', async () => {
    const { getByText, getByRole } = render(<HomePage />);

    getByText('Connect Wallet').click();
    await waitFor(() => {
      expect(getByRole('dialog')).toBeVisible();
    });
  });

  it('should show user address after connection', async () => {
    render(<HomePage />);
    await connectWithDefaultUser();

    expect(screen.queryByText('Connect Wallet')).toBeNull();
    expect(
      screen.getByText(
        `${defaultAccount.substring(0, 4)}…${defaultAccount.substring(defaultAccount.length - 4)}`,
      ),
    ).toBeVisible();
  });
});
