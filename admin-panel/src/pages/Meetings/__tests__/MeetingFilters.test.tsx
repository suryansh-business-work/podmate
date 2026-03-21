import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../../test/test-utils';
import MeetingFilters from '../MeetingFilters';

describe('MeetingFilters', () => {
  const defaultProps = {
    searchInput: '',
    statusFilter: '',
    onSearchChange: vi.fn(),
    onStatusChange: vi.fn(),
  };

  it('renders search field with placeholder', () => {
    renderWithProviders(<MeetingFilters {...defaultProps} />);
    expect(screen.getByPlaceholderText('Search by email or date…')).toBeInTheDocument();
  });

  it('renders status filter dropdown', () => {
    renderWithProviders(<MeetingFilters {...defaultProps} />);
    expect(screen.getByLabelText('Status')).toBeInTheDocument();
  });

  it('calls onSearchChange when typing in search field', () => {
    renderWithProviders(<MeetingFilters {...defaultProps} />);
    const searchInput = screen.getByPlaceholderText('Search by email or date…');
    fireEvent.change(searchInput, { target: { value: 'test@example.com' } });
    expect(defaultProps.onSearchChange).toHaveBeenCalledWith('test@example.com');
  });

  it('displays current search value', () => {
    renderWithProviders(<MeetingFilters {...defaultProps} searchInput="hello" />);
    const input = screen.getByPlaceholderText('Search by email or date…') as HTMLInputElement;
    expect(input.value).toBe('hello');
  });

  it('calls onStatusChange when selecting status', () => {
    renderWithProviders(<MeetingFilters {...defaultProps} />);
    const statusSelect = screen.getByLabelText('Status');
    fireEvent.mouseDown(statusSelect);
    const pendingOption = screen.getByText('Pending');
    fireEvent.click(pendingOption);
    expect(defaultProps.onStatusChange).toHaveBeenCalledWith('PENDING');
  });
});
