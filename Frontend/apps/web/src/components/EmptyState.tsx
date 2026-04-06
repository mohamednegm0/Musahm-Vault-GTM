import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';
import './EmptyState.css';

interface EmptyStateProps {
  icon?: LucideIcon | React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon = Inbox,
  title,
  description,
  action,
  className = ''
}) => {
  return (
    <div className={`empty-state-container ${className}`} >
      <div className="empty-state-icon-wrapper">
        {React.isValidElement(icon) ? (
          // If it's already an element (like <Icon />), render it, potentially cloning to add props if needed, but usually just render.
          // However, we want to enforce the wrapper style.
          icon
        ) : (
          // If it's a component class/function
          React.createElement(icon as LucideIcon, { size: 40, strokeWidth: 1.5 })
        )}
      </div>
      <h3 className="empty-state-title">{title}</h3>
      {description && <p className="empty-state-description">{description}</p>}
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  );
};

export default EmptyState;
