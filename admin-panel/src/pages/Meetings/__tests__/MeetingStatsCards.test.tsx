import React from 'react';
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../../test/test-utils';
import MeetingStatsCards from '../MeetingStatsCards';

describe('MeetingStatsCards', () => {
  const mockCounts = { pending: 5, confirmed: 3, completed: 10, cancelled: 2 };

  it('renders all four stat cards', () => {
    renderWithProviders(<MeetingStatsCards counts={mockCounts} />);
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Confirmed')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('Cancelled')).toBeInTheDocument();
  });

  it('displays correct count values', () => {
    renderWithProviders(<MeetingStatsCards counts={mockCounts} />);
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('renders zero counts', () => {
    renderWithProviders(
      <MeetingStatsCards counts={{ pending: 0, confirmed: 0, completed: 0, cancelled: 0 }} />,
    );
    const zeros = screen.getAllByText('0');
    expect(zeros).toHaveLength(4);
  });
});
