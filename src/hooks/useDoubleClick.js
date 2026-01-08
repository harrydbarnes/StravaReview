import { useState, useEffect, useCallback } from 'react';

const DOUBLE_CLICK_TIMEOUT = 500; // ms

export const useDoubleClick = (onDoubleClick) => {
  const [clickCount, setClickCount] = useState(0);

  const handleClick = useCallback((e) => {
    e.stopPropagation();
    setClickCount((c) => c + 1);
  }, []);

  useEffect(() => {
    if (clickCount === 1) {
      const timer = setTimeout(() => setClickCount(0), DOUBLE_CLICK_TIMEOUT);
      return () => clearTimeout(timer);
    }
    if (clickCount === 2) {
      onDoubleClick?.();
      setClickCount(0);
    }
  }, [clickCount, onDoubleClick]);

  return { clickCount, handleClick };
};
