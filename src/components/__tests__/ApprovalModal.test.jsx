import React from 'react';
import { screen } from '@testing-library/react';
import ApprovalModal from '../ApprovalModal';
import { renderWithProviders } from '../../test-utils';

test('renders ApprovalModal', () => {
  const booking = {
    id: 1,
    user_name: 'John',
    user_last_name: 'Doe',
    dropoff_date: '2024-07-18',
    time_slot: '09:00',
    sector: 'Kacyiru',
    district: 'Gasabo',
    waste_types: ['Plastic'],
  };
  renderWithProviders(
    <ApprovalModal isOpen={true} onClose={() => {}} onApprove={() => {}} booking={booking} />
  );
  expect(screen.getByRole('heading', { name: /approve booking/i })).toBeInTheDocument();
}); 