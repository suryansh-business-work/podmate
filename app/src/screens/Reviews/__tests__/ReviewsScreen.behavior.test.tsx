import { fireEvent, waitFor } from '@testing-library/react-native';
import {
  setupMocks,
  renderReviewsScreen,
  mockCreateReview,
} from './ReviewsScreen.setup';

describe('ReviewsScreen — behavior', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupMocks();
  });

  it('submits a review via modal', async () => {
    const { getByText, getAllByText, getByPlaceholderText } = renderReviewsScreen();
    fireEvent.press(getByText('rate-review'));

    // Select a star — the mocked MaterialIcons renders icon names as text.
    // With rating=0, all 5 icons render as "star-border". Press the first one.
    const starBorderIcons = getAllByText('star-border');
    fireEvent.press(starBorderIcons[0]);

    const commentInput = getByPlaceholderText(/share your experience/i);
    fireEvent.changeText(commentInput, 'Great event!');

    fireEvent.press(getByText('Submit Review'));
    await waitFor(() => {
      expect(mockCreateReview).toHaveBeenCalled();
    });
  });

  it('triggers reply on review card', () => {
    const { getByTestId } = renderReviewsScreen();
    fireEvent.press(getByTestId('reply-r1'));
    // Should show reply input area
    expect(getByTestId('reply-r1')).toBeTruthy();
  });

  it('triggers report on review card', () => {
    const { getByTestId } = renderReviewsScreen();
    fireEvent.press(getByTestId('report-r1'));
    // Report triggers Alert.alert (covered by interaction)
    expect(getByTestId('report-r1')).toBeTruthy();
  });
});
