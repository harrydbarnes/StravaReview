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
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
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
// eslint-disable-next-line no-undef
global.fetch = jest.fn(() =>
    Promise.resolve({
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
    })
);

describe('StoryViewer', () => {
    const mockSlides = [
        { id: '1', component: () => <div>Slide 1</div>, duration: 1000 },
        { id: '2', component: () => <div>Slide 2</div>, duration: 1000 },
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

    describe('Intro Sequence', () => {
        beforeEach(() => {
            jest.useFakeTimers();
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        it('transitions from intro to slides after delay', async () => {
            render(<StoryViewer slides={mockSlides} onClose={mockOnClose} />);

            // Check Slide 1 is NOT visible yet
            expect(screen.queryByText('Slide 1')).not.toBeInTheDocument();

            const startButton = screen.getByText(/Start the Show/i);

            // Click Start
            await act(async () => {
                fireEvent.click(startButton);
            });

            // Immediately after click, isStarting should be true, but hasStarted false.
            expect(screen.queryByText('Slide 1')).not.toBeInTheDocument();

            // Fast forward time by 1.5s
            act(() => {
                jest.advanceTimersByTime(1500);
            });

            // Now hasStarted should be true, and Slide 1 should be visible
            expect(screen.getByText('Slide 1')).toBeInTheDocument();
        });
    });
});
