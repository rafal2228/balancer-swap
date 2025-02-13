import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import HomePage from './page';

describe('HomePage', () => {
  it('renders initial text', () => {
    const { getByText } = render(<HomePage />);

    expect(getByText('SWAP PAGE')).toBeVisible();
  });
});
