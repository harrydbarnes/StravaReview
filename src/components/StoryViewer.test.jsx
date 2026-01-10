import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import StoryViewer from './StoryViewer';

// Mock Framer Motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }) => <h1 {...props}>{children}</h1>,
    h2: ({ children, ...props }) => <h2 {...props}>{children}</h2>,
    p: ({ children, ...props }) => <p {...props}>{children}</p>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
  animate: jest.fn(() => ({ stop: jest.fn() })),
}));

// Mock Audio Context
const mockAudioContext = {
    createGain: jest.fn(() => ({
        connect: jest.fn(),
        gain: { value: 0 }
    })),
    createBufferSource: jest.fn(() => ({
        connect: jest.fn(),
        start: jest.fn(),
        stop: jest.fn(),
        disconnect: jest.fn(),
        buffer: null,
        loop: false
    })),
    decodeAudioData: jest.fn(),
    close: jest.fn(),
    state: 'running',
    resume: jest.fn().mockResolvedValue()
};

window.AudioContext = jest.fn(() => mockAudioContext);
window.webkitAudioContext = jest.fn(() => mockAudioContext);

// Mock fetch for audio
global.fetch = jest.fn(() =>
    Promise.resolve({
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
    })
);

describe('StoryViewer', () => {
    const mockSlides = [
        { component: () => <div>Slide 1</div>, duration: 1000 },
        { component: () => <div>Slide 2</div>, duration: 1000 },
    ];

    const mockOnClose = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        // Setup minimal env vars if needed, though babel config handles import.meta
        process.env.BASE_URL = '/';
    });

    it('renders controls and responds to events', async () => {
        render(<StoryViewer slides={mockSlides} onClose={mockOnClose} />);

        // Start the story
        const startButton = screen.getByText(/Start the Show/i);
        fireEvent.click(startButton);

        // Verify Controls appear (Theme button is good anchor)
        const themeButtons = await screen.findAllByText('Theme');
        expect(themeButtons.length).toBeGreaterThan(0);

        const themeButton = themeButtons[0]; // Desktop or Mobile

        // Click Theme
        fireEvent.click(themeButton);

        // This test mainly verifies that the component renders without crashing
        // and that controls are interactive.
    });
});
