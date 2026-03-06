import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { useQuery, useMutation } from '@apollo/client';
import GoLiveScreen from '../GoLiveScreen';

const mockRefetch = jest.fn();
const mockStartLive = jest.fn().mockResolvedValue({
  data: { startLiveSession: { id: 'new-s' } },
});
const mockEndLive = jest.fn().mockResolvedValue({ data: {} });
const mockJoinLive = jest.fn().mockResolvedValue({ data: {} });
const mockLeaveLive = jest.fn().mockResolvedValue({ data: {} });

function setupMocks(sessions: unknown[] = []): void {
  (useQuery as jest.Mock).mockReturnValue({
    data: { activeLiveSessions: { items: sessions, total: sessions.length } },
    loading: false,
    refetch: mockRefetch,
  });
  (useMutation as jest.Mock)
    .mockReturnValueOnce([mockStartLive, { loading: false }])
    .mockReturnValueOnce([mockEndLive])
    .mockReturnValueOnce([mockJoinLive])
    .mockReturnValueOnce([mockLeaveLive]);
}

describe('GoLiveScreen — behavior', () => {
  const defaultProps = { onBack: jest.fn(), podId: '', podTitle: '' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('opens go live modal on FAB press', () => {
    setupMocks([]);
    const { getByText } = render(<GoLiveScreen {...defaultProps} />);
    fireEvent.press(getByText('videocam'));
    expect(getByText('Go Live')).toBeTruthy();
  });

  it('submits go live form', async () => {
    setupMocks([]);
    const { getByText, getByPlaceholderText } = render(
      <GoLiveScreen {...defaultProps} />,
    );
    fireEvent.press(getByText('videocam'));

    const podIdInput = getByPlaceholderText(/Pod ID/i);
    fireEvent.changeText(podIdInput, 'pod1');

    const titleInput = getByPlaceholderText(/Session Title/i);
    fireEvent.changeText(titleInput, 'My Live');

    fireEvent.press(getByText('Go Live'));
    await waitFor(() => {
      expect(mockStartLive).toHaveBeenCalled();
    });
  });

  it('joins a live session', async () => {
    const session = {
      id: 's1',
      title: 'Test',
      description: '',
      podId: 'p1',
      podTitle: 'Pod',
      host: { id: 'h1', name: 'Host', avatar: null },
      viewers: [],
      startedAt: new Date().toISOString(),
    };
    setupMocks([session]);
    const { getByText } = render(<GoLiveScreen {...defaultProps} />);
    fireEvent.press(getByText('Join Live'));
    await waitFor(() => {
      expect(mockJoinLive).toHaveBeenCalledWith({
        variables: { sessionId: 's1' },
      });
    });
  });

  it('pre-opens modal when podId prop is provided', () => {
    setupMocks([]);
    const { getAllByText } = render(
      <GoLiveScreen
        {...defaultProps}
        podId="pod1"
        podTitle="My Pod"
      />,
    );
    expect(getAllByText('Go Live').length).toBeGreaterThanOrEqual(1);
  });
});
