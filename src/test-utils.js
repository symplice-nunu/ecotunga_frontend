import React from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import { AuthContext } from './contexts/AuthContext';
import { MemoryRouter } from 'react-router-dom';

export function renderWithProviders(
  ui,
  {
    authValue = { user: { name: 'Test User', role: 'user' }, loading: false },
    ...renderOptions
  } = {}
) {
  function Wrapper({ children }) {
    return (
      <MemoryRouter>
        <I18nextProvider i18n={i18n}>
          <AuthContext.Provider value={authValue}>
            {children}
          </AuthContext.Provider>
        </I18nextProvider>
      </MemoryRouter>
    );
  }
  return { ...require('@testing-library/react').render(ui, { wrapper: Wrapper, ...renderOptions }) };
} 