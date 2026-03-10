import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import StepPolicies from '../StepPolicies';
import type { PolicyItem } from '../RegisterPlace.types';

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

const makePolicies = (): PolicyItem[] => [
  {
    id: 'p1',
    type: 'TERMS',
    title: 'Terms of Service',
    content: 'You agree to our terms.',
    isActive: true,
  },
  {
    id: 'p2',
    type: 'PRIVACY',
    title: 'Privacy Policy',
    content: 'We protect your data.',
    isActive: true,
  },
];

describe('StepPolicies', () => {
  const baseProps = {
    policies: makePolicies(),
    policiesLoading: false,
    policiesAccepted: false,
    hasScrolledPolicies: false,
    submitting: false,
    onToggleAccepted: jest.fn(),
    onScrolledToBottom: jest.fn(),
    onSubmit: jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  it('renders section title', () => {
    const { getByText } = render(<StepPolicies {...baseProps} />);
    expect(getByText('Venue Policies')).toBeTruthy();
  });

  it('renders helper text', () => {
    const { getByText } = render(<StepPolicies {...baseProps} />);
    expect(getByText(/Please read and accept/)).toBeTruthy();
  });

  it('renders policy cards', () => {
    const { getByText } = render(<StepPolicies {...baseProps} />);
    expect(getByText('Terms of Service')).toBeTruthy();
    expect(getByText('Privacy Policy')).toBeTruthy();
    expect(getByText('You agree to our terms.')).toBeTruthy();
    expect(getByText('We protect your data.')).toBeTruthy();
  });

  it('shows loading indicator when policiesLoading', () => {
    const { queryByText } = render(<StepPolicies {...baseProps} policiesLoading={true} />);
    expect(queryByText('Terms of Service')).toBeNull();
  });

  it('shows empty state when no policies', () => {
    const { getByText } = render(<StepPolicies {...baseProps} policies={[]} />);
    expect(getByText('No policies available at this time.')).toBeTruthy();
  });

  it('renders checkbox label', () => {
    const { getByText } = render(<StepPolicies {...baseProps} />);
    expect(getByText(/I have read and accept/)).toBeTruthy();
  });

  it('shows scroll hint when not scrolled to bottom', () => {
    const { getByText } = render(<StepPolicies {...baseProps} />);
    expect(getByText(/Scroll to the bottom to enable/)).toBeTruthy();
  });

  it('hides scroll hint when scrolled to bottom', () => {
    const { queryByText } = render(<StepPolicies {...baseProps} hasScrolledPolicies={true} />);
    expect(queryByText(/Scroll to the bottom to enable/)).toBeNull();
  });

  it('does not toggle acceptance before scrolling', () => {
    const { getByText } = render(<StepPolicies {...baseProps} />);
    fireEvent.press(getByText(/I have read and accept/));
    expect(baseProps.onToggleAccepted).not.toHaveBeenCalled();
  });

  it('toggles acceptance after scrolling', () => {
    const { getByText } = render(<StepPolicies {...baseProps} hasScrolledPolicies={true} />);
    fireEvent.press(getByText(/I have read and accept/));
    expect(baseProps.onToggleAccepted).toHaveBeenCalled();
  });

  it('renders Submit Registration button', () => {
    const { getByText } = render(<StepPolicies {...baseProps} />);
    expect(getByText('Submit Registration')).toBeTruthy();
  });

  it('shows Submitting… text when submitting', () => {
    const { getByText } = render(<StepPolicies {...baseProps} submitting={true} />);
    expect(getByText('Submitting…')).toBeTruthy();
  });

  it('calls onSubmit when button pressed', () => {
    const { getByText } = render(<StepPolicies {...baseProps} policiesAccepted={true} />);
    fireEvent.press(getByText('Submit Registration'));
    expect(baseProps.onSubmit).toHaveBeenCalled();
  });

  it('disables submit when policies not accepted', () => {
    const { getByTestId } = render(<StepPolicies {...baseProps} />);
    const btn = getByTestId('gradient-btn');
    expect(btn.props.accessibilityState?.disabled ?? btn.props.disabled).toBeTruthy();
  });

  it('does not show checkbox row when loading', () => {
    const { queryByText } = render(<StepPolicies {...baseProps} policiesLoading={true} />);
    expect(queryByText(/I have read and accept/)).toBeNull();
  });

  it('does not show checkbox row when no policies', () => {
    const { queryByText } = render(<StepPolicies {...baseProps} policies={[]} />);
    expect(queryByText(/I have read and accept/)).toBeNull();
  });
});
