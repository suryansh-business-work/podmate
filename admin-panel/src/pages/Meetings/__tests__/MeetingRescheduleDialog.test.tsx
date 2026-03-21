import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../../test/test-utils';
import MeetingRescheduleDialog from '../MeetingRescheduleDialog';
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

describe('MeetingRescheduleDialog', () => {
  it('renders nothing when meeting is null', () => {
    const { container } = renderWithProviders(
      <MeetingRescheduleDialog
        meeting={null}
        saving={false}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />,
    );
    expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument();
  });

  it('renders dialog with title', () => {
    renderWithProviders(
      <MeetingRescheduleDialog
        meeting={baseMeeting}
        saving={false}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />,
    );
    expect(screen.getByText('Reschedule Meeting')).toBeInTheDocument();
  });

  it('shows current meeting details', () => {
    renderWithProviders(
      <MeetingRescheduleDialog
        meeting={baseMeeting}
        saving={false}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />,
    );
    expect(screen.getByText(/John Doe/)).toBeInTheDocument();
    expect(screen.getByText(/john@example.com/)).toBeInTheDocument();
    expect(screen.getByText(/Current:/)).toBeInTheDocument();
  });

  it('renders date and time inputs', () => {
    renderWithProviders(
      <MeetingRescheduleDialog
        meeting={baseMeeting}
        saving={false}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />,
    );
    expect(screen.getByLabelText('New Date')).toBeInTheDocument();
    expect(screen.getByLabelText('New Time')).toBeInTheDocument();
  });

  it('renders all time slot options', () => {
    renderWithProviders(
      <MeetingRescheduleDialog
        meeting={baseMeeting}
        saving={false}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />,
    );
    // Time slots are inside a select - open the dropdown
    fireEvent.mouseDown(screen.getByLabelText('New Time'));
    expect(screen.getByText('9:00 AM')).toBeInTheDocument();
    expect(screen.getByText('5:30 PM')).toBeInTheDocument();
  });

  it('disables Reschedule button when saving', () => {
    renderWithProviders(
      <MeetingRescheduleDialog
        meeting={baseMeeting}
        saving={true}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />,
    );
    expect(screen.getByText('Rescheduling…')).toBeInTheDocument();
    expect(screen.getByText('Rescheduling…').closest('button')).toBeDisabled();
  });

  it('calls onSave with date and time when Reschedule is clicked', () => {
    const onSave = vi.fn();
    renderWithProviders(
      <MeetingRescheduleDialog
        meeting={baseMeeting}
        saving={false}
        onClose={vi.fn()}
        onSave={onSave}
      />,
    );
    fireEvent.click(screen.getByText('Reschedule'));
    expect(onSave).toHaveBeenCalledWith('2027-06-15', '10:00');
  });

  it('calls onClose when Cancel is clicked', () => {
    const onClose = vi.fn();
    renderWithProviders(
      <MeetingRescheduleDialog
        meeting={baseMeeting}
        saving={false}
        onClose={onClose}
        onSave={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalled();
  });
});
