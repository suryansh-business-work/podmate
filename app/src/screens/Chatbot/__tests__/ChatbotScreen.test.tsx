import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { useQuery, useMutation } from '@apollo/client';
import ChatbotScreen from '../ChatbotScreen';

const mockMessages = [
  { id: '1', role: 'user', content: 'Hello', createdAt: new Date().toISOString() },
  { id: '2', role: 'assistant', content: 'Hi there!', createdAt: new Date().toISOString() },
];

const mockAskChatbot = jest.fn().mockResolvedValue({
  data: { askChatbot: { id: '3', role: 'assistant', content: 'Answer' } },
});
const mockClearHistory = jest.fn().mockResolvedValue({});

describe('ChatbotScreen', () => {
  const defaultProps = { onBack: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    (useQuery as jest.Mock).mockReturnValue({
      data: { chatbotHistory: mockMessages },
      loading: false,
    });
    let mutationCall = 0;
    (useMutation as jest.Mock).mockImplementation(() => {
      mutationCall++;
      if (mutationCall % 2 === 1) return [mockAskChatbot, { loading: false }];
      return [mockClearHistory, { loading: false }];
    });
  });

  it('renders header title', () => {
    const { getByText } = render(<ChatbotScreen {...defaultProps} />);
    expect(getByText('PartyWings AI')).toBeTruthy();
  });

  it('calls onBack when back pressed', () => {
    const { getByText } = render(<ChatbotScreen {...defaultProps} />);
    fireEvent.press(getByText('arrow-back'));
    expect(defaultProps.onBack).toHaveBeenCalled();
  });

  it('renders chat messages', () => {
    const { getByText } = render(<ChatbotScreen {...defaultProps} />);
    expect(getByText('Hello')).toBeTruthy();
    expect(getByText('Hi there!')).toBeTruthy();
  });

  it('shows empty state when no messages', () => {
    (useQuery as jest.Mock).mockReset().mockReturnValue({
      data: { chatbotHistory: [] },
      loading: false,
    });
    let mutationCall = 0;
    (useMutation as jest.Mock).mockReset().mockImplementation(() => {
      mutationCall++;
      if (mutationCall % 2 === 1) return [mockAskChatbot, { loading: false }];
      return [mockClearHistory, { loading: false }];
    });
    const { getByText } = render(<ChatbotScreen {...defaultProps} />);
    expect(getByText('Ask PartyWings AI')).toBeTruthy();
  });

  it('renders text input with placeholder', () => {
    const { getByPlaceholderText } = render(
      <ChatbotScreen {...defaultProps} />,
    );
    expect(getByPlaceholderText('Ask something...')).toBeTruthy();
  });

  it('allows typing a message', () => {
    const { getByPlaceholderText } = render(
      <ChatbotScreen {...defaultProps} />,
    );
    const input = getByPlaceholderText('Ask something...');
    fireEvent.changeText(input, 'Test question');
    expect(input.props.value).toBe('Test question');
  });

  it('sends message on send button press', async () => {
    const { getByPlaceholderText, getByText } = render(
      <ChatbotScreen {...defaultProps} />,
    );
    fireEvent.changeText(
      getByPlaceholderText('Ask something...'),
      'What is a pod?',
    );
    fireEvent.press(getByText('send'));
    await waitFor(() => {
      expect(mockAskChatbot).toHaveBeenCalled();
    });
  });

  it('renders clear button', () => {
    const { getByText } = render(<ChatbotScreen {...defaultProps} />);
    expect(getByText('delete-outline')).toBeTruthy();
  });
});
