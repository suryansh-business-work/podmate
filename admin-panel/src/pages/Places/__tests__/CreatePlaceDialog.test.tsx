import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor, within } from '@testing-library/react';
import { renderWithProviders } from '../../../test/test-utils';
import { ADMIN_CREATE_PLACE } from '../../../graphql/mutations';
import { gql } from '@apollo/client';
import CreatePlaceDialog from '../CreatePlaceDialog';

const GET_ALL_CITIES = gql`
  query GetCitiesForVenue {
    cities(page: 1, limit: 500) {
      items {
        id
        name
        state
        country
      }
    }
  }
`;

const citiesMock = {
  request: { query: GET_ALL_CITIES },
  result: {
    data: {
      cities: {
        items: [
          { id: 'city-1', name: 'Test City', state: 'Test State', country: 'Test Country' },
        ],
      },
    },
  },
};

const createPlaceMock = {
  request: {
    query: ADMIN_CREATE_PLACE,
    variables: {
      input: {
        name: 'Test Venue',
        description: 'A great test venue',
        address: '123 Test St',
        city: 'Test City',
        category: 'Restaurant',
        phone: undefined,
        email: undefined,
        imageUrl: undefined,
        mediaUrls: [],
      },
      ownerId: 'owner-123',
    },
  },
  result: {
    data: {
      adminCreatePlace: {
        id: 'place-1',
        name: 'Test Venue',
        description: 'A great test venue',
        address: '123 Test St',
        city: 'Test City',
        category: 'Restaurant',
        status: 'PENDING',
        isVerified: false,
        createdAt: '2025-01-01T00:00:00Z',
      },
    },
  },
};

describe('CreatePlaceDialog', () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    onCreated: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const allMocks = [createPlaceMock, citiesMock];

  it('renders dialog title', () => {
    renderWithProviders(<CreatePlaceDialog {...defaultProps} />, { mocks: allMocks });
    expect(screen.getByText('Create Venue')).toBeInTheDocument();
  });

  it('renders stepper with 3 steps', () => {
    renderWithProviders(<CreatePlaceDialog {...defaultProps} />, { mocks: allMocks });
    expect(screen.getByText('Venue Details')).toBeInTheDocument();
    expect(screen.getByText('Media')).toBeInTheDocument();
    expect(screen.getByText('Contact & Owner')).toBeInTheDocument();
  });

  it('renders venue name and description on step 1', () => {
    renderWithProviders(<CreatePlaceDialog {...defaultProps} />, { mocks: allMocks });
    expect(screen.getByLabelText(/venue name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
  });

  it('renders category selector on step 1', () => {
    renderWithProviders(<CreatePlaceDialog {...defaultProps} />, { mocks: allMocks });
    const matches = screen.getAllByText('Category');
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it('renders address and city fields on step 1', () => {
    renderWithProviders(<CreatePlaceDialog {...defaultProps} />, { mocks: allMocks });
    expect(screen.getByLabelText(/address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/city/i)).toBeInTheDocument();
  });

  it('disables Next when required fields empty', () => {
    renderWithProviders(<CreatePlaceDialog {...defaultProps} />, { mocks: allMocks });
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
  });

  async function fillVenueDetails(): Promise<void> {
    fireEvent.change(screen.getByLabelText(/venue name/i), { target: { value: 'Test Venue' } });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'A great test venue' },
    });
    fireEvent.change(screen.getByLabelText(/address/i), { target: { value: '123 Test St' } });

    // Wait for the cities query to resolve so the City dropdown has items
    await waitFor(() => {
      expect(screen.getByLabelText(/city/i)).toBeInTheDocument();
    });

    // MUI TextField select: open dropdown and select the city item
    const citySelect = screen.getByLabelText(/city/i);
    fireEvent.mouseDown(citySelect);
    const listbox = await screen.findByRole('listbox');
    const cityOption = within(listbox).getByText('Test City');
    fireEvent.click(cityOption);
  }

  it('enables Next when venue details filled', async () => {
    renderWithProviders(<CreatePlaceDialog {...defaultProps} />, { mocks: allMocks });
    await fillVenueDetails();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /next/i })).not.toBeDisabled();
    });
  });

  it('navigates to Media step (step 2)', async () => {
    renderWithProviders(<CreatePlaceDialog {...defaultProps} />, { mocks: allMocks });
    await fillVenueDetails();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /next/i })).not.toBeDisabled();
    });
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    await waitFor(() => {
      // Back button only appears on step > 0, confirming navigation to step 2
      expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
    });
  });

  it('calls onClose when Cancel clicked', () => {
    renderWithProviders(<CreatePlaceDialog {...defaultProps} />, { mocks: allMocks });
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('does not render when closed', () => {
    renderWithProviders(<CreatePlaceDialog {...defaultProps} open={false} />, {
      mocks: allMocks,
    });
    expect(screen.queryByText('Create Venue')).not.toBeInTheDocument();
  });

  it('does not show Back button on step 1', () => {
    renderWithProviders(<CreatePlaceDialog {...defaultProps} />, { mocks: [createPlaceMock] });
    expect(screen.queryByRole('button', { name: /back/i })).not.toBeInTheDocument();
  });
});
