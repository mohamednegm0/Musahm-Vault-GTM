import React from 'react';
import { LucideIcon } from 'lucide-react';
import './DocumentsLayout.css';

export interface PageHeaderProps {
  title: string;
  icon?: LucideIcon;
  iconColor?: string;
  subtitle?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  icon: Icon,
  iconColor = '#C3924D',
  subtitle,
}) => {
  return (
    <div className="workspace-title">
      <h1 style={{ fontSize: '1.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.75rem', margin: 0, color: '#00295B' }}>
        {Icon && <Icon size={28} color={iconColor} />}
        {title}
      </h1>
      {subtitle && <p className="header-subtitle">{subtitle}</p>}
    </div>
  );
};

export default PageHeader;
