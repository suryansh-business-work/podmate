import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { useQuery, useMutation } from '@apollo/client';
import FeedbackScreen from '../FeedbackScreen';

const mockFeedback = [
  {
    id: 'fb1',
    type: 'BUG',
    title: 'App crashes',
    description: 'Crashes on pod create',
    status: 'PENDING',
    adminNotes: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'fb2',
    type: 'FEATURE',
    title: 'Dark Mode',
    description: 'Please add dark mode',
    status: 'REVIEWED',
    adminNotes: 'We are working on it',
    createdAt: new Date().toISOString(),
  },
];

const mockRefetch = jest.fn();
const mockSubmitFeedback = jest.fn().mockResolvedValue({
  data: { submitFeedback: { id: 'fb3' } },
});

describe('FeedbackScreen', () => {
  const defaultProps = { onBack: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    (useQuery as jest.Mock).mockReturnValue({
      data: { myFeedback: { items: mockFeedback, total: mockFeedback.length } },
      loading: false,
      refetch: mockRefetch,
    });
    (useMutation as jest.Mock).mockReturnValue([mockSubmitFeedback, { loading: false }]);
  });

  it('renders header title', () => {
    const { getByText } = render(<FeedbackScreen {...defaultProps} />);
    expect(getByText('Feedback')).toBeTruthy();
  });

  it('calls onBack when back pressed', () => {
    const { getByText } = render(<FeedbackScreen {...defaultProps} />);
    fireEvent.press(getByText('arrow-back'));
    expect(defaultProps.onBack).toHaveBeenCalled();
  });

  it('shows empty state when no feedback', () => {
    (useQuery as jest.Mock).mockReset().mockReturnValue({
      data: { myFeedback: { items: [], total: 0 } },
      loading: false,
      refetch: mockRefetch,
    });
    (useMutation as jest.Mock)
      .mockReset()
      .mockReturnValue([mockSubmitFeedback, { loading: false }]);
    const { getByText } = render(<FeedbackScreen {...defaultProps} />);
    expect(getByText('No feedback yet')).toBeTruthy();
  });

  it('renders feedback cards', () => {
    const { getByText } = render(<FeedbackScreen {...defaultProps} />);
    expect(getByText('App crashes')).toBeTruthy();
    expect(getByText('Dark Mode')).toBeTruthy();
  });

  it('shows admin notes when present', () => {
    const { getByText } = render(<FeedbackScreen {...defaultProps} />);
    expect(getByText('We are working on it')).toBeTruthy();
  });

  it('renders status badges', () => {
    const { getByText } = render(<FeedbackScreen {...defaultProps} />);
    expect(getByText('PENDING')).toBeTruthy();
    expect(getByText('REVIEWED')).toBeTruthy();
  });

  it('opens submit modal on FAB press', () => {
    const { getByText } = render(<FeedbackScreen {...defaultProps} />);
    fireEvent.press(getByText('add'));
    expect(getByText('Submit Feedback')).toBeTruthy();
  });

  it('renders type chips in modal', () => {
    const { getByText, getAllByText } = render(<FeedbackScreen {...defaultProps} />);
    fireEvent.press(getByText('add'));
    expect(getAllByText('BUG').length).toBeGreaterThanOrEqual(1);
    expect(getAllByText('FEATURE').length).toBeGreaterThanOrEqual(1);
    expect(getAllByText('GENERAL').length).toBeGreaterThanOrEqual(1);
  });
});
