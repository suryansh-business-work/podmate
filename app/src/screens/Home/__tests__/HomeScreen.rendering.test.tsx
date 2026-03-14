import { setupMocks, renderHomeScreen, mockRefetch, mockFetchMore } from './HomeScreen.setup';
import { GET_ME, GET_PODS } from '../../../graphql/queries';

describe('HomeScreen — rendering', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupMocks();
  });

  it('renders city name from location', () => {
    const { getByText } = renderHomeScreen();
    expect(getByText('Delhi')).toBeTruthy();
  });

  it('renders category chips from server data', () => {
    const { getByTestId } = renderHomeScreen();
    expect(getByTestId('chip-All')).toBeTruthy();
    expect(getByTestId('chip-Social')).toBeTruthy();
    expect(getByTestId('chip-Learning')).toBeTruthy();
  });

  it('renders All Pods section', () => {
    const { getByText } = renderHomeScreen();
    expect(getByText('All Pods')).toBeTruthy();
  });

  it('renders pod cards', () => {
    const { getAllByText } = renderHomeScreen();
    expect(getAllByText('Hiking Day').length).toBeGreaterThanOrEqual(1);
  });

  it('shows skeleton loading state when pods loading', () => {
    setupMocks({
      GET_ME: {
        data: { me: { id: 'u1', name: 'User', avatar: null } },
        loading: false,
        error: null,
      },
      GET_PODS: {
        data: null,
        loading: true,
        error: null,
        refetch: mockRefetch,
        fetchMore: mockFetchMore,
      },
    });
    const { getByTestId } = renderHomeScreen();
    expect(getByTestId('skeleton-feed')).toBeTruthy();
  });

  it('shows error state', () => {
    setupMocks({
      GET_PODS: {
        data: null,
        loading: false,
        error: new Error('Network error'),
        refetch: mockRefetch,
        fetchMore: mockFetchMore,
      },
    });
    const { getByText } = renderHomeScreen();
    expect(getByText('Something went wrong')).toBeTruthy();
  });

  it('shows empty state when no pods', () => {
    setupMocks({
      GET_PODS: {
        data: { pods: { items: [], total: 0, page: 1, totalPages: 1 } },
        loading: false,
        error: null,
        refetch: mockRefetch,
        fetchMore: mockFetchMore,
      },
    });
    const { getByText } = renderHomeScreen();
    expect(getByText('No pods found')).toBeTruthy();
  });

  it('renders notification bell icon', () => {
    const { getByText } = renderHomeScreen();
    expect(getByText('notifications-none')).toBeTruthy();
  });

  it('renders search icon in header', () => {
    const { getAllByText } = renderHomeScreen();
    expect(getAllByText('search').length).toBeGreaterThanOrEqual(1);
  });
});
