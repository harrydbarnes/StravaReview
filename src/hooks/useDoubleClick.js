import { useState, useEffect, useCallback } from 'react';

const DOUBLE_CLICK_TIMEOUT = 500; // ms

export const useDoubleClick = (onDoubleClick) => {
  const [clickCount, setClickCount] = useState(0);

  const handleClick = useCallback((e) => {
    e.stopPropagation();
    setClickCount((c) => c + 1);
  }, []);

  useEffect(() => {
    switch (clickCount) {
      case 1: {
        const timer = setTimeout(() => setClickCount(0), DOUBLE_CLICK_TIMEOUT);
        return () => clearTimeout(timer);
      }
      case 2:
        onDoubleClick?.();
        setClickCount(0);
        break;
      default:
        break;
    }
  }, [clickCount, onDoubleClick]);

  return { clickCount, handleClick };
};
