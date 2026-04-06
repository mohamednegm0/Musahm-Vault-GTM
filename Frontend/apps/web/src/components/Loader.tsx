import React from 'react';
import { useLoading } from '../contexts/LoadingContext';
import './Loader.css';

const Loader: React.FC = () => {
    const { isLoading } = useLoading();

    if (!isLoading) return null;

    return (
        <div className="global-loader-overlay">
            <div className="loader-content">
                <div className="logo-container">
                    <div className="loader-ring"></div>
                    <img src="/images/logo.png" alt="Musahm Vault Logo" className="loading-logo" />
                </div>
                <div className="loading-text">Loading...</div>
            </div>
        </div>
    );
};

export default Loader;
