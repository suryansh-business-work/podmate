import { fireEvent } from '@testing-library/react-native';
import { setupMocks, renderPodDetail, defaultProps } from './PodDetailScreen.setup';

describe('PodDetailScreen — behavior', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls onBack from back button', () => {
    setupMocks();
    const { getByText } = renderPodDetail();
    fireEvent.press(getByText('arrow-back'));
    expect(defaultProps.onBack).toHaveBeenCalled();
  });

  it('calls onReviews when reviews section tapped', () => {
    setupMocks();
    const { getByText } = renderPodDetail();
    fireEvent.press(getByText(/Reviews & Ratings/i));
    expect(defaultProps.onReviews).toHaveBeenCalled();
  });

  it('calls onCheckout when Join Pod pressed', () => {
    setupMocks();
    const { getByText } = renderPodDetail();
    fireEvent.press(getByText(/Join Pod/));
    expect(defaultProps.onCheckout).toHaveBeenCalledWith('pod1');
  });

  it('shows Go Live button for host', () => {
    setupMocks({ isHost: true });
    const { getByText } = renderPodDetail();
    expect(getByText(/Go Live/i)).toBeTruthy();
  });

  it('calls onGoLive when Go Live pressed (host)', () => {
    setupMocks({ isHost: true });
    const { getByText } = renderPodDetail();
    fireEvent.press(getByText(/Go Live/i));
    expect(defaultProps.onGoLive).toHaveBeenCalled();
  });

  it('shows Delete Pod button for host', () => {
    setupMocks({ isHost: true });
    const { getByText } = renderPodDetail();
    expect(getByText(/Delete Pod/i)).toBeTruthy();
  });

  it('shows View Host Profile for non-host', () => {
    setupMocks();
    const { getByText } = renderPodDetail();
    const viewHost = getByText(/View.*Profile/i);
    expect(viewHost).toBeTruthy();
  });

  it('calls onUserProfile on host profile press', () => {
    setupMocks();
    const { getByText } = renderPodDetail();
    fireEvent.press(getByText(/View.*Profile/i));
    expect(defaultProps.onUserProfile).toHaveBeenCalledWith('host1');
  });

  it('renders share button', () => {
    setupMocks();
    const { getByText } = renderPodDetail();
    expect(getByText('share')).toBeTruthy();
  });
});
