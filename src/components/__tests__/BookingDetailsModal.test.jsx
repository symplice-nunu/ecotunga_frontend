import React from 'react';
import { screen } from '@testing-library/react';
import BookingDetailsModal from '../BookingDetailsModal';
import { renderWithProviders } from '../../test-utils';

test('renders BookingDetailsModal', () => {
  const booking = {
    id: 1,
    user_name: 'John',
    user_last_name: 'Doe',
    user_email: 'john@example.com',
    user_phone: '123456789',
    dropoff_date: '2024-07-18',
    time_slot: '09:00',
    status: 'approved',
    created_at: '2024-07-17',
    district: 'Gasabo',
    sector: 'Kacyiru',
    cell: 'Kamatamu',
  };
  renderWithProviders(<BookingDetailsModal isOpen={true} onClose={() => {}} booking={booking} />);
  expect(screen.getByRole('heading', { name: /booking details/i, level: 2 })).toBeInTheDocument();
}); 