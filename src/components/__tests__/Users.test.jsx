import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import Users from '../Users';
import { renderWithProviders } from '../../test-utils';

jest.mock('../../services/userApi', () => ({
  userApi: {
    getAllUsers: jest.fn(() => Promise.resolve([{ id: 1, name: 'Test User', email: 'test@example.com' }]))
  }
}));

test('renders Users', async () => {
  renderWithProviders(<Users />);
  await waitFor(() => expect(screen.getByText(/users/i)).toBeInTheDocument());
}); 