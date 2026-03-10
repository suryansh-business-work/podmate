import React from 'react';
import { ActivityIndicator } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { useQuery, useMutation } from '@apollo/client';
import EditProfileScreen from '../EditProfileScreen';

jest.mock('../../../hooks/useImageKitUpload', () => ({
  useImageKitUpload: () => ({
    pickAndUploadImage: jest.fn().mockResolvedValue({ url: 'https://new-avatar.jpg' }),
    uploading: false,
    progress: 0,
  }),
}));

const mockUser = {
  id: 'u1',
  name: 'Test User',
  username: 'testuser',
  email: 'test@example.com',
  phone: '+919999999999',
  avatar: 'https://example.com/avatar.jpg',
  dob: '1995-01-15',
};

const mockRefetch = jest.fn();
const mockUpdateProfile = jest.fn().mockResolvedValue({ data: {} });

describe('EditProfileScreen', () => {
  const defaultProps = { onBack: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    (useQuery as jest.Mock).mockReturnValue({
      data: { me: mockUser },
      loading: false,
      refetch: mockRefetch,
    });
    (useMutation as jest.Mock).mockReturnValue([
      mockUpdateProfile,
      { loading: false },
    ]);
  });

  it('renders header title', () => {
    const { getByText } = render(
      <EditProfileScreen {...defaultProps} />,
    );
    expect(getByText('Edit Profile')).toBeTruthy();
  });

  it('calls onBack when back pressed', () => {
    const { getByText } = render(
      <EditProfileScreen {...defaultProps} />,
    );
    fireEvent.press(getByText('arrow-back'));
    expect(defaultProps.onBack).toHaveBeenCalled();
  });

  it('shows loading indicator when loading', () => {
    (useQuery as jest.Mock).mockReturnValue({
      data: null,
      loading: true,
      refetch: mockRefetch,
    });
    (useMutation as jest.Mock).mockReturnValue([
      mockUpdateProfile,
      { loading: false },
    ]);
    const { UNSAFE_getByType } = render(
      <EditProfileScreen {...defaultProps} />,
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
    expect(UNSAFE_getByType(ActivityIndicator as any)).toBeTruthy();
  });

  it('renders read-only username', () => {
    const { getByText } = render(
      <EditProfileScreen {...defaultProps} />,
    );
    expect(getByText(/@testuser/)).toBeTruthy();
  });

  it('renders read-only phone', () => {
    const { getByText } = render(
      <EditProfileScreen {...defaultProps} />,
    );
    expect(getByText('+919999999999')).toBeTruthy();
  });

  it('renders editable name field', () => {
    const { getByDisplayValue } = render(
      <EditProfileScreen {...defaultProps} />,
    );
    expect(getByDisplayValue('Test User')).toBeTruthy();
  });

  it('renders editable email field', () => {
    const { getByDisplayValue } = render(
      <EditProfileScreen {...defaultProps} />,
    );
    expect(getByDisplayValue('test@example.com')).toBeTruthy();
  });

  it('renders save button', () => {
    const { getByText } = render(
      <EditProfileScreen {...defaultProps} />,
    );
    expect(getByText('Save Changes')).toBeTruthy();
  });

  it('calls updateProfile on save', async () => {
    const { getByText, getByDisplayValue } = render(
      <EditProfileScreen {...defaultProps} />,
    );
    fireEvent.changeText(getByDisplayValue('Test User'), 'New Name');
    fireEvent.press(getByText('Save Changes'));
    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalled();
    });
  });
});
