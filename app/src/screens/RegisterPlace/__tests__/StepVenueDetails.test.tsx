import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import StepVenueDetails from '../StepVenueDetails';
import type { VenueFormValues } from '../RegisterPlace.types';

jest.mock('../../../components/GradientButton', () => {
  const { TouchableOpacity, Text } = require('react-native');
  return {
    GradientButton: ({ title, onPress }: { title: string; onPress: () => void }) => (
      <TouchableOpacity onPress={onPress} testID="gradient-btn">
        <Text>{title}</Text>
      </TouchableOpacity>
    ),
  };
});

jest.mock('../../../components/MediaUploader', () => {
  const { View, Text } = require('react-native');
  return {
    __esModule: true,
    default: () => <View><Text>MediaUploader</Text></View>,
  };
});

jest.mock('../VenueLocationPicker', () => {
  const { View, Text } = require('react-native');
  return {
    __esModule: true,
    default: () => <View><Text>VenueLocationPicker</Text></View>,
  };
});

const defaultFormValues: VenueFormValues = {
  name: '',
  category: '',
  description: '',
  address: '',
  city: '',
  capacity: '',
};

describe('StepVenueDetails', () => {
  const onSubmit = jest.fn();
  const onMediaChange = jest.fn();

  const baseProps = {
    formValues: defaultFormValues,
    venueMedia: [],
    googleMapsApiKey: 'test-key',
    onMediaChange,
    onSubmit,
  };

  beforeEach(() => jest.clearAllMocks());

  it('renders Basic Information title', () => {
    const { getByText } = render(<StepVenueDetails {...baseProps} />);
    expect(getByText('Basic Information')).toBeTruthy();
  });

  it('renders Venue Name field', () => {
    const { getByText, getByPlaceholderText } = render(
      <StepVenueDetails {...baseProps} />,
    );
    expect(getByText('Venue Name')).toBeTruthy();
    expect(getByPlaceholderText('e.g. Sky Lounge')).toBeTruthy();
  });

  it('renders Category label and all categories', () => {
    const { getByText } = render(<StepVenueDetails {...baseProps} />);
    expect(getByText('Category')).toBeTruthy();
    expect(getByText('Bar')).toBeTruthy();
    expect(getByText('Club')).toBeTruthy();
    expect(getByText('Lounge')).toBeTruthy();
    expect(getByText('Restaurant')).toBeTruthy();
    expect(getByText('Rooftop')).toBeTruthy();
    expect(getByText('Café')).toBeTruthy();
    expect(getByText('Pub')).toBeTruthy();
  });

  it('renders Description field', () => {
    const { getByText, getByPlaceholderText } = render(
      <StepVenueDetails {...baseProps} />,
    );
    expect(getByText('Description')).toBeTruthy();
    expect(getByPlaceholderText('Describe your venue...')).toBeTruthy();
  });

  it('renders Max Capacity field', () => {
    const { getByText, getByPlaceholderText } = render(
      <StepVenueDetails {...baseProps} />,
    );
    expect(getByText('Max Capacity')).toBeTruthy();
    expect(getByPlaceholderText('e.g. 200')).toBeTruthy();
  });

  it('renders Images & Videos section', () => {
    const { getByText } = render(<StepVenueDetails {...baseProps} />);
    expect(getByText('Images & Videos')).toBeTruthy();
    expect(getByText('MediaUploader')).toBeTruthy();
  });

  it('renders Location section with VenueLocationPicker', () => {
    const { getByText } = render(<StepVenueDetails {...baseProps} />);
    expect(getByText('Location')).toBeTruthy();
    expect(getByText('VenueLocationPicker')).toBeTruthy();
  });

  it('renders Continue button', () => {
    const { getByText } = render(<StepVenueDetails {...baseProps} />);
    expect(getByText('Continue')).toBeTruthy();
  });

  it('shows validation error for short venue name', async () => {
    const { getByPlaceholderText, findByText } = render(
      <StepVenueDetails {...baseProps} />,
    );
    const input = getByPlaceholderText('e.g. Sky Lounge');
    fireEvent.changeText(input, 'AB');
    fireEvent(input, 'onBlur', { persist: jest.fn(), target: { name: 'name' } });
    expect(await findByText('Min 3 characters')).toBeTruthy();
  });

  it('shows required error when venue name cleared', async () => {
    const { getByPlaceholderText, findByText } = render(
      <StepVenueDetails {...baseProps} />,
    );
    const input = getByPlaceholderText('e.g. Sky Lounge');
    fireEvent.changeText(input, '');
    fireEvent(input, 'onBlur', { persist: jest.fn(), target: { name: 'name' } });
    expect(await findByText('Venue name required')).toBeTruthy();
  });

  it('initializes form with provided values', () => {
    const values: VenueFormValues = {
      name: 'Test Venue', category: 'Bar', description: 'A nice bar',
      address: '123 St', city: 'Delhi', capacity: '100',
    };
    const { getByDisplayValue } = render(
      <StepVenueDetails {...baseProps} formValues={values} />,
    );
    expect(getByDisplayValue('Test Venue')).toBeTruthy();
    expect(getByDisplayValue('A nice bar')).toBeTruthy();
    expect(getByDisplayValue('100')).toBeTruthy();
  });
});
