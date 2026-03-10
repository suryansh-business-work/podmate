import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { useMutation } from '@apollo/client';
import ContactPicker from '../ContactPicker';

// Mock useDeviceContacts for permission denied scenario
jest.mock('../useDeviceContacts', () => ({
  useDeviceContacts: () => ({
    contacts: [],
    loading: false,
    permissionDenied: true,
    refresh: jest.fn(),
  }),
}));

describe('ContactPicker — permission denied', () => {
  const defaultProps = {
    podId: 'pod-123',
    podTitle: 'Test Pod',
    onDone: jest.fn(),
    onSkip: jest.fn(),
  };

  beforeEach(() => {
    (useMutation as jest.Mock).mockReturnValue([jest.fn(), { loading: false }]);
  });

  it('shows permission required message', () => {
    const { getByText } = render(<ContactPicker {...defaultProps} />);
    expect(getByText('Contacts Access Required')).toBeTruthy();
  });

  it('shows permission explanation text', () => {
    const { getByText } = render(<ContactPicker {...defaultProps} />);
    expect(getByText(/grant contacts permission/i)).toBeTruthy();
  });

  it('shows Try Again button', () => {
    const { getByText } = render(<ContactPicker {...defaultProps} />);
    expect(getByText('Try Again')).toBeTruthy();
  });

  it('shows Skip option', () => {
    const { getByText } = render(<ContactPicker {...defaultProps} />);
    expect(getByText('Skip')).toBeTruthy();
  });

  it('calls onSkip when Skip is pressed', () => {
    const onSkip = jest.fn();
    const { getByText } = render(<ContactPicker {...defaultProps} onSkip={onSkip} />);

    fireEvent.press(getByText('Skip'));
    expect(onSkip).toHaveBeenCalledTimes(1);
  });
});
