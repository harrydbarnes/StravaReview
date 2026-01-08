import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Volume2, VolumeX } from 'lucide-react';
import clsx from 'clsx';
// Removed unused imports

const themes = {
  black: { bg: 'bg-black', text: 'text-white', accent: 'text-white' },
  white: { bg: 'bg-white', text: 'text-black', accent: 'text-black' },
};

const textColors = ['text-white', 'text-black', 'text-red-500', 'text-blue-500', 'text-orange-500'];

const StoryViewer = ({ slides, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [theme, setTheme] = useState('black');
  const [textColor, setTextColor] = useState('text-white');
  const [isMuted, setIsMuted] = useState(false);
  const containerRef = useRef(null);

  // Web Audio Context for seamless loop
  const audioContextRef = useRef(null);
  const loopSourceRef = useRef(null);
  const gainNodeRef = useRef(null);
  const isLoopPlayingRef = useRef(false);

  const cheerRef = useRef(null);

  useEffect(() => {
    // Initialize Web Audio API for Loop
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioContextRef.current = new AudioContext();
    gainNodeRef.current = audioContextRef.current.createGain();
    gainNodeRef.current.connect(audioContextRef.current.destination);
    gainNodeRef.current.gain.value = 0.5; // Default volume

    const baseUrl = import.meta.env.BASE_URL;
    const loopUrl = `${baseUrl}DrumLoop.wav`;

    fetch(loopUrl)
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => audioContextRef.current.decodeAudioData(arrayBuffer))
        .then(audioBuffer => {
             // Create buffer source is done when playing
             // Store buffer for reuse
             audioContextRef.current.buffer = audioBuffer;
        })
        .catch(e => console.error("Error loading drum loop:", e));


    cheerRef.current = new Audio(`${baseUrl}CrowdCheer.mp3`);
    cheerRef.current.volume = 0.6;

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (cheerRef.current) {
        cheerRef.current.pause();
        cheerRef.current.src = '';
      }
    };
  }, []);

  // Helper to play seamless loop
  const startLoop = () => {
      if (isLoopPlayingRef.current || !audioContextRef.current || !audioContextRef.current.buffer) return;

      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioContextRef.current.buffer;
      source.loop = true;
      source.connect(gainNodeRef.current);
      source.start(0);
      loopSourceRef.current = source;
      isLoopPlayingRef.current = true;

      // Resume context if suspended
      if (audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume();
      }
  };

  const stopLoop = () => {
      if (loopSourceRef.current) {
          try {
            loopSourceRef.current.stop();
          } catch(e) {/* ignore if already stopped */}
          loopSourceRef.current = null;
      }
      isLoopPlayingRef.current = false;
  };

  useEffect(() => {
    if (isMuted) {
        if (gainNodeRef.current) gainNodeRef.current.gain.value = 0;
        if (cheerRef.current) cheerRef.current.volume = 0;
    } else {
        if (gainNodeRef.current) gainNodeRef.current.gain.value = 0.5;
        if (cheerRef.current) cheerRef.current.volume = 0.6;

        // Ensure context is running if unmuted
        if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
        }
    }
  }, [isMuted]);

  useEffect(() => {
    const isLastSlide = currentIndex === slides.length - 1;

    if (isLastSlide) {
      stopLoop();
      if (!isMuted && cheerRef.current) {
          cheerRef.current.play().catch(e => console.warn(e));
      }
    } else {
      if (cheerRef.current) {
          cheerRef.current.pause();
          cheerRef.current.currentTime = 0;
      }
      if (!isMuted) {
          // Attempt to start loop if buffer is ready
          // If buffer not ready yet, it won't start, but that's ok (race condition on load)
          // We can add a check in the fetch handler to start if index is 0
          startLoop();
      }
    }
  }, [currentIndex, isMuted, slides.length]);

  const handleNext = useCallback(() => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, slides.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  useEffect(() => {
    if (isPaused) return;

    // Get duration from slide object, default to 6000ms
    const currentDuration = slides[currentIndex].duration || 6000;

    const timer = setTimeout(() => {
      handleNext();
    }, currentDuration);

    return () => clearTimeout(timer);
  }, [currentIndex, isPaused, handleNext, slides]);

  const togglePause = () => setIsPaused(!isPaused);

  // Touch/Click handlers
  const handleTap = (e) => {
    if (!containerRef.current) return;
    
    // Get click coordinates relative to the container
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;

    if (x < width / 3) handlePrev();
    else if (x > 2 * width / 3) handleNext();
    else togglePause();
  };

  const CurrentSlideData = slides[currentIndex];
  // Handle both component-direct slides (legacy) and object-based slides
  const SlideComponent = CurrentSlideData.component || CurrentSlideData;

  if (!SlideComponent) return null;

  const buttonClass = theme === 'white'
    ? "p-2 bg-black/10 text-black rounded-full backdrop-blur-sm text-sm hover:bg-black/20 transition-colors"
    : "p-2 bg-white/20 text-white rounded-full backdrop-blur-sm text-sm hover:bg-white/30 transition-colors";

  return (
    <div className={clsx("fixed inset-0 z-50 flex items-center justify-center", themes[theme].bg)}>
      
      {/* Container for Desktop (Mobile mimics full screen) */}
      <div 
        ref={containerRef}
        className="relative w-full h-full md:w-[400px] md:h-[80vh] md:rounded-xl overflow-hidden shadow-2xl flex flex-col transition-all duration-300"
      >
        
        {/* Progress Bars */}
        <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 p-2">
          {slides.map((slide, idx) => {
            const isActive = idx === currentIndex;
            const isPast = idx < currentIndex;
            const duration = slide.duration || 6000;
            return (
              <div
                key={idx}
                className="h-2 flex-1 bg-gray-500/50 rounded-full overflow-hidden cursor-pointer hover:h-3 transition-all"
                onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
              >
                <motion.div
                  key={`${idx}-${isActive}`}
                  className={clsx("h-full", textColor.replace('text-', 'bg-'))}
                  initial={{ width: isPast ? '100%' : '0%' }}
                  animate={{ width: isPast || isActive ? '100%' : '0%' }}
                  transition={{ duration: isActive ? duration / 1000 : 0, ease: 'linear' }}
                />
              </div>
            );
          })}
        </div>

        {/* Controls Overlay (Theming) */}
        <div className="absolute top-6 right-4 z-30 flex gap-2">
            <button
                onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
                className={buttonClass}
                title={isMuted ? "Unmute" : "Mute"}
            >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <button onClick={() => {
                const newTheme = theme === 'black' ? 'white' : 'black';
                setTheme(newTheme);
                setTextColor(newTheme === 'black' ? 'text-white' : 'text-black');
            }} className={buttonClass}>
                Theme
            </button>
             <button onClick={() => {
                 // Filter colors based on current theme to avoid invisible text
                 const availableColors = textColors.filter(c =>
                     (theme === 'black' && c !== 'text-black') ||
                     (theme === 'white' && c !== 'text-white')
                 );

                 // Find current index in the filtered list or default to 0
                 const currentFilteredIndex = availableColors.indexOf(textColor);
                 const nextIdx = (currentFilteredIndex + 1) % availableColors.length;

                 setTextColor(availableColors[nextIdx]);
             }} className={buttonClass}>
                Colour
            </button>
             {/* Close button that calls onClose */}
             {onClose && (
                 <button onClick={onClose} className={buttonClass}>
                     ✕
                 </button>
             )}
        </div>


        {/* Tap Indicators (First Slide Only) */}
        {currentIndex === 0 && (
          <div className="absolute inset-0 pointer-events-none z-40 flex justify-between items-center px-4">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: [0, 0.5, 0], x: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className={clsx("p-2 rounded-full backdrop-blur-sm", theme === 'white' ? 'bg-black/10 text-black' : 'bg-white/10 text-white')}
            >
              <ChevronLeft size={24} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: [0, 0.5, 0], x: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
              className={clsx("p-2 rounded-full backdrop-blur-sm", theme === 'white' ? 'bg-black/10 text-black' : 'bg-white/10 text-white')}
            >
              <ChevronRight size={24} />
            </motion.div>
          </div>
        )}

        {/* Slide Content */}
        <div 
            className={clsx("flex-1 relative cursor-pointer select-none", themes[theme].bg, themes[theme].text)}
            onClick={handleTap}
        >
          <AnimatePresence mode='wait'>
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full"
            >
              <SlideComponent
                isActive={true} 
                theme={themes[theme]} 
                textColor={textColor}
                onExport={handleNext} 
              />
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};

export default StoryViewer;
