import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../../test/test-utils';
import EntityOverridesSection from '../EntityOverridesSection';
import type { EntityFeeOverride } from '../Finance.types';

const mockOverrides: EntityFeeOverride[] = [
  {
    id: 'eo-1',
    entityType: 'USER',
    entityId: 'user-abc-123-def-456',
    feePercent: 7,
    enabled: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 'eo-2',
    entityType: 'POD',
    entityId: 'pod-xyz-789-ghi-012',
    feePercent: 3,
    enabled: false,
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-16T00:00:00Z',
  },
];

describe('EntityOverridesSection', () => {
  const defaultProps = {
    overrides: mockOverrides,
    loading: false,
    saving: false,
    onSave: vi.fn(),
    onDelete: vi.fn(),
    onTabChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the section title', () => {
    renderWithProviders(<EntityOverridesSection {...defaultProps} />);
    expect(screen.getByText('Entity Fee Overrides')).toBeInTheDocument();
  });

  it('renders tab labels', () => {
    renderWithProviders(<EntityOverridesSection {...defaultProps} />);
    expect(screen.getByRole('tab', { name: 'All' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Users' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Pods' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Venues' })).toBeInTheDocument();
  });

  it('renders override rows when data exists', () => {
    renderWithProviders(<EntityOverridesSection {...defaultProps} />);
    expect(screen.getByText('User')).toBeInTheDocument();
    expect(screen.getByText('Pod')).toBeInTheDocument();
  });

  it('shows fee percentages', () => {
    renderWithProviders(<EntityOverridesSection {...defaultProps} />);
    expect(screen.getByText('7%')).toBeInTheDocument();
    expect(screen.getByText('3%')).toBeInTheDocument();
  });

  it('shows active/disabled status chips', () => {
    renderWithProviders(<EntityOverridesSection {...defaultProps} />);
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Disabled')).toBeInTheDocument();
  });

  it('shows truncated entity IDs', () => {
    renderWithProviders(<EntityOverridesSection {...defaultProps} />);
    expect(screen.getByText('user-abc…')).toBeInTheDocument();
    expect(screen.getByText('pod-xyz-…')).toBeInTheDocument();
  });

  it('renders empty state when no overrides', () => {
    renderWithProviders(<EntityOverridesSection {...defaultProps} overrides={[]} />);
    expect(screen.getByText('No entity overrides configured')).toBeInTheDocument();
  });

  it('shows loading skeleton when loading', () => {
    renderWithProviders(<EntityOverridesSection {...defaultProps} loading={true} />);
    expect(screen.queryByText('Entity Fee Overrides')).not.toBeInTheDocument();
  });

  it('renders Add Override button', () => {
    renderWithProviders(<EntityOverridesSection {...defaultProps} />);
    expect(screen.getByRole('button', { name: /add override/i })).toBeInTheDocument();
  });

  it('opens dialog when Add Override clicked', async () => {
    renderWithProviders(<EntityOverridesSection {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /add override/i }));
    await waitFor(() => {
      expect(screen.getByText('Add Entity Fee Override')).toBeInTheDocument();
    });
  });

  it('calls onTabChange when tab clicked', () => {
    renderWithProviders(<EntityOverridesSection {...defaultProps} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Users' }));
    expect(defaultProps.onTabChange).toHaveBeenCalledWith('USER');
  });

  it('calls onTabChange with undefined for All tab', () => {
    renderWithProviders(<EntityOverridesSection {...defaultProps} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Users' }));
    fireEvent.click(screen.getByRole('tab', { name: 'All' }));
    expect(defaultProps.onTabChange).toHaveBeenCalledWith(undefined);
  });

  it('calls onDelete when delete button clicked', () => {
    renderWithProviders(<EntityOverridesSection {...defaultProps} />);
    const deleteButtons = screen.getAllByTestId('DeleteIcon');
    fireEvent.click(deleteButtons[0].closest('button')!);
    expect(defaultProps.onDelete).toHaveBeenCalledWith('USER', 'user-abc-123-def-456');
  });

  it('renders table header cells', () => {
    renderWithProviders(<EntityOverridesSection {...defaultProps} />);
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Entity ID')).toBeInTheDocument();
    expect(screen.getByText('Fee %')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Updated')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });
});
