import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Download, X, FileText, Languages } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import './InvitationPreview.css';

const InvitationPreview: React.FC = () => {
    const { t, toggleLanguage, language } = useLanguage();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [fileUrl, setFileUrl] = useState<string>('');
    const [fileName, setFileName] = useState<string>('');
    const [contentType, setContentType] = useState<string>('');
    const [error, setError] = useState<string>('');

    useEffect(() => {
        // Retrieve document data from sessionStorage
        const documentDataStr = sessionStorage.getItem('invitationDocument');

        if (!documentDataStr) {
            setError('No document found');
            return;
        }

        try {
            const documentData = JSON.parse(documentDataStr);

            // Convert base64 file content to blob URL
            const base64Content = documentData.fileContent;
            const contentType = documentData.contentType || 'application/pdf';

            // Remove data URL prefix if present
            const base64Data = base64Content.includes(',')
                ? base64Content.split(',')[1]
                : base64Content;

            // Convert base64 to blob
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: contentType });

            // Create blob URL
            const url = URL.createObjectURL(blob);
            setFileUrl(url);
            setFileName(documentData.fileName || 'Shared Document');
            setContentType(contentType);

            // Cleanup function to revoke blob URL
            return () => {
                URL.revokeObjectURL(url);
                sessionStorage.removeItem('invitationDocument');
            };
        } catch (err) {
            console.error('Error loading document:', err);
            setError('Failed to load document');
        }
    }, []);

    const handleDownload = () => {
        if (!fileUrl) return;

        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleClose = () => {
        navigate('/login');
    };

    if (error) {
        return (
            <div className="invitation-preview-page">
                <div className="preview-error">
                    <FileText size={64} className="error-icon" />
                    <h2>{t('error')}</h2>
                    <p>{error}</p>
                    <button onClick={handleClose} className="btn-primary">
                        {t('goToLogin')}
                    </button>
                </div>
            </div>
        );
    }

    const isImage = contentType.startsWith('image/');
    const isPdf = contentType === 'application/pdf';

    return (
        <div className="invitation-preview-page">
            <button
                className="language-toggle"
                onClick={toggleLanguage}
            >
                <Languages size={20} />
                <span>{language === 'ar' ? 'EN' : 'ع'}</span>
            </button>

            <div className="preview-container">
                <div className="preview-header">
                    <div className="preview-title">
                        <FileText size={24} />
                        <h1>{fileName}</h1>
                    </div>
                    <div className="preview-actions">
                        <button onClick={handleDownload} className="action-btn download-btn">
                            <Download size={20} />
                            <span>{t('download')}</span>
                        </button>
                        <button onClick={handleClose} className="action-btn close-btn">
                            <X size={20} />
                            <span>{t('close')}</span>
                        </button>
                    </div>
                </div>

                <div className="preview-content">
                    {fileUrl && (
                        <>
                            {isPdf && (
                                <iframe
                                    src={fileUrl}
                                    className="pdf-viewer"
                                    title={fileName}
                                />
                            )}
                            {isImage && (
                                <div className="image-viewer">
                                    <img src={fileUrl} alt={fileName} />
                                </div>
                            )}
                            {!isPdf && !isImage && (
                                <div className="unsupported-preview">
                                    <FileText size={64} />
                                    <p>{t('previewNotAvailable')}</p>
                                    <button onClick={handleDownload} className="btn-primary">
                                        <Download size={20} />
                                        {t('downloadToView')}
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InvitationPreview;
