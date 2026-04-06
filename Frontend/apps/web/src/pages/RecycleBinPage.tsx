import React, { useEffect, useState } from 'react';
import { getDeletedItems, restoreItem, RecycleBinItem } from '../api/recycleBin';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../contexts/ConfirmContext';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { Trash2, RotateCcw, Folder, FileText, Server } from 'lucide-react';
import './RecycleBinPage.css';

const RecycleBinPage: React.FC = () => {
    const [items, setItems] = useState<RecycleBinItem[]>([]);
    const [loading, setLoading] = useState(false);
    const { t, language } = useLanguage();
    const { success, error } = useToast();
    const { confirm } = useConfirm();
    const { refreshWorkspaces } = useWorkspace();

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const data = await getDeletedItems();
            setItems(data);
        } catch (err: any) {
            console.error(err);
            error(t('errorLoadingRecycleBin') || 'Error loading recycle bin');
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async (item: RecycleBinItem) => {
        setLoading(true);
        try {
            await restoreItem(item.itemType, item.id);
            await refreshWorkspaces();
            success(t('Msg_RestoredSuccessfully') || 'Restored successfully');
            fetchItems();
        } catch (err: any) {
            error(err.response?.data?.errorMessages?.[0] || 'Error restoring item');
        } finally {
            setLoading(false);
        }
    };



    const getItemIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case 'workspace': return <Server size={20} className="meta-icon" />;
            case 'folder': return <Folder size={20} className="meta-icon" />;
            case 'document': return <FileText size={20} className="meta-icon" />;
            default: return <FileText size={20} className="meta-icon" />;
        }
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US');
    };

    return (
        <div className="page-container" style={{ padding: '24px' }}>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 className="page-title">{t('recycleBin') || (language === 'ar' ? 'سلة المهملات' : 'Recycle Bin')}</h1>
            </div>

            {loading && <div style={{ textAlign: 'center', padding: '20px' }}>{t('loading') || 'Loading...'}</div>}

            {!loading && items.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    <Trash2 size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                    <p>{t('recycleBinEmpty') || (language === 'ar' ? 'سلة المهملات فارغة' : 'Recycle Bin is empty')}</p>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: language === 'ar' ? 'right' : 'left' }}>
                                <th style={{ padding: '12px' }}>{t('name') || 'Name'}</th>
                                <th style={{ padding: '12px' }}>{t('type') || 'Type'}</th>
                                <th style={{ padding: '12px' }}>{t('deletedBy') || 'Deleted By'}</th>
                                <th style={{ padding: '12px' }}>{t('deletedAt') || 'Deleted At'}</th>
                                <th style={{ padding: '12px', textAlign: 'center' }}>{t('actions') || 'Actions'}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map(item => (
                                <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {getItemIcon(item.itemType)}
                                        <span style={{ fontWeight: 500 }}>{item.name}</span>
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                        {t(item.itemType.toLowerCase()) || item.itemType}
                                    </td>
                                    <td style={{ padding: '12px' }}>{item.deletedByName || item.deletedBy || '-'}</td>
                                    <td style={{ padding: '12px' }}>{formatDate(item.deletedAt)}</td>
                                    <td style={{ padding: '12px', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                            <button 
                                                className="btn-icon-sm" 
                                                style={{ color: '#10b981' }} 
                                                onClick={() => handleRestore(item)}
                                                data-tooltip-content={t('restore') || 'Restore'}
                                            >
                                                <RotateCcw size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default RecycleBinPage;
