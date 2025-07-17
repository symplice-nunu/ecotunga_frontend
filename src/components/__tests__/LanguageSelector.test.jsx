import React from 'react';
import { screen } from '@testing-library/react';
import LanguageSelector from '../LanguageSelector';
import { renderWithProviders } from '../../test-utils';

test('renders LanguageSelector', () => {
  renderWithProviders(<LanguageSelector />);
  expect(screen.getByText(/english/i)).toBeInTheDocument();
}); 