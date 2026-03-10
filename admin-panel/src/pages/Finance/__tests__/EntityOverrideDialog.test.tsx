import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../../test/test-utils';
import EntityOverrideDialog from '../EntityOverrideDialog';

describe('EntityOverrideDialog', () => {
  const defaultProps = {
    open: true,
    editing: null,
    saving: false,
    onClose: vi.fn(),
    onSave: vi.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dialog title for create mode', () => {
    renderWithProviders(<EntityOverrideDialog {...defaultProps} />);
    expect(screen.getByText('Add Entity Fee Override')).toBeInTheDocument();
  });

  it('renders dialog title for edit mode', () => {
    renderWithProviders(
      <EntityOverrideDialog
        {...defaultProps}
        editing={{
          id: 'eo-1',
          entityType: 'USER',
          entityId: 'user-123',
          feePercent: 7,
          enabled: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-15T00:00:00Z',
        }}
      />,
    );
    expect(screen.getByText('Edit Entity Fee Override')).toBeInTheDocument();
  });

  it('renders entity type select', () => {
    renderWithProviders(<EntityOverrideDialog {...defaultProps} />);
    // MUI Select renders the label in both InputLabel and internal span
    const matches = screen.getAllByText('Entity Type');
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it('renders entity ID field', () => {
    renderWithProviders(<EntityOverrideDialog {...defaultProps} />);
    // Default entityType is USER, so label is "User ID"
    expect(screen.getByLabelText(/user id/i)).toBeInTheDocument();
  });

  it('renders fee slider', () => {
    renderWithProviders(<EntityOverrideDialog {...defaultProps} />);
    expect(screen.getByRole('slider')).toBeInTheDocument();
  });

  it('renders enabled switch', () => {
    renderWithProviders(<EntityOverrideDialog {...defaultProps} />);
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('renders cancel and save buttons', () => {
    renderWithProviders(<EntityOverrideDialog {...defaultProps} />);
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
  });

  it('calls onClose when cancel clicked', () => {
    renderWithProviders(<EntityOverrideDialog {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('does not render when open is false', () => {
    renderWithProviders(<EntityOverrideDialog {...defaultProps} open={false} />);
    expect(screen.queryByText('Add Entity Fee Override')).not.toBeInTheDocument();
  });

  it('pre-fills fields in edit mode', () => {
    renderWithProviders(
      <EntityOverrideDialog
        {...defaultProps}
        editing={{
          id: 'eo-1',
          entityType: 'USER',
          entityId: 'user-123',
          feePercent: 7,
          enabled: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-15T00:00:00Z',
        }}
      />,
    );
    expect(screen.getByDisplayValue('user-123')).toBeInTheDocument();
  });

  it('disables save button when saving', () => {
    renderWithProviders(<EntityOverrideDialog {...defaultProps} saving={true} />);
    expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled();
  });

  it('displays info alert about override behavior', () => {
    renderWithProviders(<EntityOverrideDialog {...defaultProps} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('shows override fee label', () => {
    renderWithProviders(<EntityOverrideDialog {...defaultProps} />);
    expect(screen.getByText(/override fee/i)).toBeInTheDocument();
  });

  it('renders override enabled label', () => {
    renderWithProviders(<EntityOverrideDialog {...defaultProps} />);
    expect(screen.getByText(/override enabled/i)).toBeInTheDocument();
  });
});
