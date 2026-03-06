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
    expect(getByText('Test Pod')).toBeTruthy();
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
    (useQuery as jest.Mock).mockReset()
      .mockReturnValueOnce({
        data: { reviews: { items: [], total: 0 } },
        loading: false,
        refetch: mockRefetch,
      })
      .mockReturnValueOnce({
        data: { reviewStats: { average: 0, total: 0, distribution: {} } },
        refetch: mockRefetchStats,
      });
    (useMutation as jest.Mock).mockReset()
      .mockReturnValueOnce([jest.fn(), { loading: false }])
      .mockReturnValueOnce([jest.fn(), { loading: false }])
      .mockReturnValueOnce([jest.fn()]);
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
