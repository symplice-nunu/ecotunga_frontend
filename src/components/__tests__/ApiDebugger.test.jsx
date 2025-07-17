import React from 'react';
import { render, screen } from '@testing-library/react';
import ApiDebugger from '../ApiDebugger';

test('renders ApiDebugger', () => {
  render(<ApiDebugger />);
  expect(screen.getByText(/api debugger/i)).toBeInTheDocument();
}); 