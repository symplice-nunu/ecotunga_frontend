import React from 'react';
import { screen } from '@testing-library/react';
import ProtectedRoute from '../ProtectedRoute';
import { renderWithProviders } from '../../test-utils';

test('renders children when authenticated', () => {
  renderWithProviders(
    <ProtectedRoute><div>Protected Content</div></ProtectedRoute>,
    { authValue: { user: { name: 'Test' }, loading: false } }
  );
  expect(screen.getByText(/protected content/i)).toBeInTheDocument();
}); 