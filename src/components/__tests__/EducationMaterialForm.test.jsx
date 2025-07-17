import React from 'react';
import { screen } from '@testing-library/react';
import EducationMaterialForm from '../EducationMaterialForm';
import { renderWithProviders } from '../../test-utils';

test('renders EducationMaterialForm', () => {
  renderWithProviders(<EducationMaterialForm isOpen={true} onClose={() => {}} onSubmit={() => {}} />);
  expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
}); 