import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { useMutation } from '@apollo/client';
import CreatePodScreen from '../CreatePodScreen';

jest.mock('../../../components/ContactPicker', () => {
  const mockReact = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: () => mockReact.createElement(View, { testID: 'contact-picker' }),
  };
});

jest.mock('../PodFormBody', () => {
  const mockReact = require('react');
  const { View, Text } = require('react-native');
  return {
    __esModule: true,
    default: () =>
      mockReact.createElement(View, { testID: 'pod-form-body' },
        mockReact.createElement(Text, null, 'Pod Form Body'),
      ),
  };
});

jest.mock('@react-native-community/datetimepicker', () => {
  const mockReact = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: (props: Record<string, unknown>) =>
      mockReact.createElement(View, { testID: 'date-picker', ...props }),
  };
});

const mockCreatePod = jest.fn().mockResolvedValue({
  data: { createPod: { id: 'new1', title: 'New Pod' } },
});

describe('CreatePodScreen', () => {
  const defaultProps = {
    onClose: jest.fn(),
    onSuccess: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useMutation as jest.Mock).mockReturnValue([
      mockCreatePod,
      { loading: false },
    ]);
  });

  it('renders header with Host a Pod', () => {
    const { getByText } = render(<CreatePodScreen {...defaultProps} />);
    expect(getByText('Host a Pod')).toBeTruthy();
  });

  it('calls onClose when close button pressed', () => {
    const { getByText } = render(<CreatePodScreen {...defaultProps} />);
    fireEvent.press(getByText('close'));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('renders the pod form body', () => {
    const { getByTestId } = render(<CreatePodScreen {...defaultProps} />);
    expect(getByTestId('pod-form-body')).toBeTruthy();
  });

  it('does not show contact picker initially', () => {
    const { queryByTestId } = render(
      <CreatePodScreen {...defaultProps} />,
    );
    expect(queryByTestId('contact-picker')).toBeNull();
  });
});
