import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Copy, Scissors, Share2, Clipboard } from 'lucide-react';
import './DropdownMenu.css';

export interface MenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export interface DropdownMenuProps {
  items: MenuItem[];
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  trigger?: React.ReactNode;
  tooltip?: string;
}

import { useLanguage } from '../contexts/LanguageContext';
import Tooltip from './Tooltip';

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  items,
  position = 'bottom-right',
  trigger,
  tooltip,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    // ... existing useEffect ...
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleItemClick = (item: MenuItem) => {
    if (!item.disabled) {
      item.onClick();
      setIsOpen(false);
    }
  };

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <div
      className="dropdown-menu-container"
      onDoubleClick={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <Tooltip content={tooltip}>
        <button
          ref={triggerRef}
          type="button"
          className="dropdown-menu-trigger"
          onClick={handleTriggerClick}
          aria-label={tooltip || t('openMenu')}
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          {trigger || <MoreVertical size={18} />}
        </button>
      </Tooltip>
      {isOpen && (
        <div
          ref={menuRef}
          className={`dropdown-menu ${position}`}
          role="menu"
        >
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`dropdown-menu-item ${item.disabled ? 'disabled' : ''} ${item.className || ''}`}
              onClick={() => handleItemClick(item)}
              disabled={item.disabled}
              role="menuitem"
            >
              {item.icon && <span className="menu-item-icon">{item.icon}</span>}
              <span className="menu-item-label">{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;
