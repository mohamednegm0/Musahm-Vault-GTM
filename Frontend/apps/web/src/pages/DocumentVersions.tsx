import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Clock, Eye, Download, Trash2, Upload, FileText } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import Breadcrumb from '../components/Breadcrumb';
import {
    DocumentVersion,
    getDocumentVersions,
    deleteDocumentVersion,
    downloadDocumentVersion,
    uploadDocumentVersion
} from '../api/documentVersions';
import { getWorkspaceById } from '../api/workspaces';
import { getDocumentById } from '../api/documents';
import { useConfirm } from '../contexts/ConfirmContext';
import './DocumentVersions.css';
import EmptyState from '../components/EmptyState';

const DocumentVersions: React.FC = () => {
    const navigate = useNavigate();
    const { documentId } = useParams<{ documentId: string }>();
    const { t } = useLanguage();
    const { success, error } = useToast();
    const { confirm } = useConfirm();
    const location = useLocation();

    const [versions, setVersions] = useState<DocumentVersion[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [workspaceName, setWorkspaceName] = useState<string>('');
    const [documentData, setDocumentData] = useState<any>(location.state?.document || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const documentName = documentData?.name || documentData?.title || t('document') + ' ' + (documentId || '');

    useEffect(() => {
        loadVersions();
    }, [documentId]);

    const loadVersions = async () => {
        if (!documentId) return;
        try {
            setLoading(true);
            const data = await getDocumentVersions(documentId);
            setVersions(data);

            // Fetch doc/workspace info if needed
            if (!documentData || !documentData.workspace_id) {
                const doc = await getDocumentById(documentId);
                setDocumentData(doc);
                if (doc.workspace_id) {
                    const ws = await getWorkspaceById(doc.workspace_id);
                    setWorkspaceName(ws.name || '');
                }
            } else if (documentData.workspace_id && !workspaceName) {
                const ws = await getWorkspaceById(documentData.workspace_id);
                setWorkspaceName(ws.name || '');
            }

        } catch (err) {
            console.error('Failed to load versions', err);
            error(t('versionsLoadError') || 'Failed to load document versions');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (version: DocumentVersion) => {
        try {
            const blob = await downloadDocumentVersion(version.id);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = version.file_name;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            console.error('Download failed', err);
            error(t('downloadError') || 'Failed to download version');
        }
    };

    const handleDelete = async (version: DocumentVersion) => {
        confirm({
            title: t('delete'),
            message: t('confirmDeleteVersion') || 'Are you sure you want to delete this version?',
            confirmText: t('delete'),
            cancelText: t('cancel'),
            type: 'danger',
            onConfirm: async () => {
                try {
                    await deleteDocumentVersion(version.id);
                    success(t('versionDeleted') || 'Version deleted successfully');
                    loadVersions(); // Refresh list
                } catch (err) {
                    console.error('Delete failed', err);
                    error(t('deleteError') || 'Failed to delete version');
                }
            }
        });
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && documentId) {
            const file = e.target.files[0];
            try {
                setUploading(true);
                await uploadDocumentVersion(documentId, file);
                success(t('versionUploaded') || 'New version uploaded successfully');
                loadVersions();
            } catch (err) {
                console.error('Upload failed', err);
                error(t('uploadError') || 'Failed to upload version');
            } finally {
                setUploading(false);
                if (fileInputRef.current) {
                    fileInputRef.current.value = ''; // Reset input
                }
            }
        }
    };

    // Format file size
    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="document-versions">
            <div className="versions-container">
                <div className="breadcrumb-container">
                    <Breadcrumb
                        items={[
                            { label: t('home'), onClick: () => navigate('/') },
                            { label: workspaceName || 'Workspace', onClick: () => navigate(`/workspace/${documentData?.workspace_id || ''}`) },
                            { label: t('versionHistory') + ' - ' + documentName }
                        ]}
                    />
                </div>

                <div className="versions-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button onClick={() => navigate(-1)} className="back-button">
                            <ArrowLeft size={20} />
                        </button>
                        <div className="header-info">
                            <h1 className="versions-title" style={{ margin: '0' }}>{t('versionHistory')}</h1>
                            {/* <p className="document-id">{t('id')}: {documentId}</p> */}
                        </div>
                    </div>
                    <div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.odt,.ods,.odp,.rtf,.txt,.csv,.png,.jpg,.jpeg,.gif,.bmp,.tiff,.tif,.webp,.svg,.json,.xml,.zip,.rar,.7z"
                            onChange={handleFileChange}
                        />
                        <button
                            className="upload-version-btn"
                            onClick={handleUploadClick}
                            disabled={uploading}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                padding: '8px 16px', borderRadius: '8px', border: 'none',
                                backgroundColor: 'var(--primary-color, #2563eb)', color: 'white',
                                cursor: 'pointer', fontWeight: 500
                            }}
                        >
                            {uploading ? (
                                <span>{t('uploading')}</span>
                            ) : (
                                <>
                                    <Upload size={18} />
                                    <span>{t('uploadNewVersion')}</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="loading-state" style={{ padding: '40px', textAlign: 'center' }}>
                        {t('loading') || 'Loading...'}
                    </div>
                ) : versions.length === 0 ? (
                    <EmptyState
                        icon={Clock}
                        title={t('noVersions') || 'No versions found'}
                        description={t('noVersionsDescription') || 'This document has no version history yet.'}
                    />
                ) : (
                    <div className="versions-list">
                        {versions.map((version, index) => (
                            <div key={version.id} className={`version-item ${index === 0 ? 'current' : ''}`}>
                                <div className="version-icon">
                                    <FileText size={24} />
                                </div>

                                <div className="version-details">
                                    <div className="version-info-row">
                                        <span className="version-number">v{version.version}</span>
                                        {index === 0 && <span className="current-badge">{t('latest')}</span>}
                                        <span className="version-date">
                                            {version.created_at ? new Date(version.created_at).toLocaleString() : '-'}
                                        </span>
                                    </div>
                                    <div className="version-meta">
                                        {/* <span>{t('by') || 'By'} {version.createdByName || 'Unknown'}</span>
                                        <span className="separator">•</span> */}
                                        <span>{formatSize(version.file_size)}</span>
                                        <span className="separator">•</span>
                                        <span style={{ fontSize: '12px', padding: '2px 6px', background: '#e2e8f0', borderRadius: '4px' }}>
                                            {version.file_name}
                                        </span>
                                    </div>
                                </div>

                                <div className="version-actions">
                                    {/* Preview could be implemented if supported */}
                                    <button
                                        className="action-btn"
                                        data-tooltip-content={t('download')}
                                        onClick={() => handleDownload(version)}
                                    >
                                        <Download size={18} />
                                    </button>
                                    <button
                                        className="action-btn restore-btn"
                                        data-tooltip-content={t('delete')}
                                        onClick={() => handleDelete(version)}
                                        style={{ color: '#ef4444' }}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DocumentVersions;
