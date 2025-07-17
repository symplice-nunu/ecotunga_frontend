import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import Header from '../Header';
import { renderWithProviders } from '../../test-utils';

jest.mock('../../services/communityEventApi', () => ({
  communityEventApi: {
    getTomorrowEventsCount: jest.fn(() => Promise.resolve({ data: { count: 0 } })),
    getTomorrowEvents: jest.fn(() => Promise.resolve({ data: [] })),
  }
}));
jest.mock('../../services/recyclingCenterApi', () => ({
  getUserPoints: jest.fn(() => Promise.resolve({ data: { total_points: 0 } })),
}));

test('renders Header with dashboard text', async () => {
  renderWithProviders(<Header />);
  await waitFor(() => expect(screen.getByText(/dashboard/i)).toBeInTheDocument());
}); 