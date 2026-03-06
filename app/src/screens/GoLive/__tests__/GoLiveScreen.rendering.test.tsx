import React from 'react';
import { ActivityIndicator } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { useQuery, useMutation } from '@apollo/client';
import GoLiveScreen from '../GoLiveScreen';

const mockSessions = [
  {
    id: 's1',
    title: 'Gaming Night',
    description: 'Playing games together',
    podId: 'pod1',
    podTitle: 'Fun Pod',
    host: { id: 'h1', name: 'HostUser', avatar: null },
    viewers: [{ id: 'v1' }],
    startedAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

const mockRefetch = jest.fn();
const mockStartLive = jest.fn().mockResolvedValue({
  data: { startLiveSession: { id: 'new-s' } },
});
const mockEndLive = jest.fn().mockResolvedValue({ data: {} });
const mockJoinLive = jest.fn().mockResolvedValue({ data: {} });
const mockLeaveLive = jest.fn().mockResolvedValue({ data: {} });

describe('GoLiveScreen — rendering', () => {
  const defaultProps = {
    onBack: jest.fn(),
    podId: '',
    podTitle: '',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useQuery as jest.Mock).mockReturnValue({
      data: { activeLiveSessions: { items: mockSessions, total: mockSessions.length } },
      loading: false,
      refetch: mockRefetch,
    });
    (useMutation as jest.Mock)
      .mockReturnValueOnce([mockStartLive, { loading: false }])
      .mockReturnValueOnce([mockEndLive])
      .mockReturnValueOnce([mockJoinLive])
      .mockReturnValueOnce([mockLeaveLive]);
  });

  it('renders header title', () => {
    const { getByText } = render(<GoLiveScreen {...defaultProps} />);
    expect(getByText('Live Sessions')).toBeTruthy();
  });

  it('calls onBack when back pressed', () => {
    const { getByText } = render(<GoLiveScreen {...defaultProps} />);
    fireEvent.press(getByText('arrow-back'));
    expect(defaultProps.onBack).toHaveBeenCalled();
  });

  it('renders session cards', () => {
    const { getByText } = render(<GoLiveScreen {...defaultProps} />);
    expect(getByText('Gaming Night')).toBeTruthy();
  });

  it('shows LIVE badge', () => {
    const { getByText } = render(<GoLiveScreen {...defaultProps} />);
    expect(getByText('LIVE')).toBeTruthy();
  });

  it('shows empty state when no sessions', () => {
    (useQuery as jest.Mock).mockReturnValue({
      data: { activeLiveSessions: { items: [], total: 0 } },
      loading: false,
      refetch: mockRefetch,
    });
    (useMutation as jest.Mock).mockReset()
      .mockReturnValueOnce([mockStartLive, { loading: false }])
      .mockReturnValueOnce([mockEndLive])
      .mockReturnValueOnce([mockJoinLive])
      .mockReturnValueOnce([mockLeaveLive]);
    const { getByText } = render(<GoLiveScreen {...defaultProps} />);
    expect(getByText('No live sessions')).toBeTruthy();
  });

  it('shows loading indicator', () => {
    (useQuery as jest.Mock).mockReturnValue({
      data: null,
      loading: true,
      refetch: mockRefetch,
    });
    (useMutation as jest.Mock).mockReset()
      .mockReturnValueOnce([mockStartLive, { loading: false }])
      .mockReturnValueOnce([mockEndLive])
      .mockReturnValueOnce([mockJoinLive])
      .mockReturnValueOnce([mockLeaveLive]);
    const { UNSAFE_getByType } = render(<GoLiveScreen {...defaultProps} />);
    expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
  });

  it('renders Join Live button on sessions', () => {
    const { getByText } = render(<GoLiveScreen {...defaultProps} />);
    expect(getByText('Join Live')).toBeTruthy();
  });
});
