import React from 'react';
import { screen } from '@testing-library/react';
import CompanyRegistration from '../CompanyRegistration';
import { renderWithProviders } from '../../test-utils';

test('renders CompanyRegistration', () => {
  renderWithProviders(<CompanyRegistration />);
  expect(screen.getByRole('heading', { name: /company registration/i })).toBeInTheDocument();
}); 