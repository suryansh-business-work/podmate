import { fireEvent } from '@testing-library/react-native';
import {
  setupMocks,
  renderHomeScreen,
  defaultProps,
} from './HomeScreen.setup';

describe('HomeScreen — behavior', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupMocks();
  });

  it('calls onMenuPress when menu icon is pressed', () => {
    const { getByText } = renderHomeScreen();
    fireEvent.press(getByText('menu'));
    expect(defaultProps.onMenuPress).toHaveBeenCalled();
  });

  it('calls onNotificationPress when bell icon pressed', () => {
    const { getByText } = renderHomeScreen();
    fireEvent.press(getByText('notifications-none'));
    expect(defaultProps.onNotificationPress).toHaveBeenCalled();
  });

  it('calls onChatbotPress when chatbot icon pressed', () => {
    const { getByText } = renderHomeScreen();
    fireEvent.press(getByText('FontAwesomeIcon'));
    expect(defaultProps.onChatbotPress).toHaveBeenCalled();
  });

  it('calls onPodPress when event card is pressed', () => {
    const { getByTestId } = renderHomeScreen();
    fireEvent.press(getByTestId('event-Hiking Day'));
    expect(defaultProps.onPodPress).toHaveBeenCalledWith('p1');
  });

  it('filters by category when chip pressed', () => {
    const { getByTestId, getByText } = renderHomeScreen();
    const socialChip = getByTestId('chip-Social');
    fireEvent.press(socialChip);
    expect(getByText('Social')).toBeTruthy();
  });

  it('opens location modal on location press', () => {
    const { getByText } = renderHomeScreen();
    fireEvent.press(getByText('my-location'));
    expect(getByText('Set Your Location')).toBeTruthy();
  });

  it('renders GPS and pincode options in location modal', () => {
    const { getByText } = renderHomeScreen();
    fireEvent.press(getByText('my-location'));
    expect(getByText('Use GPS Location')).toBeTruthy();
    expect(getByText(/Search by Pincode/i)).toBeTruthy();
  });

  it('updates search input', () => {
    const { getByPlaceholderText } = renderHomeScreen();
    const search = getByPlaceholderText(/find hiking|dining|tech/i);
    fireEvent.changeText(search, 'yoga');
    expect(search.props.value).toBe('yoga');
  });
});
