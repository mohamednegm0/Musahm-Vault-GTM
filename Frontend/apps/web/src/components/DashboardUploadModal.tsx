import React, { useState, useEffect } from 'react';
import { X, Upload, FileText, Folder } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getWorkspaces, Workspace } from '../api/workspaces';
import { uploadDocumentWithMetadata } from '../api/documents';
import '../styles/DashboardUploadModal.css';

interface DashboardUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const DashboardUploadModal: React.FC<DashboardUploadModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const { t } = useLanguage();
    const [title, setTitle] = useState('');
    const [workspaceId, setWorkspaceId] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetchingWorkspaces, setFetchingWorkspaces] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchWorkspaces();
            // Reset form
            setTitle('');
            setWorkspaceId('');
            setFile(null);
            setError(null);
        }
    }, [isOpen]);

    const fetchWorkspaces = async () => {
        try {
            setFetchingWorkspaces(true);
            const data = await getWorkspaces();
            setWorkspaces(data);
        } catch (err) {
            console.error('Failed to fetch workspaces', err);
            setError(t('errorLoadingWorkspaces'));
        } finally {
            setFetchingWorkspaces(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            // Auto-fill title if empty
            if (!title) {
                setTitle(e.target.files[0].name.replace(/\.[^/.]+$/, ""));
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !workspaceId || !title) {
            setError(t('fillAllFields'));
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const result = await uploadDocumentWithMetadata({
                Title: title,
                WorkspaceId: workspaceId,
                DocumentType: 'PDF',
                Status: 'InReview',
                Tags: ['ehe'],
                file: file
            });

            if (result.apiStatusCode === 200 || result.isSucceeded) {
                onSuccess();
                onClose();
            } else {
                setError(result.errorMessage || t('uploadError'));
            }
        } catch (err: any) {
            console.error('Upload failed', err);
            setError(err.errorMessage || t('uploadError'));
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>{t('uploadDocument')}</h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="upload-form">
                    {error && <div className="error-message">{error}</div>}

                    <div className="form-group">
                        <label>{t('documentTitle')}</label>
                        <div className="input-with-icon">
                            <FileText size={18} />
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder={t('enterTitle')}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>{t('workspace')}</label>
                        <div className="input-with-icon">
                            <Folder size={18} />
                            <select
                                value={workspaceId}
                                onChange={(e) => setWorkspaceId(e.target.value)}
                                required
                                disabled={fetchingWorkspaces}
                            >
                                <option value="">{t('selectWorkspace')}</option>
                                {workspaces.map(ws => (
                                    <option key={ws.id} value={ws.id}>
                                        {ws.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>{t('file')}</label>
                        <div className="file-input-wrapper">
                            <input
                                type="file"
                                onChange={handleFileChange}
                                required
                                id="file-upload"
                                className="hidden-input"
                                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.odt,.ods,.odp,.rtf,.txt,.csv,.png,.jpg,.jpeg,.gif,.bmp,.tiff,.tif,.webp,.svg,.json,.xml,.zip,.rar,.7z"
                            />
                            <label htmlFor="file-upload" className="file-drop-area">
                                <Upload size={24} />
                                <span>{file ? file.name : t('clickToUpload')}</span>
                            </label>
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={onClose}>
                            {t('cancel')}
                        </button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? t('uploading') : t('upload')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DashboardUploadModal;
