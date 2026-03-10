import React from 'react';
import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import type { RenderOptions, RenderResult } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { MockedProvider } from '@apollo/client/testing';
import type { MockedResponse } from '@apollo/client/testing';
import { MemoryRouter } from 'react-router-dom';

const theme = createTheme();

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  mocks?: MockedResponse[];
  initialRoute?: string;
}

function AllProviders({
  children,
  mocks = [],
  initialRoute = '/',
}: {
  children: React.ReactNode;
  mocks?: MockedResponse[];
  initialRoute?: string;
}) {
  return (
    <MockedProvider mocks={mocks} addTypename={false}>
      <ThemeProvider theme={theme}>
        <MemoryRouter initialEntries={[initialRoute]}>{children}</MemoryRouter>
      </ThemeProvider>
    </MockedProvider>
  );
}

export function renderWithProviders(
  ui: ReactElement,
  options: CustomRenderOptions = {},
): RenderResult {
  const { mocks, initialRoute, ...renderOptions } = options;

  return render(ui, {
    wrapper: ({ children }) => (
      <AllProviders mocks={mocks} initialRoute={initialRoute}>
        {children}
      </AllProviders>
    ),
    ...renderOptions,
  });
}

export { render };
