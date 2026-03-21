import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../../test/test-utils';
import MeetingViewDialog from '../MeetingViewDialog';
import type { Meeting } from '../Meetings.types';

const baseMeeting: Meeting = {
  id: 'meeting-1',
  userId: 'user-1',
  user: { id: 'user-1', name: 'John Doe', phone: '1234567890' },
  userEmail: 'john@example.com',
  meetingDate: '2027-06-15',
  meetingTime: '14:00',
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

describe('MeetingViewDialog', () => {
  it('renders nothing when meeting is null', () => {
    const { container } = renderWithProviders(
      <MeetingViewDialog meeting={null} onClose={vi.fn()} onEdit={vi.fn()} />,
    );
    expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument();
  });

  it('renders dialog with meeting details', () => {
    renderWithProviders(
      <MeetingViewDialog meeting={baseMeeting} onClose={vi.fn()} onEdit={vi.fn()} />,
    );
    expect(screen.getByText('Meeting Details')).toBeInTheDocument();
    expect(screen.getByText(/John Doe/)).toBeInTheDocument();
    expect(screen.getByText(/john@example.com/)).toBeInTheDocument();
    expect(screen.getByText('PENDING')).toBeInTheDocument();
    expect(screen.getByText('General')).toBeInTheDocument();
  });

  it('shows formatted time', () => {
    renderWithProviders(
      <MeetingViewDialog meeting={baseMeeting} onClose={vi.fn()} onEdit={vi.fn()} />,
    );
    expect(screen.getByText(/2:00 PM/)).toBeInTheDocument();
  });

  it('shows meeting link when present', () => {
    const meetingWithLink = { ...baseMeeting, meetingLink: 'https://meet.google.com/abc' };
    renderWithProviders(
      <MeetingViewDialog meeting={meetingWithLink} onClose={vi.fn()} onEdit={vi.fn()} />,
    );
    expect(screen.getByText('Meeting Link (Google Meet)')).toBeInTheDocument();
    expect(screen.getByText('https://meet.google.com/abc')).toBeInTheDocument();
  });

  it('hides meeting link section when empty', () => {
    renderWithProviders(
      <MeetingViewDialog meeting={baseMeeting} onClose={vi.fn()} onEdit={vi.fn()} />,
    );
    expect(screen.queryByText('Meeting Link (Google Meet)')).not.toBeInTheDocument();
  });

  it('shows rescheduled info when present', () => {
    const rescheduledMeeting = {
      ...baseMeeting,
      rescheduledFrom: '2027-06-10 at 09:00',
      rescheduledBy: 'ADMIN',
    };
    renderWithProviders(
      <MeetingViewDialog meeting={rescheduledMeeting} onClose={vi.fn()} onEdit={vi.fn()} />,
    );
    expect(screen.getByText('Rescheduled From')).toBeInTheDocument();
    expect(screen.getByText('2027-06-10 at 09:00')).toBeInTheDocument();
    expect(screen.getByText(/Rescheduled by: ADMIN/)).toBeInTheDocument();
  });

  it('shows admin note when present', () => {
    const meetingWithNote = { ...baseMeeting, adminNote: 'VIP client' };
    renderWithProviders(
      <MeetingViewDialog meeting={meetingWithNote} onClose={vi.fn()} onEdit={vi.fn()} />,
    );
    expect(screen.getByText('Admin Note')).toBeInTheDocument();
    expect(screen.getByText('VIP client')).toBeInTheDocument();
  });

  it('shows cancel reason when present', () => {
    const cancelled = { ...baseMeeting, cancelReason: 'User requested cancellation' };
    renderWithProviders(
      <MeetingViewDialog meeting={cancelled} onClose={vi.fn()} onEdit={vi.fn()} />,
    );
    expect(screen.getByText('Cancel Reason')).toBeInTheDocument();
    expect(screen.getByText('User requested cancellation')).toBeInTheDocument();
  });

  it('has Edit and Close buttons', () => {
    renderWithProviders(
      <MeetingViewDialog meeting={baseMeeting} onClose={vi.fn()} onEdit={vi.fn()} />,
    );
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Close')).toBeInTheDocument();
  });
});
