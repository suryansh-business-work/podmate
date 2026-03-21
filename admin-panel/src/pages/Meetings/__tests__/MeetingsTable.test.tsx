import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../../test/test-utils';
import MeetingsTable from '../MeetingsTable';
import type { Meeting } from '../Meetings.types';

const baseMeeting: Meeting = {
  id: 'meeting-1',
  userId: 'user-1',
  user: { id: 'user-1', name: 'John Doe', phone: '1234567890' },
  userEmail: 'john@example.com',
  meetingDate: '2027-06-15',
  meetingTime: '10:00',
  meetingLink: '',
  googleEventId: '',
  status: 'PENDING',
  purpose: 'GENERAL',
  adminNote: '',
  cancelReason: '',
  rescheduledFrom: '',
  rescheduledBy: '',
  completedAt: '',
  createdAt: '2027-06-10T00:00:00.000Z',
  updatedAt: '2027-06-10T00:00:00.000Z',
};

const defaultProps = {
  items: [baseMeeting],
  total: 1,
  page: 0,
  rowsPerPage: 10,
  sortBy: 'createdAt',
  order: 'DESC' as const,
  onPageChange: vi.fn(),
  onRowsPerPageChange: vi.fn(),
  onSort: vi.fn(),
  onView: vi.fn(),
  onEdit: vi.fn(),
  onReschedule: vi.fn(),
  onDelete: vi.fn(),
};

describe('MeetingsTable', () => {
  it('renders table with column headers', () => {
    renderWithProviders(<MeetingsTable {...defaultProps} />);
    expect(screen.getByText('User')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Time')).toBeInTheDocument();
    expect(screen.getByText('Purpose')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Requested')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('renders user name and email', () => {
    renderWithProviders(<MeetingsTable {...defaultProps} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('renders formatted time', () => {
    renderWithProviders(<MeetingsTable {...defaultProps} />);
    expect(screen.getByText('10:00 AM')).toBeInTheDocument();
  });

  it('renders status chip', () => {
    renderWithProviders(<MeetingsTable {...defaultProps} />);
    expect(screen.getByText('PENDING')).toBeInTheDocument();
  });

  it('renders purpose chip', () => {
    renderWithProviders(<MeetingsTable {...defaultProps} />);
    expect(screen.getByText('General')).toBeInTheDocument();
  });

  it('shows reschedule button for PENDING meetings', () => {
    renderWithProviders(<MeetingsTable {...defaultProps} />);
    // 4 action buttons: view, edit, reschedule, delete
    const buttons = screen.getAllByRole('button');
    // Filter for icon buttons in the row (exclude pagination buttons)
    const iconButtons = buttons.filter((b) => b.closest('td'));
    expect(iconButtons).toHaveLength(4);
  });

  it('hides reschedule button for COMPLETED meetings', () => {
    const completedMeeting = { ...baseMeeting, status: 'COMPLETED' };
    renderWithProviders(<MeetingsTable {...defaultProps} items={[completedMeeting]} />);
    const iconButtons = screen.getAllByRole('button').filter((b) => b.closest('td'));
    // Only view, edit, delete — no reschedule
    expect(iconButtons).toHaveLength(3);
  });

  it('displays "Unknown" when user is null', () => {
    const noUserMeeting = { ...baseMeeting, user: null };
    renderWithProviders(<MeetingsTable {...defaultProps} items={[noUserMeeting]} />);
    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });

  it('shows Pod Owner label for POD_OWNER purpose', () => {
    const podOwnerMeeting = { ...baseMeeting, purpose: 'POD_OWNER' as const };
    renderWithProviders(<MeetingsTable {...defaultProps} items={[podOwnerMeeting]} />);
    expect(screen.getByText('Pod Owner')).toBeInTheDocument();
  });
});
