import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { Animated } from 'react-native';

jest.mock('expo-video', () => {
  const mockReact = require('react');
  const { View } = require('react-native');
  return {
    useVideoPlayer: jest.fn(() => ({
      play: jest.fn(),
      pause: jest.fn(),
      muted: false,
      loop: false,
      addListener: jest.fn(() => ({ remove: jest.fn() })),
    })),
    VideoView: (props: Record<string, unknown>) =>
      mockReact.createElement(View, { ...props, testID: 'mock-video' }),
  };
});

import SplashScreen from '../SplashScreen';

describe('SplashScreen', () => {
  const defaultProps = { onFinish: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { toJSON } = render(<SplashScreen {...defaultProps} />);
    expect(toJSON()).toBeTruthy();
  });

  it('displays the PartyWings brand name', () => {
    const { getByText } = render(<SplashScreen {...defaultProps} />);
    expect(getByText('PartyWings')).toBeTruthy();
  });

  it('renders the video view', () => {
    const { getByTestId } = render(<SplashScreen {...defaultProps} />);
    expect(getByTestId('mock-video')).toBeTruthy();
  });

  it('starts logo fade-in animation', () => {
    const timingSpy = jest.spyOn(Animated, 'timing');
    render(<SplashScreen {...defaultProps} />);
    expect(timingSpy).toHaveBeenCalled();
    timingSpy.mockRestore();
  });

  it('calls onFinish after timeout', async () => {
    render(<SplashScreen {...defaultProps} />);
    jest.advanceTimersByTime(5000);
    await waitFor(() => {
      expect(defaultProps.onFinish).toHaveBeenCalledTimes(1);
    });
  });

  it('does not call onFinish before timeout', () => {
    render(<SplashScreen {...defaultProps} />);
    jest.advanceTimersByTime(2000);
    expect(defaultProps.onFinish).not.toHaveBeenCalled();
  });
});
