import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../../test/test-utils';
import { CREATE_POD } from '../../../graphql/mutations';
import CreatePodDialog from '../CreatePodDialog';

const createPodMock = {
  request: {
    query: CREATE_POD,
    variables: {
      input: {
        title: 'Test Pod',
        description: 'A test pod description',
        category: 'Social',
        imageUrl: undefined,
        mediaUrls: [],
        feePerPerson: 100,
        maxSeats: 10,
        dateTime: expect.any(String),
        location: 'Test Location',
        locationDetail: undefined,
      },
    },
  },
  result: {
    data: {
      createPod: {
        id: 'pod-1',
        title: 'Test Pod',
        description: 'A test pod description',
        category: 'Social',
        feePerPerson: 100,
        maxSeats: 10,
        dateTime: '2025-01-01T00:00:00Z',
        location: 'Test Location',
        locationDetail: '',
        status: 'NEW',
        createdAt: '2025-01-01T00:00:00Z',
      },
    },
  },
};

describe('CreatePodDialog', () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    onCreated: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dialog title', () => {
    renderWithProviders(<CreatePodDialog {...defaultProps} />, { mocks: [createPodMock] });
    expect(screen.getByText('Create Pod')).toBeInTheDocument();
  });

  it('renders stepper with 3 steps', () => {
    renderWithProviders(<CreatePodDialog {...defaultProps} />, { mocks: [createPodMock] });
    expect(screen.getByText('Basic Info')).toBeInTheDocument();
    expect(screen.getByText('Media')).toBeInTheDocument();
    expect(screen.getByText('Logistics')).toBeInTheDocument();
  });

  it('starts on first step with basic info fields', () => {
    renderWithProviders(<CreatePodDialog {...defaultProps} />, { mocks: [createPodMock] });
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
  });

  it('disables Next when title is empty', () => {
    renderWithProviders(<CreatePodDialog {...defaultProps} />, { mocks: [createPodMock] });
    const nextButton = screen.getByRole('button', { name: /next/i });
    expect(nextButton).toBeDisabled();
  });

  it('enables Next when basic info is filled', async () => {
    renderWithProviders(<CreatePodDialog {...defaultProps} />, { mocks: [createPodMock] });
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Test Pod' } });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'A test pod description' },
    });
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /next/i })).not.toBeDisabled();
    });
  });

  it('shows Cancel button', () => {
    renderWithProviders(<CreatePodDialog {...defaultProps} />, { mocks: [createPodMock] });
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('calls onClose when Cancel clicked', () => {
    renderWithProviders(<CreatePodDialog {...defaultProps} />, { mocks: [createPodMock] });
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('does not show Back button on step 1', () => {
    renderWithProviders(<CreatePodDialog {...defaultProps} />, { mocks: [createPodMock] });
    expect(screen.queryByRole('button', { name: /back/i })).not.toBeInTheDocument();
  });

  it('navigates to second step (Media)', async () => {
    renderWithProviders(<CreatePodDialog {...defaultProps} />, { mocks: [createPodMock] });
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Test Pod' } });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'A test pod description' },
    });
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /next/i })).not.toBeDisabled();
    });
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    await waitFor(() => {
      expect(screen.getByText(/upload/i)).toBeInTheDocument();
    });
  });

  it('shows Back button on step 2', async () => {
    renderWithProviders(<CreatePodDialog {...defaultProps} />, { mocks: [createPodMock] });
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Test Pod' } });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'A test pod description' },
    });
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /next/i })).not.toBeDisabled();
    });
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
    });
  });

  it('does not render when open is false', () => {
    renderWithProviders(<CreatePodDialog {...defaultProps} open={false} />, {
      mocks: [createPodMock],
    });
    expect(screen.queryByText('Create Pod')).not.toBeInTheDocument();
  });
});
