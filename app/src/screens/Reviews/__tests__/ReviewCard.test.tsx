import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ReviewCard, Stars } from '../ReviewCard';
import type { Review } from '../Reviews.types';

const makeReview = (overrides: Partial<Review> = {}): Review => ({
  id: 'r1',
  targetType: 'POD',
  targetId: 'pod1',
  rating: 4,
  comment: 'Great experience!',
  parentId: '',
  isReported: false,
  createdAt: '2025-01-15T10:00:00Z',
  user: { id: 'u1', name: 'Alice', avatar: 'https://img.com/alice.jpg' },
  replies: [],
  ...overrides,
});

describe('Stars', () => {
  it('renders 5 star icons', () => {
    const { getAllByText } = render(<Stars rating={3} />);
    const filled = getAllByText('star');
    const empty = getAllByText('star-border');
    expect(filled.length).toBe(3);
    expect(empty.length).toBe(2);
  });

  it('renders all filled stars for rating 5', () => {
    const { getAllByText, queryAllByText } = render(<Stars rating={5} />);
    expect(getAllByText('star').length).toBe(5);
    expect(queryAllByText('star-border').length).toBe(0);
  });

  it('renders all empty stars for rating 0', () => {
    const { getAllByText, queryAllByText } = render(<Stars rating={0} />);
    expect(getAllByText('star-border').length).toBe(5);
    expect(queryAllByText('star').length).toBe(0);
  });
});

describe('ReviewCard', () => {
  const onReply = jest.fn();
  const onReport = jest.fn();

  beforeEach(() => jest.clearAllMocks());

  it('renders user name', () => {
    const { getByText } = render(
      <ReviewCard review={makeReview()} onReply={onReply} onReport={onReport} />,
    );
    expect(getByText('Alice')).toBeTruthy();
  });

  it('renders comment text', () => {
    const { getByText } = render(
      <ReviewCard review={makeReview()} onReply={onReply} onReport={onReport} />,
    );
    expect(getByText('Great experience!')).toBeTruthy();
  });

  it('renders date string', () => {
    const review = makeReview();
    const expected = new Date(review.createdAt).toLocaleDateString();
    const { getByText } = render(
      <ReviewCard review={review} onReply={onReply} onReport={onReport} />,
    );
    expect(getByText(expected)).toBeTruthy();
  });

  it('shows avatar image when user has avatar', () => {
    const { queryByText } = render(
      <ReviewCard review={makeReview()} onReply={onReply} onReport={onReport} />,
    );
    // Avatar placeholder icon should NOT be present
    expect(queryByText('person')).toBeNull();
  });

  it('shows avatar placeholder when no avatar', () => {
    const review = makeReview({ user: { id: 'u2', name: 'Bob', avatar: '' } });
    const { getByText } = render(
      <ReviewCard review={review} onReply={onReply} onReport={onReport} />,
    );
    expect(getByText('person')).toBeTruthy();
  });

  it('calls onReply with review id', () => {
    const { getByText } = render(
      <ReviewCard review={makeReview()} onReply={onReply} onReport={onReport} />,
    );
    fireEvent.press(getByText('Reply'));
    expect(onReply).toHaveBeenCalledWith('r1');
  });

  it('shows Report button when not reported', () => {
    const { getByText } = render(
      <ReviewCard review={makeReview()} onReply={onReply} onReport={onReport} />,
    );
    expect(getByText('Report')).toBeTruthy();
  });

  it('calls onReport with review id', () => {
    const { getByText } = render(
      <ReviewCard review={makeReview()} onReply={onReply} onReport={onReport} />,
    );
    fireEvent.press(getByText('Report'));
    expect(onReport).toHaveBeenCalledWith('r1');
  });

  it('hides Report button when already reported', () => {
    const review = makeReview({ isReported: true });
    const { queryByText } = render(
      <ReviewCard review={review} onReply={onReply} onReport={onReport} />,
    );
    expect(queryByText('Report')).toBeNull();
  });

  it('renders replies when present', () => {
    const review = makeReview({
      replies: [
        { id: 'rp1', comment: 'Thanks!', createdAt: '2025-01-16T10:00:00Z', user: { id: 'u3', name: 'Charlie', avatar: '' } },
      ],
    });
    const { getByText } = render(
      <ReviewCard review={review} onReply={onReply} onReport={onReport} />,
    );
    expect(getByText('Thanks!')).toBeTruthy();
    expect(getByText('Charlie')).toBeTruthy();
  });

  it('renders no replies section when empty', () => {
    const { queryByText } = render(
      <ReviewCard review={makeReview()} onReply={onReply} onReport={onReport} />,
    );
    expect(queryByText('Thanks!')).toBeNull();
  });
});
