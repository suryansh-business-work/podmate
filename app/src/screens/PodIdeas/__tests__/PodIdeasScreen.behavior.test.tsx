import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { useQuery, useMutation } from '@apollo/client';
import PodIdeasScreen from '../PodIdeasScreen';

const mockRefetch = jest.fn();
const mockSubmitIdea = jest.fn().mockResolvedValue({
  data: { submitPodIdea: { id: 'newI' } },
});
const mockUpvote = jest.fn().mockResolvedValue({ data: {} });
const mockRemoveUpvote = jest.fn().mockResolvedValue({ data: {} });

const ideaWithUpvote = {
  id: 'i1',
  title: 'Idea',
  description: 'Description text',
  category: 'Social',
  location: 'Delhi',
  budget: '100',
  status: 'PENDING',
  upvotes: 5,
  upvoteCount: 5,
  hasUpvoted: false,
  user: { id: 'u1', name: 'Alice', avatar: null },
  createdAt: new Date().toISOString(),
};

function setupMocks(ideas = [ideaWithUpvote]): void {
  (useQuery as jest.Mock).mockReturnValue({
    data: { podIdeas: { items: ideas, total: ideas.length } },
    loading: false,
    refetch: mockRefetch,
  });
  let mutCall = 0;
  (useMutation as jest.Mock).mockImplementation(() => {
    mutCall++;
    switch ((mutCall - 1) % 3) {
      case 0: return [mockSubmitIdea, { loading: false }];
      case 1: return [mockUpvote];
      case 2: return [mockRemoveUpvote];
      default: return [jest.fn(), { loading: false }];
    }
  });
}

describe('PodIdeasScreen — behavior', () => {
  const defaultProps = { onBack: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('opens submit modal on FAB press', () => {
    setupMocks();
    const { getByText } = render(<PodIdeasScreen {...defaultProps} />);
    fireEvent.press(getByText('add'));
    expect(getByText('Submit Idea')).toBeTruthy();
  });

  it('renders form fields in modal', () => {
    setupMocks();
    const { getByText, getByPlaceholderText } = render(
      <PodIdeasScreen {...defaultProps} />,
    );
    fireEvent.press(getByText('add'));
    expect(getByPlaceholderText(/title/i)).toBeTruthy();
    expect(getByPlaceholderText(/describe/i)).toBeTruthy();
  });

  it('upvotes an idea', async () => {
    setupMocks();
    const { getByText } = render(<PodIdeasScreen {...defaultProps} />);
    const upvoteBtn = getByText('5');
    fireEvent.press(upvoteBtn);
    await waitFor(() => {
      expect(mockUpvote).toHaveBeenCalledWith({
        variables: { id: 'i1' },
      });
    });
  });

  it('removes upvote from already upvoted idea', async () => {
    setupMocks([{ ...ideaWithUpvote, hasUpvoted: true }]);
    const { getByText } = render(<PodIdeasScreen {...defaultProps} />);
    const upvoteBtn = getByText('5');
    fireEvent.press(upvoteBtn);
    await waitFor(() => {
      expect(mockRemoveUpvote).toHaveBeenCalledWith({
        variables: { id: 'i1' },
      });
    });
  });
});
