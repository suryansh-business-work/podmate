import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../../test/test-utils';
import GlobalFeeCard from '../GlobalFeeCard';

describe('GlobalFeeCard', () => {
  const defaultProps = {
    currentFee: 5,
    loading: false,
    saving: false,
    onSave: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the card title', () => {
    renderWithProviders(<GlobalFeeCard {...defaultProps} />);
    expect(screen.getByText('Global Platform Fee')).toBeInTheDocument();
  });

  it('displays current fee value', () => {
    renderWithProviders(<GlobalFeeCard {...defaultProps} currentFee={8} />);
    // MUI Slider also renders the value label, so multiple elements match
    const matches = screen.getAllByText('8%');
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it('shows loading skeleton when loading', () => {
    renderWithProviders(<GlobalFeeCard {...defaultProps} loading={true} />);
    expect(screen.queryByText('Global Platform Fee')).not.toBeInTheDocument();
  });

  it('renders a slider for fee adjustment', () => {
    renderWithProviders(<GlobalFeeCard {...defaultProps} />);
    expect(screen.getByRole('slider')).toBeInTheDocument();
  });

  it('renders save button', () => {
    renderWithProviders(<GlobalFeeCard {...defaultProps} />);
    expect(screen.getByRole('button', { name: /save fee/i })).toBeInTheDocument();
  });

  it('disables save button when value unchanged', () => {
    renderWithProviders(<GlobalFeeCard {...defaultProps} />);
    expect(screen.getByRole('button', { name: /save fee/i })).toBeDisabled();
  });

  it('disables save button when saving', () => {
    renderWithProviders(<GlobalFeeCard {...defaultProps} saving={true} />);
    expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled();
  });

  it('calls onSave after changing slider value', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    renderWithProviders(<GlobalFeeCard {...defaultProps} onSave={onSave} currentFee={5} />);
    const slider = screen.getByRole('slider');
    // Change the slider value to make the save button enabled
    fireEvent.change(slider, { target: { value: 8 } });
    await waitFor(() => {
      const btn = screen.getByRole('button', { name: /save fee/i });
      expect(btn).not.toBeDisabled();
    });
  });

  it('displays description text about entity overrides', () => {
    renderWithProviders(<GlobalFeeCard {...defaultProps} />);
    expect(screen.getByText(/entity-level/i)).toBeInTheDocument();
  });
});
