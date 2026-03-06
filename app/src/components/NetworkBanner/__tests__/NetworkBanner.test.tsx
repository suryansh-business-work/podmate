import React from 'react';
import { render } from '@testing-library/react-native';
import NetworkBanner from '../NetworkBanner';

jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(() => jest.fn()),
  refresh: jest.fn(),
}));

describe('NetworkBanner', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders without crashing', () => {
    const { toJSON } = render(<NetworkBanner />);
    expect(toJSON()).toBeTruthy();
  });

  it('has accessibility role "alert"', () => {
    const { getByLabelText } = render(<NetworkBanner />);
    const banner = getByLabelText('Back online');
    expect(banner.props.accessibilityRole).toBe('alert');
  });

  it('has assertive accessibility live region', () => {
    const { getByLabelText } = render(<NetworkBanner />);
    const banner = getByLabelText('Back online');
    expect(banner.props.accessibilityLiveRegion).toBe('assertive');
  });

  it('subscribes to NetInfo on mount', () => {
    const NetInfo = require('@react-native-community/netinfo');
    render(<NetworkBanner />);
    expect(NetInfo.addEventListener).toHaveBeenCalledTimes(1);
  });

  it('unsubscribes from NetInfo on unmount', () => {
    const unsubscribe = jest.fn();
    const NetInfo = require('@react-native-community/netinfo');
    NetInfo.addEventListener.mockReturnValue(unsubscribe);
    const { unmount } = render(<NetworkBanner />);
    unmount();
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });
});
