import React from 'react';
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../../test/test-utils';
import MeetingsPage from '../MeetingsPage';
import { GET_MEETINGS, GET_MEETING_COUNTS } from '../../../graphql/queries';

const meetingsMock = {
  request: {
    query: GET_MEETINGS,
    variables: {
      page: 1,
      limit: 10,
      search: undefined,
      status: undefined,
      sortBy: 'createdAt',
      order: 'DESC',
    },
  },
  result: {
    data: {
      meetings: {
        items: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      },
    },
  },
};

const countsMock = {
  request: { query: GET_MEETING_COUNTS },
  result: {
    data: {
      meetingCounts: {
        pending: 0,
        confirmed: 0,
        completed: 0,
        cancelled: 0,
        total: 0,
      },
    },
  },
};

describe('MeetingsPage', () => {
  it('renders breadcrumbs', () => {
    renderWithProviders(<MeetingsPage />, { mocks: [meetingsMock, countsMock] });
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    const meetingTexts = screen.getAllByText('1:1 Meetings');
    expect(meetingTexts.length).toBeGreaterThanOrEqual(1);
  });

  it('renders page title', () => {
    renderWithProviders(<MeetingsPage />, { mocks: [meetingsMock, countsMock] });
    const headings = screen.getAllByText('1:1 Meetings');
    expect(headings.length).toBeGreaterThanOrEqual(1);
  });
});
