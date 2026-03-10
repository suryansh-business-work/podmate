/* eslint-disable @typescript-eslint/no-require-imports */
import React from 'react';
import { render } from '@testing-library/react-native';
import { useQuery, useMutation } from '@apollo/client';
import ReviewsScreen from '../ReviewsScreen';

jest.mock('../ReviewCard', () => {
  const mockReact = require('react');
  const { Text, TouchableOpacity, View } = require('react-native');
  return {
    ReviewCard: ({
      review,
      onReply,
      onReport,
    }: {
      review: { id: string; comment: string; rating: number };
      onReply: (id: string) => void;
      onReport: (id: string) => void;
    }) =>
      mockReact.createElement(
        View,
        { testID: `review-${review.id}` },
        mockReact.createElement(Text, null, review.comment),
        mockReact.createElement(Text, null, `${review.rating} stars`),
        mockReact.createElement(
          TouchableOpacity,
          { onPress: () => onReply(review.id), testID: `reply-${review.id}` },
          mockReact.createElement(Text, null, 'Reply'),
        ),
        mockReact.createElement(
          TouchableOpacity,
          { onPress: () => onReport(review.id), testID: `report-${review.id}` },
          mockReact.createElement(Text, null, 'Report'),
        ),
      ),
    Stars: ({ rating }: { rating: number }) => {
      const mr = require('react');
      return mr.createElement(require('react-native').Text, { testID: 'stars' }, `${rating} stars`);
    },
  };
});

export const mockReviews = [
  {
    id: 'r1',
    rating: 5,
    comment: 'Amazing event!',
    user: { id: 'u1', name: 'Alice', avatar: null },
    reply: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'r2',
    rating: 3,
    comment: 'It was okay',
    user: { id: 'u2', name: 'Bob', avatar: null },
    reply: { text: 'Thanks!', createdAt: new Date().toISOString() },
    createdAt: new Date().toISOString(),
  },
];

export const mockStats = {
  averageRating: 4.0,
  totalReviews: 2,
  distribution: [0, 0, 1, 0, 1],
};

export const mockRefetch = jest.fn();
export const mockRefetchStats = jest.fn();
export const mockCreateReview = jest.fn().mockResolvedValue({
  data: { createReview: { id: 'r3' } },
});
export const mockReplyToReview = jest.fn().mockResolvedValue({ data: {} });
export const mockReportReview = jest.fn().mockResolvedValue({ data: {} });

export const defaultProps = {
  targetType: 'POD' as const,
  targetId: 'pod1',
  targetTitle: 'Test Pod',
  onBack: jest.fn(),
};

export function setupMocks(): void {
  (useQuery as jest.Mock).mockReturnValue({
    data: {
      reviews: { items: mockReviews, total: 2 },
      reviewStats: mockStats,
    },
    loading: false,
    refetch: mockRefetch,
  });
  let mutCall = 0;
  (useMutation as jest.Mock).mockImplementation(() => {
    mutCall++;
    switch ((mutCall - 1) % 3) {
      case 0:
        return [mockCreateReview, { loading: false }];
      case 1:
        return [mockReplyToReview, { loading: false }];
      case 2:
        return [mockReportReview, { loading: false }];
      default:
        return [jest.fn(), { loading: false }];
    }
  });
}

export function renderReviewsScreen(props: Partial<typeof defaultProps> = {}) {
  return render(<ReviewsScreen {...defaultProps} {...props} />);
}
