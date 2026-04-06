import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, Search, Shield, User, ChevronDown } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getAllProfileUsers, ProfileUser } from '../api/profiles';
import { createDocumentAcl, updateDocumentAcl } from '../api/documentAcls';
import { useToast } from '../contexts/ToastContext';
import './UploadDocumentModal.css'; // Reusing modal styles if possible or common ones

interface AddPermissionModalProps {
    isOpen: boolean;
    onClose: () => void;
    documentId: string;
    onPermissionAdded: () => void;
}

const AddPermissionModal: React.FC<AddPermissionModalProps> = ({
    isOpen,
    onClose,
    documentId,
    onPermissionAdded
}) => {
    const { t, language } = useLanguage();
    const { success, error } = useToast();

    const [users, setUsers] = useState<ProfileUser[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState<ProfileUser | null>(null);

    const [loading, setLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadUsers();
        } else {
            setSearchQuery('');
            setSelectedUser(null);
        }
    }, [isOpen]);

    const loadUsers = async () => {
        setSearchLoading(true);
        try {
            const allUsers = await getAllProfileUsers();
            setUsers(allUsers);
        } catch (err) {
            console.error('Failed to load users', err);
        } finally {
            setSearchLoading(false);
        }
    };

    const handleAdd = async () => {
        if (!selectedUser || !documentId) return;

        setLoading(true);
        try {
            await createDocumentAcl({
                documentId,
                grcUserId: selectedUser.id,
                grcUserType: selectedUser.type
            });
            success(t('permissionAdded') || 'Permission added successfully');
            onPermissionAdded();
            onClose();
        } catch (err: any) {
            error(err.response?.data?.errorMessage || t('permissionAddFailed') || 'Failed to add permission');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.vaultUserId && u.vaultUserId.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return ReactDOM.createPortal(
        <div className="share-modal-overlay" onClick={onClose} style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 1000, padding: '20px'
        }}>
            <div className={`modal-content ${language === 'ar' ? 'rtl' : ''}`} onClick={e => e.stopPropagation()} style={{
                backgroundColor: 'white', borderRadius: '12px', width: '100%', maxWidth: '500px',
                display: 'flex', flexDirection: 'column', overflow: 'visible',
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)'
            }}>
                <div style={{ padding: '20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a', margin: 0 }}>
                        {t('addDocumentAccess') || 'Add Document Access'}
                    </h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                        <X size={20} />
                    </button>
                </div>

                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* User Search */}
                    <div style={{ position: 'relative' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#334155', marginBottom: '8px' }}>
                            {t('selectUser') || 'Select User'}
                        </label>
                        <div style={{
                            display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '8px',
                            padding: '10px 12px', gap: '10px', backgroundColor: '#fcfcfd'
                        }}>
                            <Search size={18} color="#94a3b8" />
                            <input
                                type="text"
                                placeholder={t('searchUsers') || 'Search users...'}
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    if (selectedUser) setSelectedUser(null);
                                }}
                                style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '14px' }}
                                autoFocus
                            />
                        </div>

                        {searchQuery && !selectedUser && (
                            <div style={{
                                position: 'absolute', top: '100%', left: 0, right: 0, maxHeight: '200px',
                                overflowY: 'auto', backgroundColor: 'white', border: '1px solid #e2e8f0',
                                borderRadius: '8px', marginTop: '4px', zIndex: 110, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
                            }}>
                                {searchLoading ? (
                                    <div style={{ padding: '12px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>{t('loading')}</div>
                                ) : filteredUsers.length > 0 ? (
                                    filteredUsers.map(user => (
                                        <div
                                            key={user.id}
                                            onClick={() => {
                                                setSelectedUser(user);
                                                setSearchQuery(user.name);
                                            }}
                                            style={{
                                                padding: '10px 15px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9',
                                                display: 'flex', alignItems: 'center', gap: '10px', transition: 'background-color 0.2s'
                                            }}
                                            className="user-option hover:bg-gray-50"
                                        >
                                            <div style={{
                                                width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#f1f5f9',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600, color: '#475569'
                                            }}>
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontSize: '14px', fontWeight: 500, color: '#0f172a' }}>{user.name}</span>
                                                <span style={{ fontSize: '12px', color: '#64748b' }}>{user.type}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ padding: '12px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
                                        {t('noUsersFound') || 'No users found'}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Permission Level removed as requested */}
                </div>

                <div style={{ padding: '20px', backgroundColor: '#f8fafc', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <button onClick={onClose} style={{
                        padding: '10px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: 'white',
                        fontSize: '14px', fontWeight: 500, color: '#475569', cursor: 'pointer'
                    }}>
                        {t('cancel')}
                    </button>
                    <button
                        onClick={handleAdd}
                        disabled={!selectedUser || loading}
                        style={{
                            padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#c3924d',
                            fontSize: '14px', fontWeight: 600, color: 'white', cursor: 'pointer',
                            opacity: (!selectedUser || loading) ? 0.6 : 1, transition: 'all 0.2s',
                            display: 'flex', alignItems: 'center', gap: '8px'
                        }}
                    >
                        {loading ? (t('saving') || 'Saving...') : (
                            <>
                                <Shield size={16} />
                                {t('grantAccess') || 'Grant Access'}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default AddPermissionModal;
