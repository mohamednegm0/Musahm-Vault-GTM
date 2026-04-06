

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Shield, Plus, Trash2, Check, Search, Users as UsersIcon } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import Breadcrumb from '../components/Breadcrumb';
import EmptyState from '../components/EmptyState';
import { getAllProfileUsers, ProfileUser } from '../api/profiles';
import { getWorkspaceById } from '../api/workspaces';
import { getWorkspaceMemberDetails, inviteMember, deleteMember, updateMemberRole, WorkspaceMemberDetails } from '../api/workspaceMembers';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../contexts/ConfirmContext';
import './DocumentPermissions.css';

const WorkspaceInvite: React.FC = () => {
    const navigate = useNavigate();
    const { workspaceId } = useParams();
    const { t, language } = useLanguage();
    const { success, error } = useToast();
    const { confirm } = useConfirm();

    // Use WorkspaceMemberDetails for list
    const [permissions, setPermissions] = useState<WorkspaceMemberDetails[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newRole, setNewRole] = useState<string>('viewer');
    const [allUsers, setAllUsers] = useState<ProfileUser[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState<ProfileUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [workspaceName, setWorkspaceName] = useState<string>("");

    useEffect(() => {
        if (!workspaceId) return;
        getWorkspaceById(workspaceId).then(ws => {
            if ('nameAr' in ws && 'nameEn' in ws) {
                setWorkspaceName((language === 'ar' ? (ws as any).nameAr : (ws as any).nameEn) as string);
            } else {
                setWorkspaceName((ws.name || workspaceId) as string);
            }
        }).catch(() => setWorkspaceName(workspaceId || ''));
    }, [workspaceId, language]);

    useEffect(() => {
        const fetchAllUsers = async () => {
            try {
                const users = await getAllProfileUsers();
                setAllUsers(users);
            } catch (e) {
                console.error('Failed to load users', e);
            }
        };
        fetchAllUsers();
    }, []);

    useEffect(() => {
        const fetchSearchResults = async () => {
            if (!searchQuery || searchQuery.trim().length < 2) return;
            try {
                const results = await getAllProfileUsers(searchQuery);
                // Merge with existing users to avoid losing current selection if any
                setAllUsers(prev => {
                    const newUsers = [...prev];
                    results.forEach(r => {
                        if (!newUsers.find(u => u.id === r.id)) {
                            newUsers.push(r);
                        }
                    });
                    return newUsers;
                });
            } catch (err) {
                console.error('Search failed', err);
            }
        };

        const timer = setTimeout(fetchSearchResults, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        const fetchMembers = async () => {
            if (!workspaceId) return;
            setLoading(true);
            try {
                const members = await getWorkspaceMemberDetails(workspaceId);
                setPermissions(members);
            } catch (err) {
                console.error('Failed to load members', err);
                error(t('failedToLoadData') || 'Failed to load data');
            } finally {
                setLoading(false);
            }
        };
        fetchMembers();
    }, [workspaceId]);


    const handleRoleChange = async (userId: string, newRole: string) => {
        try {
            await updateMemberRole(userId, newRole);
            setPermissions(permissions.map(p =>
                p.id === userId ? { ...p, role: newRole } : p
            ));
            success(t('roleUpdatedSuccessfully') || 'Role updated successfully');
        } catch (err) {
            console.error('Failed to update role', err);
            error(t('failedToUpdateRole') || 'Failed to update role');
        }
    };

    const handleRemoveUser = async (userId: string) => {
        confirm({
            title: t('removeMember'),
            message: t('confirmRemoveUser') || 'Are you sure you want to remove this user?',
            confirmText: t('delete'),
            cancelText: t('cancel'),
            type: 'danger',
            onConfirm: async () => {
                try {
                    await deleteMember(userId);
                    setPermissions(permissions.filter(p => p.id !== userId));
                    success(t('memberRemovedSuccessfully') || 'Member removed successfully');
                } catch (err) {
                    console.error('Failed to remove member', err);
                    error(t('failedToRemoveMember') || 'Failed to remove member');
                }
            }
        });
    };

    const handleAddUser = async (e: React.FormEvent | React.MouseEvent) => {
        e.preventDefault();
        if (!selectedUser || !workspaceId) return;

        // Check if user already exists in current members
        // Note: selectedUser.id is a number, member.userId is usually a string GUID or similar depending on match
        // We might need to check standard ID or name match.
        // Let's assume we proceed and let API validation handle duplicates or check client side if possible.

        try {
            await inviteMember({
                workspaceId,
                grcUserId: selectedUser.id,
                grcUserType: selectedUser.type,
                role: newRole,
            });
            success(t('invitationSentSuccessfully') || 'Invitation sent successfully');

            // Refresh list
            const members = await getWorkspaceMemberDetails(workspaceId);
            setPermissions(members);

            setSelectedUser(null);
            setSearchQuery('');
            setShowAddModal(false);
        } catch (err) {
            console.error('Failed to invite user', err);
            error(t('failedToInviteUser') || 'Failed to invite user');
        }
    };

    return (
        <div className="document-permissions">
            <div className="permissions-container">
                <div className="breadcrumb-container">
                    <Breadcrumb
                        items={[
                            { label: t('home'), onClick: () => navigate('/') },
                            { label: t('workspace') + ' ' + (workspaceName || workspaceId), onClick: () => navigate(`/workspace/${workspaceId}`) },
                            { label: t('invite') }
                        ]}
                    />
                </div>

                <div className="permissions-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button onClick={() => navigate(-1)} className="back-button">
                            <ArrowLeft size={20} />
                        </button>
                        <div className="header-info">
                            <h1 className="permissions-title">{t('workspaceMembers')}</h1>
                            <p className="document-id">{t('workspace')}: {workspaceName || workspaceId}</p>
                        </div>
                    </div>
                    <button className="btn-primary add-user-btn" onClick={() => setShowAddModal(true)}>
                        <Plus size={18} />
                        {t('inviteUser')}
                    </button>
                </div>

                {/* Add User Modal/Form */}
                {showAddModal && (
                    <div className="add-user-modal">
                        <div className="modal-content" style={{ overflow: 'visible' }}>
                            <h3>{t('inviteToWorkspace')}</h3>
                            <form onSubmit={(e) => { e.preventDefault(); }}>
                                <div style={{ position: 'relative', marginBottom: '16px', width: '100%' }}>
                                    <div style={{
                                        display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0',
                                        borderRadius: '8px', padding: '8px 12px', gap: '8px'
                                    }}>
                                        <Search size={18} color="#94a3b8" />
                                        <input
                                            type="text"
                                            placeholder={t('searchUsers') || 'Search users...'}
                                            value={searchQuery}
                                            onChange={(e) => {
                                                setSearchQuery(e.target.value);
                                                setSelectedUser(null);
                                            }}
                                            style={{ border: 'none', outline: 'none', width: '100%' }}
                                            autoFocus
                                        />
                                    </div>
                                    {searchQuery && !selectedUser && (
                                        <div style={{
                                            position: 'absolute', top: '100%', left: 0, right: 0,
                                            maxHeight: '200px', overflowY: 'auto',
                                            backgroundColor: 'white', border: '1px solid #e2e8f0',
                                            borderRadius: '8px', marginTop: '4px', zIndex: 100,
                                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                                        }}>
                                            {allUsers.filter(u =>
                                                (u.nameEn && u.nameEn.toLowerCase().includes(searchQuery.toLowerCase())) ||
                                                (u.nameAr && u.nameAr.includes(searchQuery)) ||
                                                (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase()))
                                            ).length > 0 ? (
                                                allUsers.filter(u =>
                                                    (u.nameEn && u.nameEn.toLowerCase().includes(searchQuery.toLowerCase())) ||
                                                    (u.nameAr && u.nameAr.includes(searchQuery)) ||
                                                    (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase()))
                                                ).map(user => (
                                                    <div
                                                        key={user.id}
                                                        onClick={() => {
                                                            setSelectedUser(user);
                                                            setSearchQuery(language === 'ar' ? (user.nameAr || user.name || '') : (user.nameEn || user.name || ''));
                                                        }}
                                                        style={{
                                                            padding: '8px 12px', cursor: 'pointer',
                                                            borderBottom: '1px solid #f1f5f9',
                                                        }}
                                                        className="hover:bg-gray-50"
                                                    >
                                                        <div style={{ fontWeight: 500 }}>{language === 'ar' ? (user.nameAr || user.name) : (user.nameEn || user.name)}</div>
                                                        <div style={{ fontSize: '12px', color: '#64748b' }}>{user.type}</div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div style={{ padding: '12px', textAlign: 'center', color: '#64748b' }}>
                                                    {t('noUsersFound') || 'No users found'}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <select
                                    value={newRole}
                                    onChange={e => setNewRole(e.target.value)}
                                    className="role-select"
                                    style={{ marginBottom: '20px' }}
                                >
                                    <option value="admin">{t('Admin')}</option>
                                    <option value="editor">{t('Editor')}</option>
                                    <option value="viewer">{t('Viewer')}</option>
                                </select>
                                <div className="modal-actions" style={{ marginBottom: '20px' }}>
                                    <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary">
                                        {t('cancel')}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-primary"
                                        onClick={handleAddUser}
                                        disabled={!selectedUser}
                                        style={{ opacity: !selectedUser ? 0.5 : 1, cursor: !selectedUser ? 'not-allowed' : 'pointer' }}
                                    >
                                        {t('invite') || 'Invite'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                <div className="permissions-list">
                    {loading ? (
                        <div style={{ padding: '20px', textAlign: 'center' }}>{t('loading') || 'Loading...'}</div>
                    ) : permissions.length === 0 ? (
                        <EmptyState
                            title={t('noMembersFound') || 'No members found'}
                            description={t('noMembersFoundDescription') || 'Invite users to collaborate on this workspace.'}
                            icon={UsersIcon}
                        />
                    ) : (
                        <table className="permissions-table">
                            <thead>
                                <tr>
                                    <th>{t('name')}</th>
                                    <th>{t('role')}</th>
                                    <th>{t('actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {permissions.map((user) => (
                                    <tr key={user.id}>
                                        <td>
                                            <div className="user-info-cell">
                                                <div className="user-avatar-circle">
                                                    {(() => {
                                                        const name = language === 'ar' ? (user.nameAr || user.nameEn || user.name) : (user.nameEn || user.nameAr || user.name);
                                                        return (name || '?').charAt(0).toUpperCase();
                                                    })()}
                                                </div>
                                                <div className="user-text">
                                                    <span className="user-name-text">
                                                        {language === 'ar' ? (user.nameAr || user.nameEn || user.name) : (user.nameEn || user.nameAr || user.name)}
                                                    </span>
                                                    <span className="user-type-text">{user.type}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Shield size={16} color="#c3924d" />
                                                <select
                                                    value={user.role}
                                                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                    className="role-pill"
                                                    style={{ border: 'none', background: 'transparent', outline: 'none', cursor: 'pointer', padding: 0 }}
                                                >
                                                    <option value="admin">{t('Admin')}</option>
                                                    <option value="editor">{t('Editor')}</option>
                                                    <option value="viewer">{t('Viewer')}</option>
                                                </select>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="actions-cell">
                                                <button
                                                    className="btn-icon-action delete"
                                                    onClick={() => handleRemoveUser(user.id)}
                                                    data-tooltip-content={t('removeAccess')}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WorkspaceInvite;
