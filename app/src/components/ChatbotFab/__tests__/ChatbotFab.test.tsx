import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ChatbotFab from '../ChatbotFab';

describe('ChatbotFab', () => {
  const defaultProps = { onPress: jest.fn() };

  beforeEach(() => jest.clearAllMocks());

  it('renders the "Ask PartyWings" label', () => {
    const { getByText } = render(<ChatbotFab {...defaultProps} />);
    expect(getByText('Ask PartyWings')).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByLabelText } = render(<ChatbotFab onPress={onPress} />);
    fireEvent.press(getByLabelText('Open AI chatbot'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('has accessible role "button"', () => {
    const { getByRole } = render(<ChatbotFab {...defaultProps} />);
    expect(getByRole('button')).toBeTruthy();
  });

  it('has accessibility hint describing the action', () => {
    const { getByLabelText } = render(<ChatbotFab {...defaultProps} />);
    const btn = getByLabelText('Open AI chatbot');
    expect(btn.props.accessibilityHint).toBe('Opens the PartyWings assistant');
  });

  it('renders the smart-toy icon via MaterialIcons mock', () => {
    const { getByText } = render(<ChatbotFab {...defaultProps} />);
    expect(getByText('smart-toy')).toBeTruthy();
  });

  it('does not crash with rapid press/release cycles', () => {
    const { getByLabelText } = render(<ChatbotFab {...defaultProps} />);
    const btn = getByLabelText('Open AI chatbot');
    fireEvent(btn, 'pressIn');
    fireEvent(btn, 'pressOut');
    fireEvent(btn, 'pressIn');
    fireEvent(btn, 'pressOut');
    expect(btn).toBeTruthy();
  });
});
