import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { EventCard } from '../EventCard';

jest.mock('../SafeImage', () => {
  const mockReact = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: ({ uri, testID }: { uri: string; testID?: string }) =>
      mockReact.createElement(View, { testID: testID ?? 'safe-image', accessibilityLabel: uri }),
  };
});

const baseProps = {
  id: 'pod-123',
  title: 'Hiking at Sunrise',
  imageUrl: 'https://example.com/img.jpg',
  feePerPerson: 500,
  maxSeats: 10,
  currentSeats: 3,
  dateTime: '2025-07-15T08:00:00Z',
  rating: 4.5,
  status: 'CONFIRMED',
  category: 'Outdoor',
  hostName: 'John Doe',
  hostAvatar: 'https://example.com/avatar.jpg',
  onPress: jest.fn(),
};

describe('EventCard - Rendering', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders the pod title', () => {
    const { getByText } = render(<EventCard {...baseProps} />);
    expect(getByText('Hiking at Sunrise')).toBeTruthy();
  });

  it('renders the formatted fee as spots', () => {
    const { getByText } = render(<EventCard {...baseProps} />);
    expect(getByText('7 spots')).toBeTruthy();
  });

  it('renders spots left count', () => {
    const { getByText } = render(<EventCard {...baseProps} maxSeats={10} currentSeats={10} />);
    expect(getByText('Full')).toBeTruthy();
  });

  it('renders the host name', () => {
    const { getByText } = render(<EventCard {...baseProps} />);
    expect(getByText('John Doe')).toBeTruthy();
  });

  it('renders the date block with status color', () => {
    const { getByText } = render(<EventCard {...baseProps} />);
    expect(getByText('JUL')).toBeTruthy();
    expect(getByText('15')).toBeTruthy();
  });

  it('renders rating as number when > 0', () => {
    const { getByText } = render(<EventCard {...baseProps} rating={4.5} />);
    expect(getByText('4.5')).toBeTruthy();
  });

  it('hides rating when 0', () => {
    const { queryByText } = render(<EventCard {...baseProps} rating={0} />);
    expect(queryByText('★')).toBeNull();
  });

  it('does not show Joined badge when isJoined is false', () => {
    const { queryByText } = render(<EventCard {...baseProps} isJoined={false} />);
    expect(queryByText('✓ Joined')).toBeNull();
  });

  it('shows Joined badge when isJoined is true', () => {
    const { getByText } = render(<EventCard {...baseProps} isJoined />);
    expect(getByText('✓ Joined')).toBeTruthy();
  });

  it('has proper accessibility attributes', () => {
    const { getByRole } = render(<EventCard {...baseProps} />);
    const card = getByRole('button');
    expect(card.props.accessibilityHint).toBe('Opens pod details');
  });
});

describe('EventCard - Behavior', () => {
  beforeEach(() => jest.clearAllMocks());

  it('calls onPress with the pod id when tapped', () => {
    const onPress = jest.fn();
    const { getByRole } = render(<EventCard {...baseProps} onPress={onPress} />);
    fireEvent.press(getByRole('button'));
    expect(onPress).toHaveBeenCalledWith('pod-123');
  });

  it('renders play overlay when mediaUrls contains a video', () => {
    const { getByText } = render(
      <EventCard {...baseProps} mediaUrls={['https://example.com/video.mp4']} />,
    );
    expect(getByText('play-circle-filled')).toBeTruthy();
  });

  it('does not render play overlay when no videos', () => {
    const { queryByText } = render(
      <EventCard {...baseProps} mediaUrls={['https://example.com/photo.jpg']} />,
    );
    expect(queryByText('play-circle-filled')).toBeNull();
  });
});
