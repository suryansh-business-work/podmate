import { useQuery } from '@apollo/client';
import {
  setupMocks,
  renderHomeScreen,
  defaultProps,
  mockRefetch,
  mockFetchMore,
} from './HomeScreen.setup';

describe('HomeScreen — rendering', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupMocks();
  });

  it('renders PartyWings brand title', () => {
    const { getByText } = renderHomeScreen();
    expect(getByText('PartyWings')).toBeTruthy();
  });

  it('renders search input', () => {
    const { getByPlaceholderText } = renderHomeScreen();
    expect(
      getByPlaceholderText(/find hiking|dining|tech/i),
    ).toBeTruthy();
  });

  it('renders Popular near you section', () => {
    const { getByText } = renderHomeScreen();
    expect(getByText(/Popular near you/i)).toBeTruthy();
  });

  it('renders pod cards', () => {
    const { getByText } = renderHomeScreen();
    expect(getByText('Hiking Day')).toBeTruthy();
  });

  /** HomeScreen calls useQuery 2 times (GET_ME, GET_PODS).
   *  Cycle: even → GET_ME, odd → GET_PODS. */
  function overrideQuery(
    meResult: Record<string, unknown>,
    podsResult: Record<string, unknown>,
  ) {
    let qCall = 0;
    (useQuery as jest.Mock).mockReset().mockImplementation(() => {
      const idx = qCall++;
      return idx % 2 === 0 ? meResult : podsResult;
    });
  }

  it('shows skeleton loading state', () => {
    overrideQuery(
      { data: null },
      { data: null, loading: true, error: null, refetch: mockRefetch, fetchMore: mockFetchMore },
    );
    const { getByTestId } = renderHomeScreen();
    expect(getByTestId('skeleton-feed')).toBeTruthy();
  });

  it('shows error state', () => {
    overrideQuery(
      { data: null },
      {
        data: null, loading: false,
        error: new Error('Network error'),
        refetch: mockRefetch, fetchMore: mockFetchMore,
      },
    );
    const { getByText } = renderHomeScreen();
    expect(getByText('Something went wrong')).toBeTruthy();
  });

  it('shows empty state when no pods', () => {
    overrideQuery(
      { data: null },
      {
        data: { pods: { items: [], total: 0, page: 1, totalPages: 1 } },
        loading: false, error: null,
        refetch: mockRefetch, fetchMore: mockFetchMore,
      },
    );
    const { getByText } = renderHomeScreen();
    expect(getByText('No pods found')).toBeTruthy();
  });

  it('renders notification bell icon', () => {
    const { getByText } = renderHomeScreen();
    expect(getByText('notifications-none')).toBeTruthy();
  });

  it('renders chatbot icon', () => {
    const { getByText } = renderHomeScreen();
    expect(getByText('FontAwesomeIcon')).toBeTruthy();
  });
});
