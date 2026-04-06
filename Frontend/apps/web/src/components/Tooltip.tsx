import React, { ReactNode } from 'react';
import './Tooltip.css';

interface TooltipProps {
  content: string | ReactNode;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'bottom-start' | 'bottom-end';
  className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({ 
  content, 
  children, 
  position = 'top',
  className = ''
}) => {
  if (!content) return <>{children}</>;

  return (
    <div className={`tooltip-container ${className}`}>
      {children}
      <div className={`tooltip-content ${position}`} role="tooltip">
        {content}
      </div>
    </div>
  );
};

export default Tooltip;
