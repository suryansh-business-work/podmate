import { fireEvent } from '@testing-library/react-native';
import { setupMocks, renderHomeScreen, defaultProps } from './HomeScreen.setup';

describe('HomeScreen — behavior', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupMocks();
  });

  it('calls onMenuPress when profile icon is pressed', () => {
    const { getByText } = renderHomeScreen();
    fireEvent.press(getByText('person'));
    expect(defaultProps.onMenuPress).toHaveBeenCalled();
  });

  it('calls onNotificationPress when bell icon pressed', () => {
    const { getByText } = renderHomeScreen();
    fireEvent.press(getByText('notifications-none'));
    expect(defaultProps.onNotificationPress).toHaveBeenCalled();
  });

  it('calls onPodPress when event card is pressed', () => {
    const { getByTestId } = renderHomeScreen();
    fireEvent.press(getByTestId('event-Hiking Day'));
    expect(defaultProps.onPodPress).toHaveBeenCalledWith('p1');
  });

  it('selects category when chip pressed', () => {
    const { getByTestId } = renderHomeScreen();
    const socialChip = getByTestId('chip-Social');
    fireEvent.press(socialChip);
    expect(socialChip).toBeTruthy();
  });

  it('toggles search bar when search icon pressed', () => {
    const { getAllByText, queryByPlaceholderText } = renderHomeScreen();
    expect(queryByPlaceholderText(/find hiking|dining|tech/i)).toBeNull();
    const searchIcons = getAllByText('search');
    fireEvent.press(searchIcons[0]);
    expect(queryByPlaceholderText(/find hiking|dining|tech/i)).toBeTruthy();
  });

  it('updates search input when typing', () => {
    const { getAllByText, getByPlaceholderText } = renderHomeScreen();
    fireEvent.press(getAllByText('search')[0]);
    const search = getByPlaceholderText(/find hiking|dining|tech/i);
    fireEvent.changeText(search, 'yoga');
    expect(search.props.value).toBe('yoga');
  });
});
