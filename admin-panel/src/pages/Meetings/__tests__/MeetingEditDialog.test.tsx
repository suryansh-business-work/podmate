import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../../test/test-utils';
import MeetingEditDialog from '../MeetingEditDialog';
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

describe('MeetingEditDialog', () => {
  it('renders nothing when meeting is null', () => {
    const { container } = renderWithProviders(
      <MeetingEditDialog meeting={null} saving={false} onClose={vi.fn()} onSave={vi.fn()} />,
    );
    expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument();
  });

  it('renders dialog with meeting details', () => {
    renderWithProviders(
      <MeetingEditDialog
        meeting={baseMeeting}
        saving={false}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />,
    );
    expect(screen.getByText('Update Meeting')).toBeInTheDocument();
    expect(screen.getByText(/John Doe/)).toBeInTheDocument();
    expect(screen.getByText(/john@example.com/)).toBeInTheDocument();
  });

  it('renders status select with current value', () => {
    renderWithProviders(
      <MeetingEditDialog
        meeting={baseMeeting}
        saving={false}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />,
    );
    expect(screen.getByLabelText('Status')).toBeInTheDocument();
  });

  it('renders admin note field', () => {
    renderWithProviders(
      <MeetingEditDialog
        meeting={baseMeeting}
        saving={false}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />,
    );
    expect(screen.getByLabelText('Admin Note')).toBeInTheDocument();
  });

  it('renders meeting link field', () => {
    renderWithProviders(
      <MeetingEditDialog
        meeting={baseMeeting}
        saving={false}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />,
    );
    expect(
      screen.getByLabelText('Meeting Link (auto-generated via Google Meet)'),
    ).toBeInTheDocument();
  });

  it('shows cancel reason field when status is CANCELLED', () => {
    const cancelledMeeting = { ...baseMeeting, status: 'CANCELLED' };
    renderWithProviders(
      <MeetingEditDialog
        meeting={cancelledMeeting}
        saving={false}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />,
    );
    expect(screen.getByLabelText('Cancel Reason')).toBeInTheDocument();
  });

  it('hides cancel reason field for non-cancelled status', () => {
    renderWithProviders(
      <MeetingEditDialog
        meeting={baseMeeting}
        saving={false}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />,
    );
    expect(screen.queryByLabelText('Cancel Reason')).not.toBeInTheDocument();
  });

  it('disables Save button when saving is true', () => {
    renderWithProviders(
      <MeetingEditDialog
        meeting={baseMeeting}
        saving={true}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />,
    );
    expect(screen.getByText('Saving…')).toBeInTheDocument();
    expect(screen.getByText('Saving…').closest('button')).toBeDisabled();
  });

  it('calls onSave when Save is clicked', () => {
    const onSave = vi.fn();
    renderWithProviders(
      <MeetingEditDialog
        meeting={baseMeeting}
        saving={false}
        onClose={vi.fn()}
        onSave={onSave}
      />,
    );
    fireEvent.click(screen.getByText('Save'));
    expect(onSave).toHaveBeenCalled();
  });

  it('calls onClose when Cancel is clicked', () => {
    const onClose = vi.fn();
    renderWithProviders(
      <MeetingEditDialog
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
