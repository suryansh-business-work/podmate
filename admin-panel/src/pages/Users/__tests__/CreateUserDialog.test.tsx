import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../../test/test-utils';
import { ADMIN_CREATE_USER } from '../../../graphql/mutations';
import CreateUserDialog from '../CreateUserDialog';

const createUserMock = {
  request: {
    query: ADMIN_CREATE_USER,
    variables: {
      phone: '+919876543210',
      name: 'Test User',
      role: 'USER',
    },
  },
  result: {
    data: {
      adminCreateUser: {
        id: 'user-1',
        phone: '+919876543210',
        name: 'Test User',
        role: 'USER',
        createdAt: '2025-01-01T00:00:00Z',
      },
    },
  },
};

describe('CreateUserDialog', () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    onCreated: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dialog title', () => {
    renderWithProviders(<CreateUserDialog {...defaultProps} />, { mocks: [createUserMock] });
    expect(screen.getByText('Create User')).toBeInTheDocument();
  });

  it('renders stepper with 2 steps', () => {
    renderWithProviders(<CreateUserDialog {...defaultProps} />, { mocks: [createUserMock] });
    expect(screen.getByText('Account Info')).toBeInTheDocument();
    expect(screen.getByText('Profile Details')).toBeInTheDocument();
  });

  it('renders phone and name fields on step 1', () => {
    renderWithProviders(<CreateUserDialog {...defaultProps} />, { mocks: [createUserMock] });
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
  });

  it('renders role selector', () => {
    renderWithProviders(<CreateUserDialog {...defaultProps} />, { mocks: [createUserMock] });
    // MUI Select renders label in both InputLabel and internal span
    const matches = screen.getAllByText('Roles');
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it('disables Next when fields are empty', () => {
    renderWithProviders(<CreateUserDialog {...defaultProps} />, { mocks: [createUserMock] });
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
  });

  it('enables Next when phone and name filled', async () => {
    renderWithProviders(<CreateUserDialog {...defaultProps} />, { mocks: [createUserMock] });
    fireEvent.change(screen.getByLabelText(/phone/i), {
      target: { value: '+919876543210' },
    });
    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: 'Test User' },
    });
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /next/i })).not.toBeDisabled();
    });
  });

  it('moves to step 2 on Next click', async () => {
    renderWithProviders(<CreateUserDialog {...defaultProps} />, { mocks: [createUserMock] });
    fireEvent.change(screen.getByLabelText(/phone/i), {
      target: { value: '+919876543210' },
    });
    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: 'Test User' },
    });
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /next/i })).not.toBeDisabled();
    });
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    await waitFor(() => {
      // Step 2 renders the email field from StepProfileDetails
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });
  });

  it('shows Create User button on last step', async () => {
    renderWithProviders(<CreateUserDialog {...defaultProps} />, { mocks: [createUserMock] });
    fireEvent.change(screen.getByLabelText(/phone/i), {
      target: { value: '+919876543210' },
    });
    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: 'Test User' },
    });
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /next/i })).not.toBeDisabled();
    });
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /create user/i })).toBeInTheDocument();
    });
  });

  it('calls onClose when Cancel clicked', () => {
    renderWithProviders(<CreateUserDialog {...defaultProps} />, { mocks: [createUserMock] });
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('does not render when open is false', () => {
    renderWithProviders(<CreateUserDialog {...defaultProps} open={false} />, {
      mocks: [createUserMock],
    });
    expect(screen.queryByText('Create User')).not.toBeInTheDocument();
  });

  it('validates phone format', async () => {
    renderWithProviders(<CreateUserDialog {...defaultProps} />, { mocks: [createUserMock] });
    fireEvent.change(screen.getByLabelText(/phone/i), { target: { value: 'abc' } });
    fireEvent.blur(screen.getByLabelText(/phone/i));
    await waitFor(() => {
      expect(screen.getByText(/valid phone/i)).toBeInTheDocument();
    });
  });
});
