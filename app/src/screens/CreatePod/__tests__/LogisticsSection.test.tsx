import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import LogisticsSection from '../LogisticsSection';

jest.mock('@react-native-community/datetimepicker', () => {
  const { View, Text } = require('react-native');
  return {
    __esModule: true,
    default: ({ mode }: { mode: string }) => (
      <View testID={`datetimepicker-${mode}`}>
        <Text>DateTimePicker-{mode}</Text>
      </View>
    ),
  };
});

describe('LogisticsSection', () => {
  const now = new Date('2025-06-15T18:00:00');
  const baseProps = {
    fee: '500',
    maxSeats: 5,
    dateTime: now,
    showDatePicker: false,
    showTimePicker: false,
    onFeeChange: jest.fn(),
    onMaxSeatsChange: jest.fn(),
    onShowDatePicker: jest.fn(),
    onDateChange: jest.fn(),
    onTimeChange: jest.fn(),
    onDismissDatePicker: jest.fn(),
    onDismissTimePicker: jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  it('renders Logistics section title', () => {
    const { getByText } = render(<LogisticsSection {...baseProps} />);
    expect(getByText('Logistics')).toBeTruthy();
  });

  it('renders fee per person label', () => {
    const { getByText } = render(<LogisticsSection {...baseProps} />);
    expect(getByText('FEE PER PERSON')).toBeTruthy();
  });

  it('renders currency symbol', () => {
    const { getByText } = render(<LogisticsSection {...baseProps} />);
    expect(getByText('₹')).toBeTruthy();
  });

  it('displays current fee value', () => {
    const { getByDisplayValue } = render(<LogisticsSection {...baseProps} />);
    expect(getByDisplayValue('500')).toBeTruthy();
  });

  it('calls onFeeChange when fee input changes', () => {
    const { getByDisplayValue } = render(<LogisticsSection {...baseProps} />);
    fireEvent.changeText(getByDisplayValue('500'), '750');
    expect(baseProps.onFeeChange).toHaveBeenCalledWith('750');
  });

  it('renders MAX SEATS label and counter', () => {
    const { getByText } = render(<LogisticsSection {...baseProps} />);
    expect(getByText('MAX SEATS')).toBeTruthy();
    expect(getByText('5')).toBeTruthy();
  });

  it('increments seat count on + press', () => {
    const { getByText } = render(<LogisticsSection {...baseProps} />);
    fireEvent.press(getByText('+'));
    expect(baseProps.onMaxSeatsChange).toHaveBeenCalledWith(6);
  });

  it('decrements seat count on − press', () => {
    const { getByText } = render(<LogisticsSection {...baseProps} />);
    fireEvent.press(getByText('−'));
    expect(baseProps.onMaxSeatsChange).toHaveBeenCalledWith(4);
  });

  it('does not go below 1 seat', () => {
    const { getByText } = render(<LogisticsSection {...baseProps} maxSeats={1} />);
    fireEvent.press(getByText('−'));
    expect(baseProps.onMaxSeatsChange).toHaveBeenCalledWith(1);
  });

  it('renders WHEN label', () => {
    const { getByText } = render(<LogisticsSection {...baseProps} />);
    expect(getByText('WHEN')).toBeTruthy();
  });

  it('calls onShowDatePicker when date row pressed', () => {
    const { getByText } = render(<LogisticsSection {...baseProps} />);
    // The date row shows a formatted date — find by the 'event' icon text
    fireEvent.press(getByText('event'));
    expect(baseProps.onShowDatePicker).toHaveBeenCalled();
  });

  it('shows DateTimePicker in date mode when showDatePicker is true', () => {
    const { getByText } = render(
      <LogisticsSection {...baseProps} showDatePicker={true} />,
    );
    expect(getByText('DateTimePicker-date')).toBeTruthy();
  });

  it('shows DateTimePicker in time mode when showTimePicker is true', () => {
    const { getByText } = render(
      <LogisticsSection {...baseProps} showTimePicker={true} />,
    );
    expect(getByText('DateTimePicker-time')).toBeTruthy();
  });

  it('does not show DateTimePicker when both pickers hidden', () => {
    const { queryByText } = render(<LogisticsSection {...baseProps} />);
    expect(queryByText('DateTimePicker-date')).toBeNull();
    expect(queryByText('DateTimePicker-time')).toBeNull();
  });
});
