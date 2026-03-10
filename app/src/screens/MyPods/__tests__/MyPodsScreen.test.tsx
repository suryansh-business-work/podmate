import React from 'react';
import { ActivityIndicator } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { useQuery } from '@apollo/client';
import MyPodsScreen from '../MyPodsScreen';

jest.mock('../../../components/SafeImage', () => {
  const mockReact = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: (props: Record<string, unknown>) =>
      mockReact.createElement(View, { testID: 'safe-image', ...props }),
  };
});

const mockRefetch = jest.fn();
const mockPod = {
  id: '1',
  title: 'Test Pod',
  description: 'A fun social pod',
  category: 'Social',
  status: 'ACTIVE',
  date: new Date().toISOString(),
  imageUrl: 'https://example.com/img.jpg',
  location: 'Delhi',
  fee: 500,
  maxSeats: 10,
  attendees: [],
};

describe('MyPodsScreen', () => {
  const defaultProps = {
    onBack: jest.fn(),
    onPodPress: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useQuery as jest.Mock).mockReturnValue({
      data: { myPods: [mockPod] },
      loading: false,
      error: null,
      refetch: mockRefetch,
    });
  });

  it('renders header with title', () => {
    const { getByText } = render(<MyPodsScreen {...defaultProps} />);
    expect(getByText('My Pods')).toBeTruthy();
  });

  it('calls onBack when back button pressed', () => {
    const { getByText } = render(<MyPodsScreen {...defaultProps} />);
    fireEvent.press(getByText('arrow-back'));
    expect(defaultProps.onBack).toHaveBeenCalled();
  });

  it('shows loading indicator', () => {
    (useQuery as jest.Mock).mockReturnValue({
      data: null,
      loading: true,
      error: null,
      refetch: mockRefetch,
    });
    const { UNSAFE_getByType } = render(<MyPodsScreen {...defaultProps} />);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
    expect(UNSAFE_getByType(ActivityIndicator as any)).toBeTruthy();
  });

  it('shows error state', () => {
    (useQuery as jest.Mock).mockReturnValue({
      data: null,
      loading: false,
      error: new Error('Network fail'),
      refetch: mockRefetch,
    });
    const { getByText } = render(<MyPodsScreen {...defaultProps} />);
    expect(getByText(/Failed to load/i)).toBeTruthy();
  });

  it('shows empty state when no pods', () => {
    (useQuery as jest.Mock).mockReturnValue({
      data: { myPods: [] },
      loading: false,
      error: null,
      refetch: mockRefetch,
    });
    const { getByText } = render(<MyPodsScreen {...defaultProps} />);
    expect(getByText('No pods yet')).toBeTruthy();
  });

  it('renders pod cards', () => {
    const { getByText } = render(<MyPodsScreen {...defaultProps} />);
    expect(getByText('Test Pod')).toBeTruthy();
  });

  it('calls onPodPress when pod card is tapped', () => {
    const { getByText } = render(<MyPodsScreen {...defaultProps} />);
    fireEvent.press(getByText('Test Pod'));
    expect(defaultProps.onPodPress).toHaveBeenCalledWith('1');
  });
});
