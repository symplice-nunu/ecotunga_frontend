import React from 'react';
import { screen } from '@testing-library/react';
import Layout from '../Layout';
import { renderWithProviders } from '../../test-utils';

test('renders Layout', () => {
  renderWithProviders(<Layout><div>Test Child</div></Layout>);
  expect(screen.getByText(/EcoTunga/i)).toBeInTheDocument();
}); 