import { useQuery, useMutation } from '@apollo/client';
import {
  setupMocks,
  renderPodDetail,
  defaultProps,
  mockRefetch,
} from './PodDetailScreen.setup';

describe('PodDetailScreen — rendering', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupMocks();
  });

  it('renders pod title', () => {
    const { getByText } = renderPodDetail();
    expect(getByText('Weekend Hike')).toBeTruthy();
  });

  it('renders host name', () => {
    const { getByText } = renderPodDetail();
    expect(getByText('Adventure Guide')).toBeTruthy();
  });

  it('renders pod description', () => {
    const { getByText } = renderPodDetail();
    expect(getByText(/A fun mountain hike/)).toBeTruthy();
  });

  it('renders pod location', () => {
    const { getByText } = renderPodDetail();
    expect(getByText(/Himalayas/i)).toBeTruthy();
  });

  it('renders pod fee with currency', () => {
    const { getByText } = renderPodDetail();
    expect(getByText(/₹1,?500/)).toBeTruthy();
  });

  it('renders rating and review count', () => {
    const { getByText } = renderPodDetail();
    expect(getByText(/4\.5/)).toBeTruthy();
    expect(getByText(/12/)).toBeTruthy();
  });

  it('shows skeleton during loading', () => {
    (useQuery as jest.Mock).mockReset()
      .mockReturnValueOnce({
        data: null,
        loading: true,
        error: null,
        refetch: mockRefetch,
      })
      .mockReturnValueOnce({ data: null })
      .mockReturnValueOnce({ data: null });
    (useMutation as jest.Mock).mockReset().mockReturnValue([jest.fn(), { loading: false }]);
    const { getByTestId } = renderPodDetail();
    expect(getByTestId('skeleton-detail')).toBeTruthy();
  });

  it('shows error state', () => {
    (useQuery as jest.Mock).mockReset()
      .mockReturnValueOnce({
        data: null,
        loading: false,
        error: new Error('Not found'),
        refetch: mockRefetch,
      })
      .mockReturnValueOnce({ data: null })
      .mockReturnValueOnce({ data: null });
    (useMutation as jest.Mock).mockReset().mockReturnValue([jest.fn(), { loading: false }]);
    const { getByText } = renderPodDetail();
    expect(getByText('Failed to load pod')).toBeTruthy();
  });

  it('renders The Plan section', () => {
    const { getByText } = renderPodDetail();
    expect(getByText('The Plan')).toBeTruthy();
  });

  it('renders attendees section', () => {
    const { getByText } = renderPodDetail();
    expect(getByText(/attending/i)).toBeTruthy();
  });

  it('renders Join Pod button for non-host', () => {
    const { getByText } = renderPodDetail();
    expect(getByText(/Join Pod/)).toBeTruthy();
  });
});
