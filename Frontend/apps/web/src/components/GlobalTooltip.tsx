import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import './Tooltip.css';

export const GlobalTooltip = () => {
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    content: string;
    x: number;
    y: number;
    position: string;
  }>({
    visible: false,
    content: '',
    x: 0,
    y: 0,
    position: 'top'
  });

  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as Element;
      const curr = target.closest('[data-tooltip-content]');

      if (curr) {
        const content = curr.getAttribute('data-tooltip-content');
        if (content) {
          if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);

          const rect = curr.getBoundingClientRect();
          
          // Default top position calculation
          let x = rect.left + rect.width / 2;
          let y = rect.top;
          let position = 'top';

          // Optional position override from dataset
          const customPos = curr.getAttribute('data-tooltip-position');
          if (customPos === 'bottom') {
            y = rect.bottom;
            position = 'bottom';
          } else if (customPos === 'left') {
            x = rect.left;
            y = rect.top + rect.height / 2;
            position = 'left';
          } else if (customPos === 'right') {
            x = rect.right;
            y = rect.top + rect.height / 2;
            position = 'right';
          }

          setTooltip({
            visible: true,
            content,
            x,
            y,
            position
          });
        }
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = setTimeout(() => {
        setTooltip(prev => ({ ...prev, visible: false }));
      }, 50); // slight delay to prevent flicker
    };

    const handleScroll = () => {
      setTooltip(prev => ({ ...prev, visible: false }));
    };

    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);
    document.addEventListener('scroll', handleScroll, true); 

    return () => {
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      document.removeEventListener('scroll', handleScroll, true);
    };
  }, []);

  if (!tooltip.visible || !tooltip.content) return null;

  return createPortal(
    <div 
      className={`tooltip-content ${tooltip.position} global-tooltip-portal`}
      style={{
        position: 'fixed',
        left: tooltip.x,
        top: tooltip.y,
        bottom: 'auto',
        right: 'auto',
        margin: 0,
        opacity: 1,
        visibility: 'visible',
        zIndex: 9999999,
        pointerEvents: 'none',
        transform: tooltip.position === 'top' 
          ? 'translateX(-50%) translateY(calc(-100% - 8px)) scale(1)' 
          : tooltip.position === 'bottom'
            ? 'translateX(-50%) translateY(8px) scale(1)'
            : tooltip.position === 'left'
              ? 'translateY(-50%) translateX(calc(-100% - 8px)) scale(1)'
              : 'translateY(-50%) translateX(8px) scale(1)'
      }}
    >
      {tooltip.content}
    </div>,
    document.body
  );
};
