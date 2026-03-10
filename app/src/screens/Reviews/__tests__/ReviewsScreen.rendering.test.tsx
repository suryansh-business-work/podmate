import { fireEvent } from '@testing-library/react-native';
import {
  setupMocks,
  renderReviewsScreen,
  defaultProps,
  mockRefetch,
  mockRefetchStats,
} from './ReviewsScreen.setup';
import { useQuery, useMutation } from '@apollo/client';

describe('ReviewsScreen — rendering', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupMocks();
  });

  it('renders header with target title', () => {
    const { getByText } = renderReviewsScreen();
    expect(getByText(/Test Pod/)).toBeTruthy();
  });

  it('calls onBack when back pressed', () => {
    const { getByText } = renderReviewsScreen();
    fireEvent.press(getByText('arrow-back'));
    expect(defaultProps.onBack).toHaveBeenCalled();
  });

  it('renders review stats', () => {
    const { getByTestId } = renderReviewsScreen();
    expect(getByTestId('stars')).toBeTruthy();
  });

  it('renders review cards', () => {
    const { getByText } = renderReviewsScreen();
    expect(getByText('Amazing event!')).toBeTruthy();
    expect(getByText('It was okay')).toBeTruthy();
  });

  it('shows empty state when no reviews', () => {
    (useQuery as jest.Mock).mockReset().mockReturnValue({
      data: {
        reviews: { items: [], total: 0 },
        reviewStats: { averageRating: 0, totalReviews: 0, distribution: [0, 0, 0, 0, 0] },
      },
      loading: false,
      refetch: mockRefetch,
    });
    let mutCall = 0;
    (useMutation as jest.Mock).mockReset().mockImplementation(() => {
      mutCall++;
      return [jest.fn(), { loading: false }];
    });
    const { getByText } = renderReviewsScreen();
    expect(getByText('No reviews yet')).toBeTruthy();
  });

  it('renders FAB button for adding review', () => {
    const { getByText } = renderReviewsScreen();
    expect(getByText('rate-review')).toBeTruthy();
  });

  it('opens review modal on FAB press', () => {
    const { getByText } = renderReviewsScreen();
    fireEvent.press(getByText('rate-review'));
    expect(getByText('Submit Review')).toBeTruthy();
  });
});
