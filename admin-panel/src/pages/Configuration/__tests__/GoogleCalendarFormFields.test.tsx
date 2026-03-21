import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../../test/test-utils';
import GoogleCalendarFormFields from '../GoogleCalendarFormFields';
import type { GoogleCalendarConfig } from '../Configuration.types';

const defaultConfig: GoogleCalendarConfig = {
  clientId: '',
  clientSecret: '',
  refreshToken: '',
  calendarId: '',
  enabled: 'false',
};

describe('GoogleCalendarFormFields', () => {
  it('renders all form fields', () => {
    renderWithProviders(
      <GoogleCalendarFormFields config={defaultConfig} onChange={vi.fn()} />,
    );
    expect(screen.getByLabelText('Client ID')).toBeInTheDocument();
    expect(screen.getByLabelText('Client Secret')).toBeInTheDocument();
    expect(screen.getByLabelText('Refresh Token')).toBeInTheDocument();
    expect(screen.getByLabelText('Calendar ID')).toBeInTheDocument();
    expect(screen.getByLabelText('Enable Google Calendar Integration')).toBeInTheDocument();
  });

  it('renders OAuth instructions alert', () => {
    renderWithProviders(
      <GoogleCalendarFormFields config={defaultConfig} onChange={vi.fn()} />,
    );
    expect(screen.getByText('How to get a Refresh Token:')).toBeInTheDocument();
  });

  it('renders helper text for each field', () => {
    renderWithProviders(
      <GoogleCalendarFormFields config={defaultConfig} onChange={vi.fn()} />,
    );
    expect(
      screen.getByText('OAuth 2.0 Client ID from Google Cloud Console'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('OAuth 2.0 Client Secret from Google Cloud Console'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('OAuth 2.0 Refresh Token — see instructions above'),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Calendar ID (use 'primary' for the main calendar)"),
    ).toBeInTheDocument();
  });

  it('calls onChange when Client ID changes', () => {
    const onChange = vi.fn();
    renderWithProviders(
      <GoogleCalendarFormFields config={defaultConfig} onChange={onChange} />,
    );
    fireEvent.change(screen.getByLabelText('Client ID'), {
      target: { value: 'new-client-id' },
    });
    expect(onChange).toHaveBeenCalledWith('clientId', 'new-client-id');
  });

  it('calls onChange when Client Secret changes', () => {
    const onChange = vi.fn();
    renderWithProviders(
      <GoogleCalendarFormFields config={defaultConfig} onChange={onChange} />,
    );
    fireEvent.change(screen.getByLabelText('Client Secret'), {
      target: { value: 'secret' },
    });
    expect(onChange).toHaveBeenCalledWith('clientSecret', 'secret');
  });

  it('calls onChange when Refresh Token changes', () => {
    const onChange = vi.fn();
    renderWithProviders(
      <GoogleCalendarFormFields config={defaultConfig} onChange={onChange} />,
    );
    fireEvent.change(screen.getByLabelText('Refresh Token'), {
      target: { value: 'token-123' },
    });
    expect(onChange).toHaveBeenCalledWith('refreshToken', 'token-123');
  });

  it('calls onChange when Calendar ID changes', () => {
    const onChange = vi.fn();
    renderWithProviders(
      <GoogleCalendarFormFields config={defaultConfig} onChange={onChange} />,
    );
    fireEvent.change(screen.getByLabelText('Calendar ID'), {
      target: { value: 'primary' },
    });
    expect(onChange).toHaveBeenCalledWith('calendarId', 'primary');
  });

  it('calls onChange when enabled switch is toggled', () => {
    const onChange = vi.fn();
    renderWithProviders(
      <GoogleCalendarFormFields config={defaultConfig} onChange={onChange} />,
    );
    fireEvent.click(screen.getByLabelText('Enable Google Calendar Integration'));
    expect(onChange).toHaveBeenCalledWith('enabled', 'true');
  });

  it('shows switch as checked when enabled is true', () => {
    const enabledConfig = { ...defaultConfig, enabled: 'true' };
    renderWithProviders(
      <GoogleCalendarFormFields config={enabledConfig} onChange={vi.fn()} />,
    );
    const switchEl = screen.getByRole('checkbox');
    expect(switchEl).toBeChecked();
  });

  it('displays current config values', () => {
    const filledConfig: GoogleCalendarConfig = {
      clientId: 'my-client-id',
      clientSecret: 'my-secret',
      refreshToken: 'my-token',
      calendarId: 'primary',
      enabled: 'true',
    };
    renderWithProviders(
      <GoogleCalendarFormFields config={filledConfig} onChange={vi.fn()} />,
    );
    expect((screen.getByLabelText('Client ID') as HTMLInputElement).value).toBe('my-client-id');
    expect((screen.getByLabelText('Calendar ID') as HTMLInputElement).value).toBe('primary');
  });

  it('renders OAuth Playground link', () => {
    renderWithProviders(
      <GoogleCalendarFormFields config={defaultConfig} onChange={vi.fn()} />,
    );
    expect(screen.getByText('OAuth 2.0 Playground')).toBeInTheDocument();
  });
});
