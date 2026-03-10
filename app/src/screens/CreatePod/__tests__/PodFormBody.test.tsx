import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { useQuery } from '@apollo/client';
import PodFormBody from '../PodFormBody';
import type { PodFormValues } from '../CreatePod.types';

jest.mock('@react-native-community/datetimepicker', () => {
  const { View, Text } = require('react-native');
  return {
    __esModule: true,
    default: ({ mode }: { mode: string }) => (
      <View>
        <Text>DateTimePicker-{mode}</Text>
      </View>
    ),
  };
});

jest.mock('../../../components/GradientButton', () => {
  const { TouchableOpacity, Text } = require('react-native');
  return {
    GradientButton: ({
      title,
      onPress,
      disabled,
    }: {
      title: string;
      onPress: () => void;
      disabled?: boolean;
    }) => (
      <TouchableOpacity onPress={onPress} disabled={disabled} testID="gradient-btn">
        <Text>{title}</Text>
      </TouchableOpacity>
    ),
  };
});

jest.mock('../../../components/MediaUploader', () => {
  const { View, Text } = require('react-native');
  return {
    __esModule: true,
    default: () => (
      <View>
        <Text>MediaUploader</Text>
      </View>
    ),
  };
});

jest.mock('../../../hooks/useLocation', () => ({
  useLocation: () => ({
    location: null,
    loading: false,
    requestLocation: jest.fn().mockResolvedValue(null),
  }),
}));

jest.mock('../../../hooks/useEffectiveFee', () => ({
  useEffectiveFee: jest.fn(() => ({
    feePercent: 5,
    source: 'GLOBAL',
    loading: false,
  })),
}));

const makeFormik = (overrides: Partial<PodFormValues> = {}) => {
  const values: PodFormValues = {
    title: '',
    description: '',
    fee: '0',
    maxSeats: 2,
    placeId: '',
    location: '',
    locationDetail: '',
    latitude: 0,
    longitude: 0,
    category: '',
    ...overrides,
  };
  return {
    handleChange: jest.fn(() => jest.fn()),
    handleBlur: jest.fn(() => jest.fn()),
    handleSubmit: jest.fn(),
    values,
    errors: {} as Record<string, string>,
    touched: {} as Record<string, boolean>,
    isValid: true,
    dirty: true,
    setFieldValue: jest.fn(),
  };
};

describe('PodFormBody', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useQuery as jest.Mock).mockReturnValue({ data: null, loading: false });
  });

  const baseProps = {
    dateTime: new Date('2025-06-15T18:00:00'),
    showDatePicker: false,
    showTimePicker: false,
    mediaItems: [],
    loading: false,
    onMediaChange: jest.fn(),
    onShowDatePicker: jest.fn(),
    onDateChange: jest.fn(),
    onTimeChange: jest.fn(),
    onDismissDatePicker: jest.fn(),
    onDismissTimePicker: jest.fn(),
  };

  it('renders page title and subtitle', () => {
    const formik = makeFormik();
    const { getByText } = render(<PodFormBody formik={formik as never} {...baseProps} />);
    expect(getByText(/set up your Pod/)).toBeTruthy();
    expect(getByText(/micro-community event/)).toBeTruthy();
  });

  it('renders MEDIA label', () => {
    const { getByText } = render(<PodFormBody formik={makeFormik() as never} {...baseProps} />);
    expect(getByText('MEDIA')).toBeTruthy();
    expect(getByText('MediaUploader')).toBeTruthy();
  });

  it('renders POD TITLE input label', () => {
    const { getByText } = render(<PodFormBody formik={makeFormik() as never} {...baseProps} />);
    expect(getByText('POD TITLE')).toBeTruthy();
  });

  it('renders THE PLAN textarea label', () => {
    const { getByText } = render(<PodFormBody formik={makeFormik() as never} {...baseProps} />);
    expect(getByText('THE PLAN')).toBeTruthy();
  });

  it('renders CATEGORY label and chips', () => {
    const { getByText } = render(<PodFormBody formik={makeFormik() as never} {...baseProps} />);
    expect(getByText('CATEGORY')).toBeTruthy();
    expect(getByText('Social')).toBeTruthy();
    expect(getByText('Learning')).toBeTruthy();
    expect(getByText('Outdoor')).toBeTruthy();
  });

  it('renders VENUE picker label', () => {
    const { getByText } = render(<PodFormBody formik={makeFormik() as never} {...baseProps} />);
    expect(getByText('VENUE')).toBeTruthy();
    expect(getByText('Select a registered venue')).toBeTruthy();
  });

  it('renders Use My Location button', () => {
    const { getByText } = render(<PodFormBody formik={makeFormik() as never} {...baseProps} />);
    expect(getByText('Use My Location')).toBeTruthy();
  });

  it('renders Create Pod button', () => {
    const { getByText } = render(<PodFormBody formik={makeFormik() as never} {...baseProps} />);
    expect(getByText('Create Pod →')).toBeTruthy();
  });

  it('shows Creating... when loading', () => {
    const { getByText } = render(
      <PodFormBody formik={makeFormik() as never} {...baseProps} loading={true} />,
    );
    expect(getByText('Creating...')).toBeTruthy();
  });

  it('renders verified host status text', () => {
    const { getByText } = render(<PodFormBody formik={makeFormik() as never} {...baseProps} />);
    expect(getByText('Verified Host Status Required')).toBeTruthy();
  });

  it('shows location detail when set', () => {
    const formik = makeFormik({ locationDetail: 'Bandra, Mumbai' });
    const { getByText } = render(<PodFormBody formik={formik as never} {...baseProps} />);
    expect(getByText('Bandra, Mumbai')).toBeTruthy();
  });

  it('opens venue modal on venue press', () => {
    const { getByText, queryByPlaceholderText } = render(
      <PodFormBody formik={makeFormik() as never} {...baseProps} />,
    );
    fireEvent.press(getByText('Select a registered venue'));
    expect(queryByPlaceholderText('Search venues...')).toBeTruthy();
  });
});
