import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Volume2, VolumeX } from 'lucide-react';
import clsx from 'clsx';

const themes = {
  black: { bg: 'bg-black', text: 'text-white', accent: 'text-white' },
  white: { bg: 'bg-white', text: 'text-black', accent: 'text-black' },
};

const textColors = ['text-white', 'text-black', 'text-red-500', 'text-blue-500', 'text-orange-500'];

const stopSourceNode = (sourceRef, name) => {
    if (sourceRef.current) {
        try {
            sourceRef.current.stop();
        } catch (e) {
            if (e.name !== 'InvalidStateError') {
                console.warn(`Error stopping ${name}:`, e);
            }
        }
        sourceRef.current.disconnect();
        sourceRef.current = null;
    }
};

const Controls = ({
    className,
    isMuted,
    setIsMuted,
    theme,
    setTheme,
    textColor,
    setTextColor,
    onClose
}) => {
    const buttonClass = theme === 'white'
        ? "p-2 bg-black/10 text-black rounded-full backdrop-blur-sm text-sm hover:bg-black/20 transition-colors"
        : "p-2 bg-white/20 text-white rounded-full backdrop-blur-sm text-sm hover:bg-white/30 transition-colors";

    return (
        <div className={clsx("flex gap-2 z-30", className)}>
            <button
                onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
                className={buttonClass}
                title={isMuted ? "Unmute" : "Mute"}
                type='button'
            >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    const newTheme = theme === 'black' ? 'white' : 'black';
                    setTheme(newTheme);
                    setTextColor(newTheme === 'black' ? 'text-white' : 'text-black');
                }}
                className={buttonClass}
                type='button'
            >
                Theme
            </button>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    // Filter colors based on current theme to avoid invisible text
                    const invalidColorForTheme = {
                        black: 'text-black',
                        white: 'text-white',
                    };
                    const availableColors = textColors.filter(c => c !== invalidColorForTheme[theme]);

                    // Find current index in the filtered list or default to 0
                    const currentFilteredIndex = availableColors.indexOf(textColor);
                    const nextIdx = (currentFilteredIndex + 1) % availableColors.length;

                    setTextColor(availableColors[nextIdx]);
                }}
                className={buttonClass}
                type='button'
            >
                Colour
            </button>
            {/* Close button that calls onClose */}
            {onClose && (
                <button
                    onClick={(e) => { e.stopPropagation(); onClose(); }}
                    className={buttonClass}
                    type='button'
                >
                    ✕
                </button>
            )}
        </div>
    );
};

const StoryViewer = ({ slides, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [theme, setTheme] = useState('black');
  const [textColor, setTextColor] = useState('text-white');
  const [isMuted, setIsMuted] = useState(false);
  const containerRef = useRef(null);

  // Web Audio API Refs
  const audioCtxRef = useRef(null);
  const loopBufferRef = useRef(null);
  const cheerBufferRef = useRef(null);
  const loopSourceRef = useRef(null);
  const cheerSourceRef = useRef(null);
  const loopGainNodeRef = useRef(null);
  const cheerGainNodeRef = useRef(null);

  // Initialize Audio Context and Load Buffers
  useEffect(() => {
    let isMounted = true;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContext();
    audioCtxRef.current = ctx;

    // Create Gain Nodes
    const loopGain = ctx.createGain();
    loopGain.connect(ctx.destination);
    loopGain.gain.value = 0.5; // Default volume
    loopGainNodeRef.current = loopGain;

    const cheerGain = ctx.createGain();
    cheerGain.connect(ctx.destination);
    cheerGain.gain.value = 0.6; // Default volume
    cheerGainNodeRef.current = cheerGain;

    const baseUrl = import.meta.env.BASE_URL;

    const loadBuffer = async (url) => {
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            if (isMounted) {
                 return await ctx.decodeAudioData(arrayBuffer);
            }
            return null;
        } catch (error) {
            console.warn(`Failed to load audio from ${url}:`, error);
            return null;
        }
    };

    // Load assets
    Promise.all([
        loadBuffer(`${baseUrl}DrumLoop.mp3`),
        loadBuffer(`${baseUrl}CrowdCheer.mp3`)
    ]).then(([loopBuffer, cheerBuffer]) => {
        if (isMounted) {
            loopBufferRef.current = loopBuffer;
            cheerBufferRef.current = cheerBuffer;
        }
    });

    return () => {
        isMounted = false;
        if (ctx.state !== 'closed') {
            ctx.close();
        }
    };
  }, []);

  // Helper: Play Loop (Gapless)
  const playWebAudioLoop = useCallback(() => {
      const ctx = audioCtxRef.current;
      if (!ctx || !loopBufferRef.current || loopSourceRef.current) return;

      const play = () => {
          const src = ctx.createBufferSource();
          src.buffer = loopBufferRef.current;
          src.loop = true;
          src.connect(loopGainNodeRef.current);
          src.start(0);
          loopSourceRef.current = src;
      };

      if (ctx.state === 'suspended') {
          ctx.resume().then(play).catch(e => console.warn("Audio Context resume failed", e));
      } else {
          play();
      }
  }, []);

  // Helper: Stop Loop
  const stopWebAudioLoop = useCallback(() => {
      stopSourceNode(loopSourceRef, 'audio loop');
  }, []);

  // Helper: Play Cheer
  const playWebAudioCheer = useCallback(() => {
      const ctx = audioCtxRef.current;
      if (!ctx || !cheerBufferRef.current) return;

      stopSourceNode(cheerSourceRef, 'existing cheer');

      const src = ctx.createBufferSource();
      src.buffer = cheerBufferRef.current;
      src.loop = false;
      src.connect(cheerGainNodeRef.current);
      src.start(0);
      cheerSourceRef.current = src;
  }, []);

  // Helper: Stop Cheer
  const stopWebAudioCheer = useCallback(() => {
      stopSourceNode(cheerSourceRef, 'cheer');
  }, []);

  // Handle Mute/Unmute
  useEffect(() => {
      if (loopGainNodeRef.current) {
          loopGainNodeRef.current.gain.value = isMuted ? 0 : 0.5;
      }
      if (cheerGainNodeRef.current) {
          cheerGainNodeRef.current.gain.value = isMuted ? 0 : 0.6;
      }
  }, [isMuted]);


  // Audio Logic based on Slide Index
  useEffect(() => {
    const isLastSlide = currentIndex === slides.length - 1;

    if (isLastSlide) {
      stopWebAudioLoop();
      if (!isMuted && hasStarted) {
          playWebAudioCheer();
      }
    } else {
      stopWebAudioCheer();
      if (!isMuted && hasStarted) {
          playWebAudioLoop();
      }
    }
  }, [currentIndex, isMuted, slides.length, hasStarted, playWebAudioLoop, stopWebAudioLoop, playWebAudioCheer, stopWebAudioCheer]);

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
    if (isPaused || !hasStarted) return;

    // Get duration from slide object, default to 6000ms
    const currentDuration = slides[currentIndex].duration || 6000;

    const timer = setTimeout(() => {
      handleNext();
    }, currentDuration);

    return () => clearTimeout(timer);
  }, [currentIndex, isPaused, handleNext, slides, hasStarted]);

  const togglePause = () => setIsPaused(!isPaused);

  const handleStart = () => {
      setHasStarted(true);
      if (!isMuted) playWebAudioLoop();
  };

  // Touch/Click handlers
  const handleTap = (e) => {
    if (!hasStarted) return;
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

  return (
    <div className={clsx("fixed inset-0 z-50 flex items-center justify-center", themes[theme].bg)}>
      
      {/* Wrapper for Desktop Layout */}
      <div className="relative w-full h-full md:w-[400px] md:h-[80vh] flex flex-col">

        {/* Desktop Controls (Outside Card) */}
        <Controls
            className="hidden md:flex absolute -top-12 right-0"
            isMuted={isMuted}
            setIsMuted={setIsMuted}
            theme={theme}
            setTheme={setTheme}
            textColor={textColor}
            setTextColor={setTextColor}
            onClose={onClose}
        />

        {/* Container for Desktop (Mobile mimics full screen) */}
        <div
            ref={containerRef}
            className="relative w-full h-full md:rounded-xl overflow-hidden shadow-2xl flex flex-col transition-all duration-300"
        >
            {!hasStarted && (
            <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center flex-col p-8 text-center">
                <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-tight">Ready?</h2>
                <p className="text-gray-300 mb-8">Turn up your volume for the full experience.</p>
                <button
                    onClick={handleStart}
                    className="px-8 py-4 bg-brand-orange text-white text-xl font-bold rounded-full hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-brand-orange/30 animate-pulse"
                >
                    Begin Your Journey
                </button>
            </div>
        )}

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

        {/* Mobile Controls (Inside Card) */}
        <Controls
            className="md:hidden absolute top-6 right-4"
            isMuted={isMuted}
            setIsMuted={setIsMuted}
            theme={theme}
            setTheme={setTheme}
            textColor={textColor}
            setTextColor={setTextColor}
            onClose={onClose}
        />


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
    </div>
  );
};

export default StoryViewer;
