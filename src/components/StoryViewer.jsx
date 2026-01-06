import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
  const containerRef = useRef(null);

  const handleNext = useCallback(() => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
        // Maybe loop or close? For now, stay on last slide.
        // We could call onClose() here if we wanted auto-close
    }
  }, [currentIndex, slides.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  useEffect(() => {
    if (isPaused) return;
    const timer = setTimeout(() => {
      handleNext();
    }, 5000); // 5 seconds per slide
    return () => clearTimeout(timer);
  }, [currentIndex, isPaused, handleNext]);

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

  const CurrentSlide = slides[currentIndex];

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
          {slides.map((_, idx) => {
            const isActive = idx === currentIndex;
            const isPast = idx < currentIndex;
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
                  transition={{ duration: isActive ? 5 : 0, ease: 'linear' }}
                />
              </div>
            );
          })}
        </div>

        {/* Controls Overlay (Theming) */}
        <div className="absolute top-6 right-4 z-30 flex gap-2">
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
              <CurrentSlide 
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
