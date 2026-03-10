import React from 'react';
import { ActivityIndicator } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { useQuery, useMutation } from '@apollo/client';
import PodIdeasScreen from '../PodIdeasScreen';

const mockIdeas = [
  {
    id: 'i1',
    title: 'Beach Cleanup',
    description: 'Lets clean the beach together',
    category: 'Social',
    location: 'Goa',
    budget: '500',
    status: 'PENDING',
    upvotes: 3,
    hasUpvoted: false,
    user: { id: 'u1', name: 'Alice', avatar: null },
    createdAt: new Date().toISOString(),
  },
  {
    id: 'i2',
    title: 'Coding Bootcamp',
    description: 'Weekend coding workshop',
    category: 'Tech',
    location: 'Delhi',
    budget: '0',
    status: 'APPROVED',
    upvotes: 10,
    hasUpvoted: true,
    user: { id: 'u2', name: 'Bob', avatar: null },
    createdAt: new Date().toISOString(),
  },
];

const mockRefetch = jest.fn();
const mockSubmitIdea = jest.fn().mockResolvedValue({
  data: { submitPodIdea: { id: 'i3' } },
});
const mockUpvote = jest.fn().mockResolvedValue({ data: {} });
const mockRemoveUpvote = jest.fn().mockResolvedValue({ data: {} });

describe('PodIdeasScreen — rendering', () => {
  const defaultProps = { onBack: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    (useQuery as jest.Mock).mockReturnValue({
      data: { podIdeas: { items: mockIdeas, total: 2 } },
      loading: false,
      refetch: mockRefetch,
    });
    let mutCall = 0;
    (useMutation as jest.Mock).mockImplementation(() => {
      mutCall++;
      switch ((mutCall - 1) % 3) {
        case 0:
          return [mockSubmitIdea, { loading: false }];
        case 1:
          return [mockUpvote];
        case 2:
          return [mockRemoveUpvote];
        default:
          return [jest.fn(), { loading: false }];
      }
    });
  });

  it('renders header title', () => {
    const { getByText } = render(<PodIdeasScreen {...defaultProps} />);
    expect(getByText('Pod Ideas')).toBeTruthy();
  });

  it('calls onBack when back pressed', () => {
    const { getByText } = render(<PodIdeasScreen {...defaultProps} />);
    fireEvent.press(getByText('arrow-back'));
    expect(defaultProps.onBack).toHaveBeenCalled();
  });

  it('renders idea cards', () => {
    const { getByText } = render(<PodIdeasScreen {...defaultProps} />);
    expect(getByText('Beach Cleanup')).toBeTruthy();
    expect(getByText('Coding Bootcamp')).toBeTruthy();
  });

  it('renders status badges', () => {
    const { getByText } = render(<PodIdeasScreen {...defaultProps} />);
    expect(getByText('PENDING')).toBeTruthy();
    expect(getByText('APPROVED')).toBeTruthy();
  });

  it('shows loading indicator', () => {
    (useQuery as jest.Mock).mockReturnValue({
      data: null,
      loading: true,
      refetch: mockRefetch,
    });
    let mutCall = 0;
    (useMutation as jest.Mock).mockReset().mockImplementation(() => {
      mutCall++;
      switch ((mutCall - 1) % 3) {
        case 0:
          return [mockSubmitIdea, { loading: false }];
        case 1:
          return [mockUpvote];
        case 2:
          return [mockRemoveUpvote];
        default:
          return [jest.fn(), { loading: false }];
      }
    });
    const { UNSAFE_getByType } = render(<PodIdeasScreen {...defaultProps} />);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
    expect(UNSAFE_getByType(ActivityIndicator as any)).toBeTruthy();
  });

  it('shows empty state when no ideas', () => {
    (useQuery as jest.Mock).mockReturnValue({
      data: { podIdeas: { items: [], total: 0 } },
      loading: false,
      refetch: mockRefetch,
    });
    let mutCall = 0;
    (useMutation as jest.Mock).mockReset().mockImplementation(() => {
      mutCall++;
      switch ((mutCall - 1) % 3) {
        case 0:
          return [mockSubmitIdea, { loading: false }];
        case 1:
          return [mockUpvote];
        case 2:
          return [mockRemoveUpvote];
        default:
          return [jest.fn(), { loading: false }];
      }
    });
    const { getByText } = render(<PodIdeasScreen {...defaultProps} />);
    expect(getByText('No ideas yet')).toBeTruthy();
  });
});
