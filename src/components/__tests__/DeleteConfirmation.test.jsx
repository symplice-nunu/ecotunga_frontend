import React from 'react';
import { screen } from '@testing-library/react';
import DeleteConfirmation from '../DeleteConfirmation';
import { renderWithProviders } from '../../test-utils';

test('renders DeleteConfirmation', () => {
  renderWithProviders(<DeleteConfirmation isOpen={true} onClose={() => {}} onConfirm={() => {}} />);
  expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
}); 