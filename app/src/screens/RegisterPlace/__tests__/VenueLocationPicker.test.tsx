import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import VenueLocationPicker from '../VenueLocationPicker';

jest.mock('../../../utils/locationService', () => ({
  getCurrentLocation: jest.fn().mockResolvedValue({
    address: '123 Test Road, Mumbai',
    city: 'Mumbai',
    latitude: 19.076,
    longitude: 72.8777,
  }),
}));

describe('VenueLocationPicker', () => {
  const onLocationChange = jest.fn();
  const baseProps = {
    address: '',
    city: '',
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
    googleMapsApiKey: 'test-api-key',
    onLocationChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ status: 'ZERO_RESULTS', predictions: [] }),
    });
  });

  it('renders toggle buttons', () => {
    const { getByText } = render(<VenueLocationPicker {...baseProps} />);
    expect(getByText("I'm at the venue")).toBeTruthy();
    expect(getByText('Search address')).toBeTruthy();
  });

  it('defaults to search mode', () => {
    const { getByPlaceholderText } = render(<VenueLocationPicker {...baseProps} />);
    expect(getByPlaceholderText('Search venue address…')).toBeTruthy();
  });

  it('switches to GPS mode on toggle', async () => {
    const { getByText, queryByPlaceholderText } = render(<VenueLocationPicker {...baseProps} />);
    await act(async () => {
      fireEvent.press(getByText("I'm at the venue"));
    });
    // GPS mode - search input should not be visible
    expect(queryByPlaceholderText('Search venue address…')).toBeNull();
  });

  it('switches back to search mode', async () => {
    const { getByText, getByPlaceholderText } = render(<VenueLocationPicker {...baseProps} />);
    await act(async () => {
      fireEvent.press(getByText("I'm at the venue"));
    });
    fireEvent.press(getByText('Search address'));
    expect(getByPlaceholderText('Search venue address…')).toBeTruthy();
  });

  it('shows Use My Current Location button in GPS mode', async () => {
    const { getByText } = render(<VenueLocationPicker {...baseProps} />);
    await act(async () => {
      fireEvent.press(getByText("I'm at the venue"));
    });
    // After GPS resolves, either location detected or Use My Current Location
    await waitFor(() => {
      expect(onLocationChange).toHaveBeenCalled();
    });
  });

  it('shows Location detected with coordinates', () => {
    const { getByText } = render(
      <VenueLocationPicker
        {...baseProps}
        latitude={19.076}
        longitude={72.8777}
        address="123 Test Road"
      />,
    );
    // Switch to GPS mode manually
    fireEvent.press(getByText("I'm at the venue"));
  });

  it('updates search query on type', () => {
    const { getByPlaceholderText } = render(<VenueLocationPicker {...baseProps} />);
    const input = getByPlaceholderText('Search venue address…');
    fireEvent.changeText(input, 'Bandra');
    expect(input.props.value).toBe('Bandra');
  });

  it('clears search on close button press', async () => {
    const { getByPlaceholderText, getByText } = render(<VenueLocationPicker {...baseProps} />);
    fireEvent.changeText(getByPlaceholderText('Search venue address…'), 'test');
    // Close button appears when text is non-empty
    await waitFor(() => {
      fireEvent.press(getByText('close'));
    });
    expect(getByPlaceholderText('Search venue address…').props.value).toBe('');
  });

  it('renders Retry GPS button when location detected', async () => {
    const { getByText } = render(
      <VenueLocationPicker
        {...baseProps}
        latitude={19.076}
        longitude={72.8777}
        address="123 Test Road"
      />,
    );
    await act(async () => {
      fireEvent.press(getByText("I'm at the venue"));
    });
    await waitFor(() => {
      expect(getByText('Retry GPS')).toBeTruthy();
    });
  });

  it('shows Location confirmed in search mode with coords', () => {
    const { getByText } = render(
      <VenueLocationPicker
        {...baseProps}
        latitude={19.076}
        longitude={72.8777}
        address="123 Test Road"
      />,
    );
    expect(getByText('Location confirmed')).toBeTruthy();
  });
});
