import React from 'react';
import { screen } from '@testing-library/react';
import TomorrowEventsModal from '../TomorrowEventsModal';
import { renderWithProviders } from '../../test-utils';

test('renders TomorrowEventsModal', () => {
  renderWithProviders(<TomorrowEventsModal isOpen={true} onClose={() => {}} events={[]} />);
  expect(screen.getByText(/tomorrow's events/i)).toBeInTheDocument();
}); 