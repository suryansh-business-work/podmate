import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import TicketForm from '../TicketForm';

describe('TicketForm', () => {
  const onSubmit = jest.fn();

  beforeEach(() => jest.clearAllMocks());

  it('renders form title', () => {
    const { getByText } = render(<TicketForm creating={false} onSubmit={onSubmit} />);
    expect(getByText('New Support Ticket')).toBeTruthy();
  });

  it('renders Subject and Message labels', () => {
    const { getByText } = render(<TicketForm creating={false} onSubmit={onSubmit} />);
    expect(getByText('Subject')).toBeTruthy();
    expect(getByText('Message')).toBeTruthy();
  });

  it('renders placeholder texts', () => {
    const { getByPlaceholderText } = render(
      <TicketForm creating={false} onSubmit={onSubmit} />,
    );
    expect(getByPlaceholderText('Brief description of your issue')).toBeTruthy();
    expect(getByPlaceholderText('Describe your issue in detail...')).toBeTruthy();
  });

  it('submit button is disabled when form is empty', () => {
    const { getByText } = render(<TicketForm creating={false} onSubmit={onSubmit} />);
    const btn = getByText('Submit Ticket');
    // The parent TouchableOpacity should be disabled
    fireEvent.press(btn);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows validation error for short subject', async () => {
    const { getByPlaceholderText, findByText } = render(
      <TicketForm creating={false} onSubmit={onSubmit} />,
    );
    const subjectInput = getByPlaceholderText('Brief description of your issue');
    fireEvent.changeText(subjectInput, 'ab');
    fireEvent(subjectInput, 'onBlur', { persist: jest.fn(), target: { name: 'subject' } });
    expect(await findByText('Min 3 characters')).toBeTruthy();
  });

  it('shows validation error for short message', async () => {
    const { getByPlaceholderText, findByText } = render(
      <TicketForm creating={false} onSubmit={onSubmit} />,
    );
    const msgInput = getByPlaceholderText('Describe your issue in detail...');
    fireEvent.changeText(msgInput, 'short');
    fireEvent(msgInput, 'onBlur', { persist: jest.fn(), target: { name: 'message' } });
    expect(await findByText('Min 10 characters')).toBeTruthy();
  });

  it('shows required errors when fields are touched and empty', async () => {
    const { getByPlaceholderText, findByText } = render(
      <TicketForm creating={false} onSubmit={onSubmit} />,
    );
    const subjectInput = getByPlaceholderText('Brief description of your issue');
    fireEvent.changeText(subjectInput, '');
    fireEvent(subjectInput, 'onBlur', { persist: jest.fn(), target: { name: 'subject' } });
    expect(await findByText('Subject is required')).toBeTruthy();
  });

  it('shows ActivityIndicator when creating is true', () => {
    const { queryByText } = render(<TicketForm creating={true} onSubmit={onSubmit} />);
    // "Submit Ticket" text should not be visible when creating spinner is shown
    expect(queryByText('Submit Ticket')).toBeNull();
  });

  it('enables submit when form is valid and calls onSubmit', async () => {
    const { getByPlaceholderText, getByText } = render(
      <TicketForm creating={false} onSubmit={onSubmit} />,
    );

    fireEvent.changeText(
      getByPlaceholderText('Brief description of your issue'),
      'Login issue',
    );
    fireEvent.changeText(
      getByPlaceholderText('Describe your issue in detail...'),
      'I cannot login to my account since yesterday',
    );

    await waitFor(() => {
      fireEvent.press(getByText('Submit Ticket'));
    });

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        { subject: 'Login issue', message: 'I cannot login to my account since yesterday' },
        expect.anything(),
      );
    });
  });
});
