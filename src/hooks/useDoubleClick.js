import { useState, useEffect, useCallback } from 'react';

const DOUBLE_CLICK_TIMEOUT = 500; // ms

export const useDoubleClick = (onDoubleClick) => {
  const [clickCount, setClickCount] = useState(0);

  const handleClick = useCallback((e) => {
    e.stopPropagation();

    const newCount = clickCount + 1;
    setClickCount(newCount);

    if (newCount === 2) {
      if (onDoubleClick) {
        onDoubleClick();
      }
      setClickCount(0);
    }
  }, [clickCount, onDoubleClick]);

  // Reset click count if user waits too long between clicks
  useEffect(() => {
    if (clickCount > 0) {
      const timer = setTimeout(() => setClickCount(0), DOUBLE_CLICK_TIMEOUT);
      return () => clearTimeout(timer);
    }
  }, [clickCount]);

  return { clickCount, handleClick };
};
