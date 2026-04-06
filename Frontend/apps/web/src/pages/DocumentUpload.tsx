import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, File, X, Check } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import Breadcrumb from '../components/Breadcrumb';
import './DocumentUpload.css';

import { getAllDocumentTypes, DocumentTypeDto } from '../api/documentTypes';

const DocumentUpload: React.FC = () => {
    const navigate = useNavigate();
    const { t, language } = useLanguage();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        name: '',
        documentTypeId: '',
        description: '',
    });
    const [documentTypes, setDocumentTypes] = useState<DocumentTypeDto[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    useEffect(() => {
        const fetchDocumentTypes = async () => {
            try {
                const types = await getAllDocumentTypes();
                setDocumentTypes(types);
            } catch (error) {
                console.error("Failed to load document types", error);
            }
        };
        fetchDocumentTypes();
    }, []);
    const [isDragOver, setIsDragOver] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileSelection(e.dataTransfer.files[0]);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFileSelection(e.target.files[0]);
        }
    };

    const handleFileSelection = (file: File) => {
        setSelectedFile(file);
        // Auto-fill name if empty
        if (!formData.name) {
            setFormData(prev => ({ ...prev, name: file.name }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile) return;

        setIsSubmitting(true);

        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            navigate('/');
        }, 1500);
    };

    return (
        <div className="document-upload">
            <div className="upload-container">
                <div className="breadcrumb-container" style={{ marginBottom: '24px' }}>
                    <Breadcrumb
                        items={[
                            { label: t('home'), onClick: () => navigate('/') },
                            { label: t('uploadDocument') }
                        ]}
                    />
                </div>

                <div className="upload-header">
                    <button onClick={() => navigate(-1)} className="back-button">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="upload-title">{t('uploadNewDocument')}</h1>
                </div>

                <form className="upload-form" onSubmit={handleSubmit}>
                    {/* File Drop Zone */}
                    <div
                        className={`file-drop-zone ${isDragOver ? 'active' : ''}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.odt,.ods,.odp,.rtf,.txt,.csv,.png,.jpg,.jpeg,.gif,.bmp,.tiff,.tif,.webp,.svg,.json,.xml,.zip,.rar,.7z"
                            style={{ display: 'none' }}
                        />

                        <Upload size={48} className="upload-icon" />
                        <p className="drop-text">{t('dragDropFile')}</p>
                        <p className="drop-subtext">{t('orClickToBrowse')}</p>
                    </div>

                    {selectedFile && (
                        <div className="selected-file">
                            <File size={24} className="text-primary" />
                            <div className="file-info">
                                <span className="file-name">{selectedFile.name}</span>
                                <span className="file-size">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                            </div>
                            <button
                                type="button"
                                className="remove-file"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedFile(null);
                                }}
                            >
                                <X size={20} />
                            </button>
                        </div>
                    )}

                    {/* Form Fields */}
                    <div className="form-group">
                        <label className="form-label">{t('documentName')}</label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder={t('enterDocumentName')}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">{t('documentType') || 'Document Type'}</label>
                        <select
                            className="form-select"
                            value={formData.documentTypeId}
                            onChange={e => setFormData({ ...formData, documentTypeId: e.target.value })}
                            required
                        >
                            <option value="">{t('selectDocumentType') || 'Select Document Type'}</option>
                            {documentTypes.map(type => (
                                <option key={type.id} value={type.id}>
                                    {language === 'ar' ? type.nameAr : type.nameEn}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">{t('description')}</label>
                        <textarea
                            className="form-textarea"
                            rows={4}
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            placeholder={t('enterDescription')}
                        />
                    </div>

                    {/* Actions */}
                    <div className="form-actions">
                        <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>
                            {t('cancel')}
                        </button>
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={!selectedFile || isSubmitting}
                        >
                            {isSubmitting ? (
                                <>...{t('uploading')}</>
                            ) : (
                                <>
                                    <Check size={18} />
                                    {t('upload')}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DocumentUpload;
