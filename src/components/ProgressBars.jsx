import React, { memo } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import PropTypes from 'prop-types';

const DEFAULT_SLIDE_DURATION_MS = 6000;

const ProgressBars = memo(({ slides, currentIndex, progressColorClass, onJump }) => {
    return (
        <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 p-2" aria-label="Slides navigation">
            {slides.map((slide, idx) => {
                const isActive = idx === currentIndex;
                const isPast = idx < currentIndex;
                const duration = slide.duration || DEFAULT_SLIDE_DURATION_MS;

                return (
                    <button
                        key={slide.id || idx}
                        aria-current={isActive ? 'step' : 'false'}
                        aria-label={`Go to slide ${idx + 1}`}
                        className="h-2 flex-1 bg-gray-500/50 rounded-full overflow-hidden cursor-pointer hover:h-3 transition-all border-none p-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                        onClick={(e) => {
                            e.stopPropagation();
                            onJump(idx);
                        }}
                    >
                        <motion.div
                            key={`${slide.id || idx}-${isActive}`}
                            className={clsx("h-full", progressColorClass)}
                            initial={{ width: isPast ? '100%' : '0%' }}
                            animate={{ width: isPast || isActive ? '100%' : '0%' }}
                            transition={{ duration: isActive ? duration / 1000 : 0, ease: 'linear' }}
                        />
                    </button>
                );
            })}
        </div>
    );
});

ProgressBars.displayName = 'ProgressBars';

ProgressBars.propTypes = {
    slides: PropTypes.arrayOf(PropTypes.shape({
        duration: PropTypes.number
    })).isRequired,
    currentIndex: PropTypes.number.isRequired,
    progressColorClass: PropTypes.string.isRequired,
    onJump: PropTypes.func.isRequired
};

export default ProgressBars;
