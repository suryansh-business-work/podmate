import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { useQuery, useMutation } from '@apollo/client';
import RegisterPlaceScreen from '../RegisterPlaceScreen';

jest.mock('../../../hooks/useImageKitUpload', () => ({
  useImageKitUpload: () => ({
    pickAndUploadImage: jest.fn().mockResolvedValue({ url: 'https://img.jpg' }),
    uploading: false,
    progress: 0,
  }),
}));

jest.mock('../StepIndicator', () => {
  const mockReact = require('react');
  const { Text } = require('react-native');
  return {
    __esModule: true,
    default: ({ step }: { step: number }) =>
      mockReact.createElement(Text, { testID: 'step-indicator' }, `Step ${step + 1}`),
  };
});

jest.mock('../StepVenueDetails', () => {
  const mockReact = require('react');
  const { View, Text, TouchableOpacity } = require('react-native');
  return {
    __esModule: true,
    default: ({
      onSubmit,
      onMediaChange,
    }: {
      onSubmit: (values: Record<string, string>) => void;
      onMediaChange: (media: Array<{ type: string; url: string }>) => void;
    }) => {
      mockReact.useEffect(() => {
        onMediaChange([{ type: 'image', url: 'https://img.jpg' }]);
      }, [onMediaChange]);
      return mockReact.createElement(
        View,
        { testID: 'step-venue' },
        mockReact.createElement(Text, null, 'Venue Details'),
        mockReact.createElement(
          TouchableOpacity,
          {
            onPress: () =>
              onSubmit({
                name: 'Test Venue',
                category: 'Bar',
                description: 'desc',
                address: '123 Main',
                city: 'Delhi',
                capacity: '100',
              }),
            testID: 'next-step',
          },
          mockReact.createElement(Text, null, 'Next'),
        ),
      );
    },
  };
});

jest.mock('../StepDocuments', () => {
  const mockReact = require('react');
  const { View, Text, TouchableOpacity } = require('react-native');
  return {
    __esModule: true,
    default: ({ onContinue }: { onContinue: () => void }) =>
      mockReact.createElement(
        View,
        { testID: 'step-documents' },
        mockReact.createElement(Text, null, 'Documents'),
        mockReact.createElement(
          TouchableOpacity,
          { onPress: onContinue, testID: 'next-doc' },
          mockReact.createElement(Text, null, 'Next'),
        ),
      ),
  };
});

jest.mock('../StepPolicies', () => {
  const mockReact = require('react');
  const { View, Text } = require('react-native');
  return {
    __esModule: true,
    default: () =>
      mockReact.createElement(
        View,
        { testID: 'step-policies' },
        mockReact.createElement(Text, null, 'Policies'),
      ),
  };
});

const mockCreatePlace = jest.fn().mockResolvedValue({ data: {} });

describe('RegisterPlaceScreen', () => {
  const defaultProps = { onClose: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    (useMutation as jest.Mock).mockReturnValue([mockCreatePlace, { loading: false }]);
    (useQuery as jest.Mock).mockReturnValue({
      data: { policies: [] },
      loading: false,
    });
  });

  it('renders header title', () => {
    const { getByText } = render(<RegisterPlaceScreen {...defaultProps} />);
    expect(getByText('Register Venue')).toBeTruthy();
  });

  it('renders step indicator at step 1', () => {
    const { getByText } = render(<RegisterPlaceScreen {...defaultProps} />);
    expect(getByText('Step 1')).toBeTruthy();
  });

  it('renders venue details step initially', () => {
    const { getByTestId } = render(<RegisterPlaceScreen {...defaultProps} />);
    expect(getByTestId('step-venue')).toBeTruthy();
  });

  it('advances to documents step on next', () => {
    const { getByTestId, getByText } = render(<RegisterPlaceScreen {...defaultProps} />);
    fireEvent.press(getByTestId('next-step'));
    expect(getByTestId('step-documents')).toBeTruthy();
    expect(getByText('Step 2')).toBeTruthy();
  });

  it('advances to policies step', () => {
    const { getByTestId, getByText } = render(<RegisterPlaceScreen {...defaultProps} />);
    fireEvent.press(getByTestId('next-step'));
    fireEvent.press(getByTestId('next-doc'));
    expect(getByTestId('step-policies')).toBeTruthy();
    expect(getByText('Step 3')).toBeTruthy();
  });

  it('calls onClose when close button pressed', () => {
    const { getByText } = render(<RegisterPlaceScreen {...defaultProps} />);
    fireEvent.press(getByText('close'));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });
});
