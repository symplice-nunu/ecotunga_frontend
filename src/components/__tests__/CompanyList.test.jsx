import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import CompanyList from '../CompanyList';
import { renderWithProviders } from '../../test-utils';

jest.mock('../../services/companyApi', () => ({
  companyApi: {
    getAllCompanies: jest.fn(() => Promise.resolve([{ id: 1, name: 'Test Company' }]))
  }
}));

test('renders CompanyList', async () => {
  renderWithProviders(<CompanyList />);
  await waitFor(() => expect(screen.getByText(/companies/i)).toBeInTheDocument());
}); 