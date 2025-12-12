import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock dependencies
jest.mock('framer-motion', () => {
  const React = require('react');
  return {
    motion: new Proxy({}, {
      get: (target, prop) => {
        const MockComponent = ({ children, ...props }) => React.createElement(prop, props, children);
        MockComponent.displayName = `motion.${prop}`;
        return MockComponent;
      },
    }),
    AnimatePresence: ({ children }) => <>{children}</>,
  };
});

jest.mock('html-to-image', () => ({
  toPng: jest.fn(),
}));

describe('App', () => {
  const originalClientId = process.env.VITE_STRAVA_CLIENT_ID;
  const originalClientSecret = process.env.VITE_STRAVA_CLIENT_SECRET;

  beforeEach(() => {
    jest.resetModules();
    delete process.env.VITE_STRAVA_CLIENT_ID;
    delete process.env.VITE_STRAVA_CLIENT_SECRET;
  });

  afterEach(() => {
    if (originalClientId === undefined) {
      delete process.env.VITE_STRAVA_CLIENT_ID;
    } else {
      process.env.VITE_STRAVA_CLIENT_ID = originalClientId;
    }
    if (originalClientSecret === undefined) {
      delete process.env.VITE_STRAVA_CLIENT_SECRET;
    } else {
      process.env.VITE_STRAVA_CLIENT_SECRET = originalClientSecret;
    }
  });

  test('renders the landing page correctly', () => {
    render(<App />);

    // Use getByRole for better accessibility testing
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent(/STRAVA/i);
    expect(heading).toHaveTextContent(/WRAPPED/i);

    const connectButton = screen.getByRole('button', { name: /Connect with Strava/i });
    expect(connectButton).toBeInTheDocument();

    const demoButton = screen.getByRole('button', { name: /Try Demo Mode/i });
    expect(demoButton).toBeInTheDocument();
  });
});
