import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock dependencies
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }) => <p {...props}>{children}</p>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

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
    process.env.VITE_STRAVA_CLIENT_ID = originalClientId;
    process.env.VITE_STRAVA_CLIENT_SECRET = originalClientSecret;
  });

  test('renders the landing page correctly', () => {
    render(<App />);
    const titleElements = screen.getAllByText(/STRAVA/i);
    expect(titleElements.length).toBeGreaterThan(0);

    const subtitleElement = screen.getByText(/WRAPPED/i);
    expect(subtitleElement).toBeInTheDocument();

    const connectButton = screen.getByText(/Connect with Strava/i);
    expect(connectButton).toBeInTheDocument();

    const demoButton = screen.getByText(/Try Demo Mode/i);
    expect(demoButton).toBeInTheDocument();
  });
});
