import { useQuery, useMutation } from '@apollo/client';
import { setupMocks, renderPodDetail, defaultProps, mockRefetch } from './PodDetailScreen.setup';

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
    const { getAllByText } = renderPodDetail();
    expect(getAllByText(/₹1,?500/).length).toBeGreaterThanOrEqual(1);
  });

  it('renders rating and review count', () => {
    const { getAllByText } = renderPodDetail();
    expect(getAllByText(/4\.5/).length).toBeGreaterThanOrEqual(1);
    expect(getAllByText(/12/).length).toBeGreaterThanOrEqual(1);
  });

  /** PodDetailScreen calls useQuery 3 times (GET_POD, GET_ME, GET_APP_CONFIG).
   *  Cycle: 0 → GET_POD, 1 → GET_ME, 2 → GET_APP_CONFIG. */
  function overrideQuery(
    podResult: Record<string, unknown>,
    meResult: Record<string, unknown>,
    configResult: Record<string, unknown>,
  ) {
    let qCall = 0;
    const results = [podResult, meResult, configResult];
    (useQuery as jest.Mock).mockReset().mockImplementation(() => {
      const idx = qCall++;
      return results[idx % 3];
    });
  }

  it('shows skeleton during loading', () => {
    overrideQuery(
      { data: null, loading: true, error: null, refetch: mockRefetch },
      { data: null },
      { data: null },
    );
    (useMutation as jest.Mock).mockReset().mockReturnValue([jest.fn(), { loading: false }]);
    const { getByTestId } = renderPodDetail();
    expect(getByTestId('skeleton-detail')).toBeTruthy();
  });

  it('shows error state', () => {
    overrideQuery(
      { data: null, loading: false, error: new Error('Not found'), refetch: mockRefetch },
      { data: null },
      { data: null },
    );
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
    expect(getByText(/Attendees/i)).toBeTruthy();
  });

  it('renders Join Pod button for non-host', () => {
    const { getByText } = renderPodDetail();
    expect(getByText(/Join Pod/)).toBeTruthy();
  });
});
