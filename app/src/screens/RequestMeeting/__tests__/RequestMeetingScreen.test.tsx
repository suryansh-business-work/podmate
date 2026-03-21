import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { useQuery, useMutation } from '@apollo/client';
import RequestMeetingScreen from '../RequestMeetingScreen';

describe('RequestMeetingScreen', () => {
  const defaultProps = {
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useQuery as jest.Mock).mockReturnValue({
      data: {
        me: {
          email: 'user@test.com',
          isEmailVerified: true,
        },
      },
      loading: false,
    });
    (useMutation as jest.Mock).mockReturnValue([jest.fn().mockResolvedValue({}), { loading: false }]);
  });

  it('renders with GENERAL purpose header by default', () => {
    const { getByText } = render(<RequestMeetingScreen {...defaultProps} />);
    expect(getByText('Request Meeting')).toBeTruthy();
  });

  it('renders with POD_OWNER purpose header', () => {
    const { getByText } = render(
      <RequestMeetingScreen {...defaultProps} purpose="POD_OWNER" />,
    );
    expect(getByText('Become a Pod Owner')).toBeTruthy();
  });

  it('renders with VENUE_OWNER purpose header', () => {
    const { getByText } = render(
      <RequestMeetingScreen {...defaultProps} purpose="VENUE_OWNER" />,
    );
    expect(getByText('Register a Venue')).toBeTruthy();
  });

  it('shows step indicator with Email and Schedule steps', () => {
    const { getByText } = render(<RequestMeetingScreen {...defaultProps} />);
    expect(getByText('Email')).toBeTruthy();
    expect(getByText('Schedule')).toBeTruthy();
  });

  it('calls onClose when back is pressed on first step', () => {
    const onClose = jest.fn();
    const { getByText } = render(
      <RequestMeetingScreen onClose={onClose} />,
    );
    fireEvent.press(getByText('arrow-back'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders step numbers 1 and 2', () => {
    const { getByText } = render(<RequestMeetingScreen {...defaultProps} />);
    expect(getByText('1')).toBeTruthy();
    expect(getByText('2')).toBeTruthy();
  });
});
