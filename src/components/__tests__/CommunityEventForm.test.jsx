import React from 'react';
import { render, screen } from '@testing-library/react';
import CommunityEventForm from '../CommunityEventForm';
import { renderWithProviders } from '../../test-utils';

test('renders CommunityEventForm', () => {
  renderWithProviders(
    <CommunityEventForm isOpen={true} onClose={() => {}} onSubmit={() => {}} />
  );
  expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
}); 