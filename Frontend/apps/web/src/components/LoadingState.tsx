import React from 'react';
import './LoadingState.css';
import { useLanguage } from '../contexts/LanguageContext';
import { Vault } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  subtext?: string;
  fullPage?: boolean;
}

const LoadingState: React.FC<LoadingStateProps> = ({ message, subtext, fullPage = false }) => {
  const { t } = useLanguage();

  return (
    <div className={`loading-overlay ${fullPage ? 'full-screen' : ''}`}>
      <div className="brand-loader">
        <div className="loader-rings"></div>
        <div className="brand-icon-wrapper">
          <Vault size={32} strokeWidth={2.5} />
        </div>
      </div>
      <div className="loading-text-wrapper">
        <h2 className="loading-text">{message || t('loading')}</h2>
        {subtext && <p className="loading-subtext">{subtext}</p>}
      </div>
    </div>
  );
};

export default LoadingState;
