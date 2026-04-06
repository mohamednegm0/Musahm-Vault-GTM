import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import './UploadDocumentModal.css'; // Reuse styles
import { Document } from '../api/documents';
import { Background } from 'reactflow';

interface UpdateDocumentModalProps {
    isOpen: boolean;
    onClose: () => void;
    document: Document | null;
    onUpdate: (id: string, data: {
        title: string;
        status: string;
        tags: string[];
    }) => Promise<void>;
}

const UpdateDocumentModal: React.FC<UpdateDocumentModalProps> = ({
    isOpen,
    onClose,
    document,
    onUpdate
}) => {
    const { t, language } = useLanguage();
    const [title, setTitle] = useState('');
    const [status, setStatus] = useState('Draft');
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Reset state when modal opens or document changes
    useEffect(() => {
        if (isOpen && document) {
            setTitle(document.title || '');
            setStatus(document.status || 'Draft');
            setTags(document.tags || []);
            setTagInput('');
            setError(null);
            setLoading(false);
        }
    }, [isOpen, document]);

    const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const newTag = tagInput.trim();
            if (newTag && !tags.includes(newTag)) {
                setTags(prev => [...prev, newTag]);
                setTagInput('');
            }
        } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
            setTags(tags.slice(0, -1));
        }
    };

    const removeTag = (indexToRemove: number) => {
        setTags(tags.filter((_, index) => index !== indexToRemove));
    };

    if (!isOpen || !document) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title) return;

        try {
            setLoading(true);
            setError(null);

            await onUpdate(document.id, {
                title,
                status,
                tags
            });

            onClose();
        } catch (err) {
            console.error('Update error:', err);
            setError(t('updateError'));
        } finally {
            setLoading(false);
        }
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget && !loading) {
            onClose();
        }
    };

    return (
        <div className="upload-modal-overlay" onClick={handleOverlayClick}>
            <div className={`upload-modal ${language === 'ar' ? 'rtl' : ''}`} role="dialog" aria-modal="true">
                <div className="upload-header">
                    <h2 className="upload-title">{t('updateDocument')}</h2>
                    <button onClick={onClose} className="close-button" disabled={loading}>
                        <X size={20} />
                    </button>
                </div>

                <div className="upload-body">
                    {error && (
                        <div style={{ padding: '10px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '8px', fontSize: '14px' }}>
                            {error}
                        </div>
                    )}

                    <form id="update-form" onSubmit={handleSubmit} className="form-group">
                        <div className="form-group">
                            <label className="form-label">{t('title')}</label>
                            <input
                                type="text"
                                className="form-input"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder={t('enterTitle')}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">{t('status')}</label>
                            <select
                                className="form-select"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                            >
                                <option value="Draft">{t('Draft')}</option>
                                <option value="InReview">{t('InReview')}</option>
                                <option value="Approved">{t('Approved')}</option>
                                <option value="Signed">{t('Signed')}</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">{t('tags')} ({t('optional')})</label>
                            <div className="tags-input-container">
                                <div className="tags-list">
                                    {tags.map((tag, index) => (
                                        <div key={index} className="tag-chip">
                                            <span>{tag}</span>
                                            <button type="button" onClick={() => removeTag(index)} className="tag-remove-btn">
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <input
                                    type="text"
                                    className="tag-input-field"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={handleTagKeyDown}
                                    placeholder={tags.length === 0 ? t('enterTags') : ''}
                                />
                            </div>
                        </div>
                    </form>
                </div>

                <div className="upload-footer">
                    <button type="button" onClick={onClose} className="cancel-btn" disabled={loading}>
                        {t('cancel')}
                    </button>
                    <button
                        type="submit"
                        form="update-form"
                        className="upload-btn"
                        disabled={!title || loading}
                    >
                        {loading ? t('updating') : t('update')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UpdateDocumentModal;
