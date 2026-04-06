import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Search, Shield } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import Breadcrumb from '../components/Breadcrumb';
import { getDocumentById } from '../api/documents';
import { getWorkspaceById } from '../api/workspaces';
import { getWorkspaceMemberDetails, WorkspaceMemberDetails } from '../api/workspaceMembers';
import { getDocumentAcls, createDocumentAcl, updateDocumentAcl, deleteDocumentAcl, DocumentAcl } from '../api/documentAcls';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../contexts/ConfirmContext';
import './DocumentPermissions.css';
import EmptyState from '../components/EmptyState';

interface UserPermission {
    id: string; // This will vary: 'owner' for owner, or acl.id for others
    userId: string;
    name: string;
    email: string; // or fallback
    role: string;
    avatar?: string;
    isOwner?: boolean;
}

const DocumentPermissions: React.FC = () => {
    const navigate = useNavigate();
    const { documentId } = useParams();
    const location = useLocation();
    const { t } = useLanguage();
    const { success, error } = useToast();
    const { confirm } = useConfirm();

    const [documentData, setDocumentData] = useState<any>(location.state?.document || null);
    const [workspaceName, setWorkspaceName] = useState<string>('');
    const [permissions, setPermissions] = useState<UserPermission[]>([]);
    const [loading, setLoading] = useState(true);

    const [showAddModal, setShowAddModal] = useState(false);
    const [newRole, setNewRole] = useState<'viewer' | 'editor'>('viewer');

    // User Search State
    const [workspaceMembers, setWorkspaceMembers] = useState<WorkspaceMemberDetails[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState<WorkspaceMemberDetails | null>(null);

    // Initial Data Load
    useEffect(() => {
        const loadData = async () => {
            if (!documentId) return;
            setLoading(true);
            try {
                // 1. Ensure we have document data (need workspaceId)
                let doc = documentData;
                if (!doc || !doc.workspace_id) {
                    doc = await getDocumentById(documentId);
                    setDocumentData(doc);
                }

                if (doc && doc.workspace_id) {
                    // Fetch Workspace Name
                    try {
                        const ws = await getWorkspaceById(doc.workspace_id);
                        setWorkspaceName(ws.name || '');
                    } catch (e) {
                        console.error("Failed to fetch workspace", e);
                    }

                    // 2. Fetch Workspace Members (for name resolution and search)
                    const members = await getWorkspaceMemberDetails(doc.workspace_id);
                    setWorkspaceMembers(members);

                    // 3. Fetch ACLs
                    const acls = await getDocumentAcls(documentId);

                    // 4. Map to UI State
                    const mappedPermissions: UserPermission[] = [];

                    // Optional: Add Owner if not in ACLs (logic depends on backend, assuming owner is separate)
                    // If backend includes owner in ACLs, this might duplicate. 
                    // For now, relying on ACLs list as "Invited Users".
                    // If we want to show owner, we can check doc.owner_user_id against members.

                    if (doc.owner_user_id) {
                        const ownerMember = members.find(m => m.userId === doc.owner_user_id);
                        mappedPermissions.push({
                            id: 'owner',
                            userId: doc.owner_user_id,
                            name: ownerMember ? (ownerMember.nameEn || ownerMember.nameAr) : 'Owner',
                            email: ownerMember ? '' : '', // Email might not be in details, stick to name
                            role: 'owner',
                            isOwner: true
                        });
                    }

                    acls.forEach(acl => {
                        // Avoid adding owner again if in ACLs (though typically owner isn't an ACL)
                        if (acl.userId === doc.owner_user_id) return;

                        const member = members.find(m => m.userId === acl.userId);
                        mappedPermissions.push({
                            id: acl.id || `temp-${acl.userId}`,
                            userId: acl.userId || '',
                            name: member ? (member.nameEn || member.nameAr) : (acl.userId || 'Unknown'),
                            email: '',
                            role: acl.permission,
                            isOwner: false
                        });
                    });

                    setPermissions(mappedPermissions);
                }
            } catch (err) {
                console.error("Error loading permissions data", err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [documentId]);

    const handleRoleChange = async (userId: string, newRole: string, aclId: string) => {
        // As per instructions, we use POST to add/update permissions.
        // If we need to update, likely we call the same endpoint or a specific one.
        // Since `createDocumentAcl` is mapped to POST, and usually permissions are upserted or replaced:
        if (!documentId) return;

        try {
            // Optimistic update
            setPermissions(prev => prev.map(p => p.userId === userId ? { ...p, role: newRole } : p));

            // Call API (PUT)
            await updateDocumentAcl({
                documentId,
                userId,
                permission: newRole
            });
            success(t('permissionUpdated') || 'Permissions updated successfully');

        } catch (err) {
            console.error("Failed to update role", err);
            // Revert on failure
            setPermissions(prev => prev.map(p => p.userId === userId ? { ...p, role: newRole === 'viewer' ? 'editor' : 'viewer' } : p)); // Simple revert approximation
            error(t('permissionUpdateFailed') || 'Failed to update permissions');
        }
    };

    const handleRemoveUser = async (user: UserPermission) => {
        confirm({
            title: t('removeAccess'),
            message: t('confirmRemoveUser') || 'Are you sure you want to remove this user?',
            confirmText: t('remove'), // Or 'delete' if 'remove' key doesn't exist, checking keys... 'removeMember' exists, let's use t('delete') or add 'remove'
            cancelText: t('cancel'),
            type: 'danger',
            onConfirm: async () => {
                try {
                    // Use ACL ID to delete
                    if (user.id && user.id !== 'owner') {
                        await deleteDocumentAcl(user.id);
                        setPermissions(prev => prev.filter(p => p.id !== user.id));
                        success(t('userRemoved') || 'User removed successfully');
                    }
                } catch (err) {
                    console.error("Failed to remove user", err);
                    error(t('removeUserFailed') || 'Failed to remove user');
                }
            }
        });
    };

    const handleAddUser = async (e: React.FormEvent | React.MouseEvent) => {
        e.preventDefault();
        if (!selectedUser || !documentId) return;

        // Check if already exists
        if (permissions.some(p => p.userId === selectedUser.userId)) {
            error(t('userAlreadyHasAccess') || 'User already has access');
            return;
        }

        try {
            const newAcl = await createDocumentAcl({
                documentId,
                userId: selectedUser.userId,
                permission: newRole
            });

            // Add to list
            const newUser: UserPermission = {
                id: newAcl.id || `new-${Date.now()}`,
                userId: selectedUser.userId,
                name: selectedUser.nameEn || selectedUser.nameAr,
                email: '',
                role: newRole, // or newAcl.permission
                isOwner: false
            };
            setPermissions([...permissions, newUser]);
            success(t('userAdded') || 'User added successfully');

            // Reset
            setSelectedUser(null);
            setSearchQuery('');
            setShowAddModal(false);
        } catch (err) {
            console.error("Failed to add user", err);
            error(t('addUserFailed') || 'Failed to add user');
        }
    };

    const docName = documentData?.title || documentData?.name || t('document');

    if (loading && permissions.length === 0) {
        return <div className="document-permissions"><div className="permissions-container">Loading...</div></div>;
    }

    return (
        <div className="document-permissions">
            <div className="permissions-container">
                <div className="breadcrumb-container">
                    <Breadcrumb
                        items={[
                            { label: t('home'), onClick: () => navigate('/') },
                            { label: workspaceName || 'Workspace', onClick: () => navigate(`/workspace/${documentData?.workspace_id || ''}`) },
                            // { label: docName, onClick: () => navigate(`/document/${documentId}`, { state: { document: documentData } }) },
                            { label: t('permissions') + ' - ' + docName }
                        ]}
                    />
                </div>

                <div className="permissions-header">
                    <div>
                        <button onClick={() => navigate(-1)} className="back-button">
                            <ArrowLeft size={20} />
                        </button>
                        <div className="header-info" style={{ margin: '0 15px' }}>
                            <h1 className="permissions-title">{t('managePermissions')} <p className="document-id">{docName}</p></h1>

                        </div>
                    </div>

                    <button className="btn-primary add-user-btn" style={{ margin: '0' }} onClick={() => setShowAddModal(true)}>
                        <Plus size={18} />
                        {t('inviteUser')}
                    </button>
                </div>

                {/* Add User Modal */}
                {showAddModal && (
                    <div className="add-user-modal">
                        <div className="modal-content" style={{ overflow: 'visible' }}>
                            <h3>{t('shareDocument')}</h3>
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
                                            className="search-input"
                                            style={{ border: 'none', outline: 'none', width: '100%' }}
                                            autoFocus
                                        />
                                    </div>

                                    {/* Dropdown Results */}
                                    {searchQuery && !selectedUser && (
                                        <div className="users-dropdown" style={{
                                            position: 'absolute', top: '100%', left: 0, right: 0,
                                            maxHeight: '200px', overflowY: 'auto',
                                            backgroundColor: 'white', border: '1px solid #e2e8f0',
                                            borderRadius: '8px', marginTop: '4px', zIndex: 100,
                                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                                        }}>
                                            {workspaceMembers.filter(u =>
                                                (u.nameEn && u.nameEn.toLowerCase().includes(searchQuery.toLowerCase())) ||
                                                (u.nameAr && u.nameAr.includes(searchQuery))
                                            ).length > 0 ? (
                                                workspaceMembers.filter(u =>
                                                    (u.nameEn && u.nameEn.toLowerCase().includes(searchQuery.toLowerCase())) ||
                                                    (u.nameAr && u.nameAr.includes(searchQuery))
                                                ).map(user => (
                                                    <div
                                                        key={user.id}
                                                        onClick={() => {
                                                            setSelectedUser(user);
                                                            setSearchQuery(user.nameEn || user.nameAr);
                                                        }}
                                                        className="user-option hover:bg-gray-50"
                                                        style={{
                                                            padding: '8px 12px', cursor: 'pointer',
                                                            borderBottom: '1px solid #f1f5f9',
                                                        }}
                                                    >
                                                        <div style={{ fontWeight: 500 }}>{user.nameEn}</div>
                                                        <div style={{ fontSize: '12px', color: '#64748b' }}>{user.nameAr} - {user.type}</div>
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
                                    onChange={e => setNewRole(e.target.value as any)}
                                    className="role-select"
                                    style={{ marginBottom: '20px' }}
                                >
                                    <option value="viewer">{t('viewer')}</option>
                                    <option value="editor">{t('editor')}</option>
                                    <option value="admin">{t('admin') || 'Admin'}</option>
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
                                        {t('invite') || 'Add Permission'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                <div className="permissions-list">
                    <div className="list-header">
                        <span>{t('name')}</span>
                        <span>{t('role')}</span>
                    </div>

                    {permissions.length === 0 ? (
                        <div style={{ padding: '40px 0' }}>
                            <EmptyState
                                icon={Shield}
                                title={t('noPermissionsFound') || 'No permissions found'}
                                description={t('noPermissionsDescription') || 'No users have access to this document.'}
                            />
                        </div>
                    ) : (
                        permissions.map((user) => (
                            <div key={user.id} className="permission-item">
                                <div className="user-info">
                                    <div className="user-avatar">
                                        {user.avatar ? (
                                            <img src={user.avatar} alt={user.name} />
                                        ) : (
                                            <span>{user.name.charAt(0).toUpperCase()}</span>
                                        )}
                                    </div>
                                    <div className="user-details">
                                        <span className="user-name">
                                            {user.name}
                                            {user.isOwner && <span className="you-badge">({t('owner')})</span>}
                                        </span>
                                        {/* <span className="user-email">{user.email}</span> */}
                                    </div>
                                </div>

                                <div className="user-actions">
                                    {user.isOwner ? (
                                        <span className="owner-label">
                                            <Shield size={16} />
                                            {t('owner')}
                                        </span>
                                    ) : (
                                        <>
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleRoleChange(user.userId, e.target.value, user.id)}
                                                className="role-select-inline"
                                            >
                                                <option value="viewer">{t('viewer')}</option>
                                                <option value="editor">{t('editor')}</option>
                                                <option value="admin">{t('admin') || 'Admin'}</option>
                                            </select>
                                            <button
                                                className="remove-btn"
                                                onClick={() => handleRemoveUser(user)}
                                                data-tooltip-content={t('removeAccess')}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default DocumentPermissions;
