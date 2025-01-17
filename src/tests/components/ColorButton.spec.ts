import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import ColorButton from '$lib/components/ColorButton.svelte';

describe('ColorButton', () => {
  it('should render with the correct background color and index text', () => {
    const { container } = render(ColorButton, {
      props: {
        color: '#ffffff',
        index: 1,
        isSelected: false,
        select: vi.fn()
      }
    });

    const btn = container.querySelector('button');
    expect(btn?.getAttribute('style')).to.contain('background-color: rgb(255, 255, 255);');
    // index=1
    expect(screen.getByText('1')).toBeTruthy();
  });

  it('should highlight with ring if isSelected = true', () => {
    const { container } = render(ColorButton, {
      props: {
        color: '#4980b9',
        index: 2,
        isSelected: true,
        select: vi.fn()
      }
    });
    const btn = container.querySelector('button');
    // ring-2 ring-offset-2 ring-primary
    expect(btn?.className).toContain('ring-2');
  });

  it('should call select handler when clicked', async () => {
    const mockSelect = vi.fn();
    render(ColorButton, {
      props: {
        color: '#f5db82',
        index: 3,
        isSelected: false,
        select: mockSelect
      }
    });

    const user = userEvent.setup();
    const btn = screen.getByRole('button');

    await user.click(btn);
    expect(mockSelect).toHaveBeenCalled();
  });
});
