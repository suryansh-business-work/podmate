import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import StepDocuments from '../StepDocuments';

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

describe('StepDocuments', () => {
  const baseProps = {
    businessLicenseUrl: '',
    permitsUrl: '',
    uploading: false,
    progress: 0,
    onUploadLicense: jest.fn(),
    onUploadPermits: jest.fn(),
    onContinue: jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  it('renders section title', () => {
    const { getByText } = render(<StepDocuments {...baseProps} />);
    expect(getByText('Upload Documents')).toBeTruthy();
  });

  it('renders helper text', () => {
    const { getByText } = render(<StepDocuments {...baseProps} />);
    expect(getByText(/Upload your business license/)).toBeTruthy();
  });

  it('renders upload placeholders when no URLs', () => {
    const { getByText } = render(<StepDocuments {...baseProps} />);
    expect(getByText('Business License')).toBeTruthy();
    expect(getByText('Permits & Licenses')).toBeTruthy();
  });

  it('shows upload subtext hints', () => {
    const { getByText } = render(<StepDocuments {...baseProps} />);
    expect(getByText('Tap to upload (JPG, PNG)')).toBeTruthy();
    expect(getByText('Food / Liquor / Music permits')).toBeTruthy();
  });

  it('calls onUploadLicense when license box pressed', () => {
    const { getByText } = render(<StepDocuments {...baseProps} />);
    fireEvent.press(getByText('Business License'));
    expect(baseProps.onUploadLicense).toHaveBeenCalled();
  });

  it('calls onUploadPermits when permits box pressed', () => {
    const { getByText } = render(<StepDocuments {...baseProps} />);
    fireEvent.press(getByText('Permits & Licenses'));
    expect(baseProps.onUploadPermits).toHaveBeenCalled();
  });

  it('shows uploading progress', () => {
    const { getByText } = render(<StepDocuments {...baseProps} uploading={true} progress={0.65} />);
    expect(getByText('Uploading... 65%')).toBeTruthy();
  });

  it('disables upload boxes while uploading', () => {
    const props = { ...baseProps, uploading: true, progress: 0.5 };
    const { getByText } = render(<StepDocuments {...props} />);
    // Tap should not trigger callback - boxes are disabled
    fireEvent.press(getByText('Business License'));
    expect(props.onUploadLicense).not.toHaveBeenCalled();
  });

  it('renders Continue button', () => {
    const { getByText } = render(<StepDocuments {...baseProps} />);
    expect(getByText('Continue')).toBeTruthy();
  });

  it('calls onContinue when button pressed', () => {
    const { getByText } = render(<StepDocuments {...baseProps} />);
    fireEvent.press(getByText('Continue'));
    expect(baseProps.onContinue).toHaveBeenCalled();
  });

  it('hides placeholder when businessLicenseUrl is provided', () => {
    const { queryByText } = render(
      <StepDocuments {...baseProps} businessLicenseUrl="https://img.com/license.jpg" />,
    );
    expect(queryByText('Business License')).toBeNull();
  });

  it('hides placeholder when permitsUrl is provided', () => {
    const { queryByText } = render(
      <StepDocuments {...baseProps} permitsUrl="https://img.com/permits.jpg" />,
    );
    expect(queryByText('Permits & Licenses')).toBeNull();
  });
});
