import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import Breadcrumb from '../components/Breadcrumb';
import './WorkspaceSettings.css';

const WorkspaceSettings: React.FC = () => {
    const navigate = useNavigate();
    const { workspaceId } = useParams();
    const { t } = useLanguage();

    const [name, setName] = useState(t('workspaces') + ' ' + workspaceId);
    const [description, setDescription] = useState('Default workspace description');
    const [saving, setSaving] = useState(false);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        // Mock API call
        setTimeout(() => {
            setSaving(false);
            alert(t('settingsSaved'));
        }, 1000);
    };



    return (
        <div className="workspace-settings">
            <div className="settings-container">
                <div className="breadcrumb-container" style={{ marginBottom: '20px' }}>
                    <Breadcrumb
                        items={[
                            { label: t('home'), onClick: () => navigate('/') },
                            { label: t('workspace') + ' ' + workspaceId, onClick: () => navigate(`/workspace/${workspaceId}`) },
                            { label: t('settings') }
                        ]}
                    />
                </div>

                <div className="settings-header">
                    <h1>{t('workspaceSettings')}</h1>
                </div>

                <div className="settings-section">
                    <h3>{t('generalSettings')}</h3>
                    <form onSubmit={handleSave} className="settings-form">
                        <div className="form-group">
                            <label>{t('workspaceName')}</label>
                            <input
                                type="text"
                                className="form-input"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>{t('description')}</label>
                            <textarea
                                className="form-input"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={4}
                            />
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn-save" disabled={saving}>
                                <Save size={18} />
                                {saving ? t('saving') : t('saveChanges')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default WorkspaceSettings;
