import '@testing-library/jest-dom';
jest.mock('axios');
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders welcome message', () => {
  render(<App />);
  const welcomeElement = screen.getByText(/welcome to ecotunga/i);
  expect(welcomeElement).toBeInTheDocument();
});
