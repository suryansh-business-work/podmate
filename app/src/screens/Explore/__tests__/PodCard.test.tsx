import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Share } from 'react-native';
import { useMutation } from '@apollo/client';
import PodCard from '../PodCard';
import type { Pod } from '../Explore.types';

jest.mock('expo-video', () => ({
  useVideoPlayer: () => ({ loop: true, muted: true, play: jest.fn() }),
  VideoView: 'VideoView',
}));

jest.mock('../../../components/SafeImage', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: () => <View testID="safe-image" />,
  };
});

const makePod = (overrides: Partial<Pod> = {}): Pod => ({
  id: 'pod1',
  title: 'Sushi Night',
  description: 'Learn to make sushi with friends',
  category: 'Social',
  imageUrl: 'https://img.com/sushi.jpg',
  mediaUrls: [],
  feePerPerson: 500,
  location: 'Mumbai',
  locationDetail: 'Bandra, Mumbai',
  maxSeats: 10,
  currentSeats: 6,
  dateTime: '2025-07-10T18:00:00Z',
  status: 'ACTIVE',
  rating: 4.5,
  reviewCount: 12,
  host: { id: 'h1', name: 'HostUser', avatar: 'https://img.com/host.jpg', isVerifiedHost: true },
  attendees: [],
  ...overrides,
});

describe('PodCard', () => {
  const saveFn = jest.fn().mockResolvedValue({});
  const unsaveFn = jest.fn().mockResolvedValue({});
  const onCategoryChange = jest.fn();
  const onJoinPress = jest.fn();
  const onDetailPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useMutation as jest.Mock)
      .mockReturnValueOnce([saveFn, {}])
      .mockReturnValueOnce([unsaveFn, {}]);
  });

  const baseProps = {
    activeCategory: 'All',
    currentUserId: 'me1',
    savedPodIds: [] as string[],
    onCategoryChange,
    onDetailPress,
    onJoinPress,
    slideHeight: 600,
  };

  it('renders pod title', () => {
    const { getByText } = render(<PodCard item={makePod()} {...baseProps} />);
    expect(getByText('Sushi Night')).toBeTruthy();
  });

  it('renders pod description', () => {
    const { getByText } = render(<PodCard item={makePod()} {...baseProps} />);
    expect(getByText('Learn to make sushi with friends')).toBeTruthy();
  });

  it('renders host name with @', () => {
    const { getByText } = render(<PodCard item={makePod()} {...baseProps} />);
    expect(getByText('@HostUser')).toBeTruthy();
  });

  it('shows verified icon for verified host', () => {
    const { getByText } = render(<PodCard item={makePod()} {...baseProps} />);
    expect(getByText('verified')).toBeTruthy();
  });

  it('hides verified icon for non-verified host', () => {
    const pod = makePod({ host: { id: 'h1', name: 'Bob', avatar: '', isVerifiedHost: false } });
    const { queryByText } = render(<PodCard item={pod} {...baseProps} />);
    // 'verified' icon text should NOT appear (info-outline, share, bookmark-border still there)
    expect(queryByText('verified')).toBeNull();
  });

  it('renders location chip', () => {
    const { getByText } = render(<PodCard item={makePod()} {...baseProps} />);
    expect(getByText('Mumbai')).toBeTruthy();
  });

  it('renders fee per person', () => {
    const { getByText } = render(<PodCard item={makePod()} {...baseProps} />);
    const feeText = (500).toLocaleString();
    expect(getByText(`₹${feeText}`)).toBeTruthy();
  });

  it('shows seats count', () => {
    const { getByText } = render(<PodCard item={makePod()} {...baseProps} />);
    expect(getByText('6/10 seats')).toBeTruthy();
  });

  it('shows Join Pod button when not joined and not full', () => {
    const { getByText } = render(<PodCard item={makePod()} {...baseProps} />);
    expect(getByText('Join Pod')).toBeTruthy();
  });

  it('calls onJoinPress when Join Pod pressed', () => {
    const { getByText } = render(<PodCard item={makePod()} {...baseProps} />);
    fireEvent.press(getByText('Join Pod'));
    expect(onJoinPress).toHaveBeenCalledWith('pod1');
  });

  it('shows Full button when pod is full', () => {
    const pod = makePod({ currentSeats: 10, maxSeats: 10 });
    const { getByText } = render(<PodCard item={pod} {...baseProps} />);
    expect(getByText('Full')).toBeTruthy();
  });

  it('shows Joined when user already joined', () => {
    const pod = makePod({ attendees: [{ id: 'me1' }] });
    const { getByText } = render(<PodCard item={pod} {...baseProps} />);
    expect(getByText('Joined')).toBeTruthy();
  });

  it('shows Save text when not saved', () => {
    const { getByText } = render(<PodCard item={makePod()} {...baseProps} />);
    expect(getByText('Save')).toBeTruthy();
  });

  it('shows Saved text when pod is saved', () => {
    const { getByText } = render(
      <PodCard item={makePod()} {...baseProps} savedPodIds={['pod1']} />,
    );
    expect(getByText('Saved')).toBeTruthy();
  });

  it('calls onDetailPress when Details pressed', () => {
    const { getByText } = render(<PodCard item={makePod()} {...baseProps} />);
    fireEvent.press(getByText('Details'));
    expect(onDetailPress).toHaveBeenCalledWith('pod1');
  });

  it('renders category pills', () => {
    const { getByText } = render(<PodCard item={makePod()} {...baseProps} />);
    expect(getByText('All')).toBeTruthy();
    expect(getByText('Social')).toBeTruthy();
  });

  it('calls onCategoryChange when category pill pressed', () => {
    const { getByText } = render(<PodCard item={makePod()} {...baseProps} />);
    fireEvent.press(getByText('Learning'));
    expect(onCategoryChange).toHaveBeenCalledWith('Learning');
  });

  it('calls Share.share when Share pressed', () => {
    const shareSpy = jest.spyOn(Share, 'share').mockResolvedValue({ action: 'sharedAction' });
    const { getByText } = render(<PodCard item={makePod()} {...baseProps} />);
    fireEvent.press(getByText('Share'));
    expect(shareSpy).toHaveBeenCalled();
    shareSpy.mockRestore();
  });

  it('renders placeholder when no images', () => {
    const pod = makePod({ imageUrl: '', mediaUrls: [] });
    const { getByText } = render(<PodCard item={pod} {...baseProps} />);
    expect(getByText('celebration')).toBeTruthy();
  });
});
