import React from 'react';
import { screen } from '@testing-library/react';
import PointsModal from '../PointsModal';
import { renderWithProviders } from '../../test-utils';

test('renders PointsModal', () => {
  renderWithProviders(<PointsModal isOpen={true} onClose={() => {}} userPoints={{ total_points: 42 }} />);
  expect(screen.getByRole('heading', { name: /recycling points/i })).toBeInTheDocument();
}); 