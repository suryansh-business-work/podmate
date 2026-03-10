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
  let mutCall = 0;
  (useMutation as jest.Mock).mockImplementation(() => {
    mutCall++;
    switch ((mutCall - 1) % 4) {
      case 0:
        return [mockStartLive, { loading: false }];
      case 1:
        return [mockEndLive, { loading: false }];
      case 2:
        return [mockJoinLive, { loading: false }];
      case 3:
        return [mockLeaveLive, { loading: false }];
      default:
        return [jest.fn(), { loading: false }];
    }
  });
}

describe('GoLiveScreen — behavior', () => {
  const defaultProps = { onBack: jest.fn(), podId: '', podTitle: '' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('opens go live modal on FAB press', () => {
    setupMocks([]);
    const { getAllByText } = render(<GoLiveScreen {...defaultProps} />);
    fireEvent.press(getAllByText('videocam')[0]);
    expect(getAllByText('Go Live').length).toBeGreaterThanOrEqual(1);
  });

  it('submits go live form', async () => {
    setupMocks([]);
    const { getAllByText, getByPlaceholderText } = render(<GoLiveScreen {...defaultProps} />);
    fireEvent.press(getAllByText('videocam')[0]);

    const podIdInput = getByPlaceholderText(/Pod ID/i);
    fireEvent.changeText(podIdInput, 'pod1');

    const titleInput = getByPlaceholderText(/Session Title/i);
    fireEvent.changeText(titleInput, 'My Live');

    // "Go Live" appears as modal title + submit button; pick the submit button (last)
    const goLiveElements = getAllByText('Go Live');
    fireEvent.press(goLiveElements[goLiveElements.length - 1]);
    await waitFor(() => {
      expect(mockStartLive).toHaveBeenCalled();
    });
  });

  it('joins a live session', async () => {
    const session = {
      id: 's1',
      title: 'Test',
      description: '',
      status: 'LIVE' as const,
      viewerCount: 0,
      isViewing: false,
      host: { id: 'h1', name: 'Host', avatar: null },
      pod: { id: 'p1', title: 'Pod' },
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
      <GoLiveScreen {...defaultProps} podId="pod1" podTitle="My Pod" />,
    );
    expect(getAllByText('Go Live').length).toBeGreaterThanOrEqual(1);
  });
});
