import React from 'react';
import { screen } from '@testing-library/react';
import Sidebar from '../Sidebar';
import { renderWithProviders } from '../../test-utils';

test('renders Sidebar', () => {
  renderWithProviders(<Sidebar />);
  // If Sidebar has a test id, use it. Otherwise, check for a visible element.
  // expect(screen.getByTestId('sidebar')).toBeInTheDocument();
  // Fallback: check for a common text, e.g. 'Dashboard'
  expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
}); 