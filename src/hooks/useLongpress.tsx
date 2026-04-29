import { useCallback, useRef, useEffect } from 'react';

const useLongPress = <T extends HTMLElement = HTMLElement>(
  onLongPress: () => void,
  onClick?: () => void,
  delay = 500
) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const targetRef = useRef<T | null>(null);
  const isLongPressRef = useRef(false);

  const start = useCallback(
    () => {
      isLongPressRef.current = false;
      timeoutRef.current = setTimeout(() => {
        isLongPressRef.current = true;
        onLongPress();
      }, delay);
    },
    [onLongPress, delay]
  );

  const clear = useCallback(
    (_e: Event) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      // Only trigger onClick if it wasn't a long press
      if (!isLongPressRef.current && onClick) {
        onClick();
      }
      
      isLongPressRef.current = false;
    },
    [onClick]
  );

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    isLongPressRef.current = false;
  }, []);

  useEffect(() => {
    const node = targetRef.current;
    if (!node) return;

    // Add event listeners
    node.addEventListener('mousedown', start);
    node.addEventListener('touchstart', start, { passive: false });
    node.addEventListener('mouseup', clear);
    node.addEventListener('mouseleave', cancel);
    node.addEventListener('touchend', clear);
    node.addEventListener('touchcancel', cancel);

    return () => {
      // Cleanup event listeners
      node.removeEventListener('mousedown', start);
      node.removeEventListener('touchstart', start);
      node.removeEventListener('mouseup', clear);
      node.removeEventListener('mouseleave', cancel);
      node.removeEventListener('touchend', clear);
      node.removeEventListener('touchcancel', cancel);
      
      // Clear any pending timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [start, clear, cancel]);

  return targetRef;
};

export default useLongPress;
