import React from 'react';
import { render, screen } from '@testing-library/react';
import LanguageSwitcher from '../LanguageSwitcher';

test('renders LanguageSwitcher', () => {
  render(<LanguageSwitcher />);
  expect(screen.getByText('EN')).toBeInTheDocument();
  expect(screen.getByText('FR')).toBeInTheDocument();
  expect(screen.getByText('RW')).toBeInTheDocument();
}); 