import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { EmptyState } from '../EmptyState';

jest.mock('../../../theme', () => ({
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32, xxxxl: 48 },
  borderRadius: { sm: 8, md: 12, lg: 16, full: 999 },
}));

describe('EmptyState', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders the title text', () => {
    const { getByText } = render(<EmptyState title="No items" />);
    expect(getByText('No items')).toBeTruthy();
  });

  it('renders subtitle when provided', () => {
    const { getByText } = render(
      <EmptyState title="No items" subtitle="Try adding some" />,
    );
    expect(getByText('Try adding some')).toBeTruthy();
  });

  it('does not render subtitle when not provided', () => {
    const { queryByText } = render(<EmptyState title="No items" />);
    expect(queryByText('Try adding some')).toBeNull();
  });

  it('renders action button when actionLabel and onAction are provided', () => {
    const onAction = jest.fn();
    const { getByText } = render(
      <EmptyState title="Empty" actionLabel="Add Item" onAction={onAction} />,
    );
    expect(getByText('Add Item')).toBeTruthy();
  });

  it('calls onAction when action button is pressed', () => {
    const onAction = jest.fn();
    const { getByText } = render(
      <EmptyState title="Empty" actionLabel="Add" onAction={onAction} />,
    );
    fireEvent.press(getByText('Add'));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('does not render action button without onAction', () => {
    const { queryByText } = render(<EmptyState title="Empty" actionLabel="Add" />);
    expect(queryByText('Add')).toBeNull();
  });

  it('has correct accessibility label combining title and subtitle', () => {
    const { getByLabelText } = render(
      <EmptyState title="No data" subtitle="Check back later" />,
    );
    expect(getByLabelText('No data. Check back later')).toBeTruthy();
  });

  it('renders with testID', () => {
    const { getByTestId } = render(<EmptyState title="Empty" testID="empty-state" />);
    expect(getByTestId('empty-state')).toBeTruthy();
  });

  it('uses default icon "inbox"', () => {
    const { getByText } = render(<EmptyState title="Empty" />);
    expect(getByText('inbox')).toBeTruthy();
  });

  it('uses custom icon when specified', () => {
    const { getByText } = render(<EmptyState title="Empty" icon="search" />);
    expect(getByText('search')).toBeTruthy();
  });
});
