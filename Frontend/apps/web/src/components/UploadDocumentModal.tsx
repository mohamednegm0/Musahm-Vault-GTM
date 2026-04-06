import React, { useState, useEffect } from 'react';
import { X, Upload, File as FileIcon, Plus, Check } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import './UploadDocumentModal.css';
import { getAllDocumentTypes, createDocumentType, DocumentTypeDto } from '../api/documentTypes';

interface UploadDocumentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpload: (data: {
        title: string;
        documentType: string;
        status: string;
        tags: string[];
        file: File;
    }) => Promise<void>;
}

const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({
    isOpen,
    onClose,
    onUpload
}) => {
    const { t, language } = useLanguage();
    const [title, setTitle] = useState('');
    const [status, setStatus] = useState('Draft');
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [documentTypes, setDocumentTypes] = useState<DocumentTypeDto[]>([]);
    const [selectedDocumentType, setSelectedDocumentType] = useState('');

    const [isCreatingDocType, setIsCreatingDocType] = useState(false);
    const [newDocType, setNewDocType] = useState({ nameEn: '', nameAr: '' });
    const [docTypeErrors, setDocTypeErrors] = useState<{ nameEn?: string; nameAr?: string }>({});
    const [docTypeCreating, setDocTypeCreating] = useState(false);

    useEffect(() => {
        const fetchTypes = async () => {
            try {
                const types = await getAllDocumentTypes();
                setDocumentTypes(types);
            } catch (e) {
                console.error(e);
            }
        };
        fetchTypes();
    }, []);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setTitle('');
            setStatus('Draft');
            setTags([]);
            setTagInput('');
            setFile(null);
            setError(null);
            setLoading(false);
            setSelectedDocumentType('');
            setIsCreatingDocType(false);
            setNewDocType({ nameEn: '', nameAr: '' });
            setDocTypeErrors({});
        }
    }, [isOpen]);

    const handleCreateDocType = async () => {
        const errors: { nameEn?: string; nameAr?: string } = {};

        if (!newDocType.nameEn) {
            errors.nameEn = language === 'ar' ? 'مطلوب' : 'Required';
        } else if (!/^[A-Za-z0-9\s\-_]+$/.test(newDocType.nameEn)) {
            errors.nameEn = language === 'ar' ? 'يجب أن يحتوي على حروف إنجليزية فقط' : 'English characters only';
        } else if (documentTypes.some(d => d.nameEn?.toLowerCase() === newDocType.nameEn.toLowerCase())) {
            errors.nameEn = language === 'ar' ? 'الاسم موجود بالفعل' : 'Name already exists';
        }

        if (!newDocType.nameAr) {
            errors.nameAr = language === 'ar' ? 'مطلوب' : 'Required';
        } else if (!/^[\u0600-\u06FF0-9\s\-_]+$/.test(newDocType.nameAr)) {
            errors.nameAr = language === 'ar' ? 'يجب أن يحتوي على حروف عربية فقط' : 'Arabic characters only';
        } else if (documentTypes.some(d => d.nameAr === newDocType.nameAr)) {
            errors.nameAr = language === 'ar' ? 'الاسم موجود بالفعل' : 'Name already exists';
        }

        if (Object.keys(errors).length > 0) {
            setDocTypeErrors(errors);
            return;
        }

        setDocTypeErrors({});
        setDocTypeCreating(true);
        try {
            const created = await createDocumentType({
                nameEn: newDocType.nameEn,
                nameAr: newDocType.nameAr,
                code: newDocType.nameEn.toLowerCase().replace(/[^a-z0-9]/g, '_'),
                isActive: true,
            });
            setDocumentTypes(prev => [...prev, created]);
            setSelectedDocumentType(created.id);
            setIsCreatingDocType(false);
            setNewDocType({ nameEn: '', nameAr: '' });
        } catch (e) {
            console.error(e);
            setDocTypeErrors({ nameEn: language === 'ar' ? 'حدث خطأ' : 'Error creating type' });
        } finally {
            setDocTypeCreating(false);
        }
    };

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

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            // Auto-populate title if empty
            if (!title) {
                const fileName = selectedFile.name.split('.').slice(0, -1).join('.');
                setTitle(fileName);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !title) return;

        try {
            setLoading(true);
            setError(null);

            await onUpload({
                title,
                documentType: selectedDocumentType,
                status,
                tags,
                file
            });

            onClose();
        } catch (err) {
            console.error('Upload error:', err);
            setError(t('uploadError'));
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
                    <h2 className="upload-title">{t('uploadDocument')}</h2>
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

                    <form id="upload-form" onSubmit={handleSubmit} className="form-group">
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
                            <label className="form-label">{t('documentType')}</label>
                            <select
                                className="form-select"
                                value={selectedDocumentType}
                                onChange={(e) => setSelectedDocumentType(e.target.value)}
                                required
                            >
                                <option value="">{t('selectDocumentType')}</option>
                                {documentTypes.map(type => (
                                    <option key={type.id} value={type.id}>
                                        {language === 'ar' ? type.nameAr : type.nameEn}
                                    </option>
                                ))}
                            </select>

                            {!isCreatingDocType ? (
                                <button
                                    type="button"
                                    className="add-doctype-btn"
                                    onClick={() => setIsCreatingDocType(true)}
                                >
                                    <Plus size={14} />
                                    {language === 'ar' ? 'إضافة نوع جديد' : 'Add new type'}
                                </button>
                            ) : (
                                <div className="new-doctype-form">
                                    <div className="new-doctype-fields">
                                        <div className="new-doctype-field">
                                            <label className="form-label">{language === 'ar' ? 'الاسم بالإنجليزية' : 'English name'}</label>
                                            <input
                                                type="text"
                                                className={`form-input${docTypeErrors.nameEn ? ' input-error' : ''}`}
                                                value={newDocType.nameEn}
                                                onChange={(e) => setNewDocType(p => ({ ...p, nameEn: e.target.value }))}
                                            />
                                            {docTypeErrors.nameEn && <span className="field-error">{docTypeErrors.nameEn}</span>}
                                        </div>
                                        <div className="new-doctype-field">
                                            <label className="form-label">{language === 'ar' ? 'الاسم بالعربية' : 'Arabic name'}</label>
                                            <input
                                                type="text"
                                                className={`form-input${docTypeErrors.nameAr ? ' input-error' : ''}`}
                                                value={newDocType.nameAr}
                                                onChange={(e) => setNewDocType(p => ({ ...p, nameAr: e.target.value }))}
                                                dir="rtl"
                                            />
                                            {docTypeErrors.nameAr && <span className="field-error">{docTypeErrors.nameAr}</span>}
                                        </div>
                                    </div>
                                    <div className="new-doctype-actions">
                                        <button
                                            type="button"
                                            className="doctype-save-btn"
                                            onClick={handleCreateDocType}
                                            disabled={docTypeCreating}
                                        >
                                            <Check size={14} />
                                            {language === 'ar' ? 'حفظ' : 'Save'}
                                        </button>
                                        <button
                                            type="button"
                                            className="doctype-cancel-btn"
                                            onClick={() => { setIsCreatingDocType(false); setDocTypeErrors({}); setNewDocType({ nameEn: '', nameAr: '' }); }}
                                            disabled={docTypeCreating}
                                        >
                                            <X size={14} />
                                            {language === 'ar' ? 'إلغاء' : 'Cancel'}
                                        </button>
                                    </div>
                                </div>
                            )}
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

                        <div className="form-group">
                            <label className="form-label">{t('file')}</label>
                            <div className="file-input-wrapper">
                                <input
                                    type="file"
                                    className="file-input"
                                    onChange={handleFileChange}
                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.odt,.ods,.odp,.rtf,.txt,.csv,.png,.jpg,.jpeg,.gif,.bmp,.tiff,.tif,.webp,.svg,.json,.xml,.zip,.rar,.7z"
                                    required
                                />
                                {file ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                        <FileIcon size={32} color="var(--primary-color, #2563eb)" />
                                        <span className="selected-file-name">{file.name}</span>
                                        <span style={{ fontSize: '12px', color: '#64748b' }}>
                                            {(file.size / 1024 / 1024).toFixed(2)} MB
                                        </span>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                        <Upload size={32} color="#64748b" />
                                        <span style={{ color: '#64748b' }}>{t('clickToUpload')}</span>
                                    </div>
                                )}
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
                        form="upload-form"
                        className="upload-btn"
                        disabled={!file || !title || loading}
                    >
                        {loading ? t('uploading') : t('upload')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UploadDocumentModal;
