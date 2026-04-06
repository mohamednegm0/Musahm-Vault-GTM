import React, { useState, useEffect } from 'react';
import { X, Plus, Folder } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { workspaceService, WorkspaceType } from '../services/workspaceService';
import { getTenantIdFromToken, validateToken } from '../utils/tokenUtils';
import { useWorkspace } from '../contexts/WorkspaceContext';

interface CreateWorkspaceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

const CreateWorkspaceModal: React.FC<CreateWorkspaceModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const { t } = useLanguage();
    const { refreshWorkspaces } = useWorkspace();

    const [workspaceName, setWorkspaceName] = useState('');
    // const [workspaceSlug, setWorkspaceSlug] = useState('');
    const [workspaceDescription, setWorkspaceDescription] = useState('');
    const [workspaceType, setWorkspaceType] = useState<WorkspaceType>(WorkspaceType.Board);
    const [workspacePrivacy, setWorkspacePrivacy] = useState('private');
    const [workspaceStorageLimit, setWorkspaceStorageLimit] = useState<number | string>(1000);
    const [workspaceAllowInvites, setWorkspaceAllowInvites] = useState(true);
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            resetForm();
        }
    }, [isOpen]);

    const resetForm = () => {
        setWorkspaceName('');
        // setWorkspaceSlug('');
        setWorkspaceDescription('');
        setWorkspaceType(WorkspaceType.Board);
        setWorkspacePrivacy('private');
        setWorkspaceStorageLimit(1000);
        setWorkspaceAllowInvites(true);
        setError('');
    };

    const handleAddWorkspace = async () => {
        setError('');
        if (!workspaceName.trim()) {
            setError(t('workspaceNameRequired'));
            return;
        }
        // if (!workspaceSlug.trim()) {
        //     setError(t('workspaceSlugRequired'));
        //     return;
        // }

        const tenantId = getTenantIdFromToken();
        const validation = validateToken();

        if (!tenantId) {
            setError(t('tenantIdNotFound'));
            return;
        }

        try {
            setIsSaving(true);
            const workspaceData = {
                name: workspaceName,
                // slug: workspaceSlug,
                description: workspaceDescription,
                type: workspaceType,
                retentionPolicyId: undefined,
                legalHold: false,
                settings: {
                    privacy: workspacePrivacy,
                    allowInvites: workspaceAllowInvites,
                    storageLimitMb: Number(workspaceStorageLimit) || 0
                }
            };

            await workspaceService.create(workspaceData);
            await refreshWorkspaces();

            if (onSuccess) onSuccess();
            onClose();
        } catch (error: any) {
            setError(error.message || error.response?.data?.errorMessage || t('errorCreatingWorkspace'));
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={(e) => {
            if (e.target === e.currentTarget) {
                onClose();
            }
        }}>
            <div className="workspace-modal workspace-modal-lg">
                <div className="modal-header">
                    <h2>{t('addWorkspace')}</h2>
                    <button className="modal-close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>
                <div className="modal-body">
                    <div className="form-group">
                        <label htmlFor="workspaceName">{t('workspaceName')} *</label>
                        <input
                            type="text"
                            id="workspaceName"
                            value={workspaceName}
                            onChange={(e) => {
                                setWorkspaceName(e.target.value);
                                setError('');
                            }}
                            placeholder={t('enterWorkspaceName')}
                            className={error && !workspaceName.trim() ? 'error' : ''}
                            disabled={isSaving}
                        />
                    </div>

                    {/* <div className="form-group">
                        <label htmlFor="workspaceSlug">{t('workspaceSlug')} *</label>
                        <input
                            type="text"
                            id="workspaceSlug"
                            value={workspaceSlug}
                            onChange={(e) => {
                                const slug = e.target.value.toLowerCase().replace(/\s+/g, '-');
                                setWorkspaceSlug(slug);
                                setError('');
                            }}
                            placeholder={t('workspaceSlugPlaceholder')}
                            className={error && !workspaceSlug.trim() ? 'error' : ''}
                            disabled={isSaving}
                        />
                        <small style={{ color: '#6b7280', marginTop: '4px' }}>{t('workspaceSlugHelp')}</small>
                    </div> */}

                    <div className="form-group">
                        <label htmlFor="workspaceDescription">{t('description')}</label>
                        <textarea
                            id="workspaceDescription"
                            value={workspaceDescription}
                            onChange={(e) => {
                                setWorkspaceDescription(e.target.value);
                                setError('');
                            }}
                            placeholder={t('enterDescription')}
                            disabled={isSaving}
                            rows={3}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontFamily: 'inherit',
                                resize: 'vertical',
                                outline: 'none',
                                transition: 'all 0.2s ease'
                            }}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="workspaceType">{t('workspaceType')} *</label>
                        <select
                            id="workspaceType"
                            value={workspaceType}
                            onChange={(e) => setWorkspaceType(e.target.value as WorkspaceType)}
                            disabled={isSaving}
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px',
                                fontSize: '14px',
                                outline: 'none',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <option value={WorkspaceType.Board}>{t('board')}</option>
                            <option value={WorkspaceType.Legal}>{t('legal')}</option>
                            <option value={WorkspaceType.Compliance}>{t('compliance')}</option>
                            <option value={WorkspaceType.HR}>{t('hr')}</option>
                            <option value={WorkspaceType.Projects}>{t('projects')}</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="workspacePrivacy">{t('workspacePrivacy')} *</label>
                        <select
                            id="workspacePrivacy"
                            value={workspacePrivacy}
                            onChange={(e) => setWorkspacePrivacy(e.target.value)}
                            disabled={isSaving}
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px',
                                fontSize: '14px',
                                outline: 'none',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <option value="private">{t('private')}</option>
                            <option value="internal">{t('internal')}</option>
                            <option value="public">{t('public')}</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="workspaceStorage">{t('workspaceStorage')}</label>
                        <input
                            type="number"
                            id="workspaceStorage"
                            value={workspaceStorageLimit}
                            onChange={(e) => {
                                const val = e.target.value;
                                setWorkspaceStorageLimit(val === '' ? '' : Math.max(0, parseInt(val) || 0));
                            }}
                            placeholder="1000"
                            min="0"
                            disabled={isSaving}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px',
                                fontSize: '14px',
                                outline: 'none',
                                transition: 'all 0.2s ease'
                            }}
                        />
                    </div>

                    <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '12px' }}>
                        <input
                            type="checkbox"
                            id="allowInvites"
                            checked={workspaceAllowInvites}
                            onChange={(e) => setWorkspaceAllowInvites(e.target.checked)}
                            disabled={isSaving}
                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                        <label htmlFor="allowInvites" style={{ margin: 0, cursor: 'pointer' }}>{t('allowInvitesLabel')}</label>
                    </div>

                    {error && <span className="error-message" style={{ marginTop: '12px' }}>{error}</span>}
                </div>
                <div className="modal-footer">
                    <button className="btn-cancel" onClick={onClose} disabled={isSaving}>
                        {t('cancel')}
                    </button>
                    <button className="btn-add" onClick={handleAddWorkspace} disabled={isSaving}>
                        {isSaving ? t('saving') : t('add')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateWorkspaceModal;
