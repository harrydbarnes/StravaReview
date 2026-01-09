import { useState, useEffect, useCallback, useRef } from 'react';

const DOUBLE_CLICK_TIMEOUT = 500; // ms

export const useDoubleClick = (onDoubleClick) => {
  const [clickCount, setClickCount] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleClick = useCallback((e) => {
    e.stopPropagation();

    setClickCount(prev => {
        const newCount = prev + 1;

        if (newCount === 1) {
            // First click: start timer to reset
            timerRef.current = setTimeout(() => {
                setClickCount(0);
                timerRef.current = null;
            }, DOUBLE_CLICK_TIMEOUT);
            return 1;
        } else if (newCount === 2) {
            // Second click: trigger action and reset
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
            onDoubleClick?.();
            return 2;
        }

        // For subsequent clicks, keep the count at 2 to prevent the hint from reappearing.
        return 2;
    });
  }, [onDoubleClick]);

  return { clickCount, handleClick };
};
