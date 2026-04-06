import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, UserPlus, Trash2, Users } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import Breadcrumb from '../components/Breadcrumb';
import { getWorkspaceMemberDetails, deleteMember, updateMemberRole, inviteMember, WorkspaceMemberDetails } from '../api/workspaceMembers';
import { getWorkspaceById } from '../api/workspaces';
import { getAllProfileUsers, ProfileUser } from '../api/profiles';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../contexts/ConfirmContext';
import './WorkspaceMembers.css';
import './Starred.css';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';

const WorkspaceMembers: React.FC = () => {
    const navigate = useNavigate();
    const { workspaceId } = useParams();
    const { t, language } = useLanguage();
    const { success, error } = useToast();
    const { confirm } = useConfirm();

    const [members, setMembers] = useState<WorkspaceMemberDetails[]>([]);
    const [workspaceName, setWorkspaceName] = useState<string>("");
    const [loading, setLoading] = useState(true);

    // States for Add Member Modal
    const [showAddModal, setShowAddModal] = useState(false);
    const [allUsers, setAllUsers] = useState<ProfileUser[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState<ProfileUser | null>(null);
    const [newRole, setNewRole] = useState<string>('Viewer');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!workspaceId) return;

        // Fetch workspace name
        getWorkspaceById(workspaceId)
            .then(ws => {
                if ('nameAr' in ws && 'nameEn' in ws) {
                    setWorkspaceName((language === 'ar' ? (ws as any).nameAr : (ws as any).nameEn) as string);
                } else {
                    setWorkspaceName((ws.name || workspaceId) as string);
                }
            })
            .catch(() => setWorkspaceName(workspaceId || ''));

        fetchMembers();
        fetchUsers();
    }, [workspaceId, language]);

    const fetchMembers = async () => {
        if (!workspaceId) return;
        try {
            setLoading(true);
            const data = await getWorkspaceMemberDetails(workspaceId);
            setMembers(data);
        } catch (err) {
            console.error('Failed to fetch members:', err);
            error(t('failedToLoadMembers') || 'Failed to load members');
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const users = await getAllProfileUsers();
            setAllUsers(users);
        } catch (err) {
            console.error('Failed to fetch users:', err);
        }
    };

    const handleRemoveMember = async (id: string) => {
        confirm({
            title: t('removeMember'),
            message: t('confirmRemoveMember'),
            confirmText: t('delete'), // or remove
            cancelText: t('cancel'),
            type: 'danger',
            onConfirm: async () => {
                try {
                    await deleteMember(id);
                    success(t('memberRemovedSuccessfully') || 'Member removed successfully');
                    // Remove from state immediately
                    setMembers(members.filter(m => m.id !== id));
                } catch (err) {
                    console.error('Failed to remove member:', err);
                    error(t('failedToRemoveMember') || 'Failed to remove member');
                }
            }
        });
    };

    const handleRoleChange = async (id: string, newRole: string) => {
        try {
            // Optimistic update
            setMembers(members.map(m => m.id === id ? { ...m, role: newRole } : m));

            await updateMemberRole(id, newRole);
            success(t('roleUpdatedSuccessfully') || 'Role updated successfully');
        } catch (err) {
            console.error('Failed to update role:', err);
            error(t('failedToUpdateRole') || 'Failed to update role');
            fetchMembers(); // Revert on failure
        }
    };

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser || !workspaceId) return;

        setIsSubmitting(true);
        try {
            // Check if user is already a member
            // Note: workspace members usually have userId field matching the user's ID.
            // Ensure type comparison is correct (string vs number)
            if (members.some(m => String(m.userId) === String(selectedUser.id))) {
                error(t('userAlreadyHasAccess') || 'User already has access');
                setIsSubmitting(false);
                return;
            }

            await inviteMember({
                workspaceId,
                grcUserId: selectedUser.id,
                grcUserType: selectedUser.type,
                role: newRole,
            });

            success(t('invitationSentSuccessfully') || 'Invitation sent successfully');
            setShowAddModal(false);
            setSelectedUser(null);
            setSearchQuery('');
            fetchMembers(); // Refresh list
        } catch (err) {
            console.error("Failed to add member", err);
            error(t('failedToInviteUser') || 'Failed to invite user');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredUsers = allUsers.filter(u =>
        (u.nameEn && u.nameEn.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (u.nameAr && u.nameAr.includes(searchQuery))
    );

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const totalPages = Math.ceil(members.length / itemsPerPage);
    const paginatedMembers = members.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [members.length]);

    return (
        <div className="starred-page" style={{ minHeight: '100vh', position: 'relative' }}>
            <div className="starred-header" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
                <div className="header-content">
                    <div className="header-title">
                        <UserPlus size={28} color="#c3924d" />
                        <h1>{t('workspaceMembers')}</h1>
                    </div>
                    <p className="header-subtitle">{t('manageWorkspaceMembers')}</p>
                </div>
            </div>
            <div className="members-container" style={{ maxWidth: '100%', margin: 0 }}>
                <div className="breadcrumb-container" style={{ marginBottom: '20px' }}>
                    <Breadcrumb
                        items={[
                            { label: t('home'), onClick: () => navigate('/') },
                            { label: t('workspace') + ' ' + (workspaceName || workspaceId), onClick: () => navigate(`/workspace/${workspaceId}`) },
                            { label: t('members') }
                        ]}
                    />
                </div>
                <div className="members-header">
                    <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                        <button onClick={() => navigate(-1)} className="back-button">
                            <ArrowLeft size={24} />
                        </button>
                        <div className="header-info">
                            <h2 style={{ margin: 0 }}>{t('workspaceMembers')}</h2>
                            <p className="workspace-id">{t('workspace')}: {workspaceName || workspaceId}</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', flex: 1 }}>
                        <button
                            className="btn-primary add-member-btn always-blue"
                            style={{ height: 44, fontSize: 16, padding: '0 24px', display: 'flex', alignItems: 'center', gap: 8, background: '#c3924d', color: '#fff', border: 'none' }}
                            onClick={() => setShowAddModal(true)}
                        >
                            <UserPlus size={20} />
                            {t('inviteUser')}
                        </button>
                    </div>

                </div>
                <div className="members-list-card">
                    <div className="members-list-header">
                        <span>{t('member')}</span>
                        <span>{t('type')}</span>
                        <span>{t('role')}</span>
                        <span>{t('joinedDate')}</span>
                        <span style={{ textAlign: 'right' }}>{t('actions')}</span>
                    </div>
                    {loading ? (
                        <div style={{ padding: '20px', textAlign: 'center' }}>{t('loading') || 'Loading...'}</div>
                    ) : members.length === 0 ? (
                        <EmptyState
                            icon={Users}
                            title={t('noMembersFound') || 'No members found'}
                            description={t('inviteMembersDescription') || 'Invite users to collaborate in this workspace.'}
                        />
                    ) : (
                        <>
                            {paginatedMembers.map((member) => (
                                <div key={member.id} className="member-item">
                                    <div className="member-info">
                                        <div className="member-details">
                                            <span className="member-name">{language === 'ar' ? member.nameAr : member.nameEn}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="member-type">{member.type}</span>
                                    </div>
                                    <div>
                                        <select
                                            value={member.role}
                                            onChange={(e) => handleRoleChange(member.id, e.target.value)}
                                            className="role-select-inline"
                                            style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}
                                        >
                                            <option value="Admin">{t('Admin')}</option>
                                            <option value="Editor">{t('Editor')}</option>
                                            <option value="Viewer">{t('Viewer')}</option>
                                        </select>
                                    </div>
                                    <span className="member-joined">{new Date(member.createdAt).toLocaleDateString()}</span>
                                    <div className="actions-cell">
                                        <button
                                            className="btn-icon"
                                            onClick={() => handleRemoveMember(member.id)}
                                            data-tooltip-content={t('removeMember')}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                                totalItems={members.length}
                                itemsPerPage={itemsPerPage}
                            />
                        </>
                    )}
                </div>
            </div>

            {/* Add Member Modal */}
            {showAddModal && (
                <div className="add-user-modal" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="modal-content" style={{
                        background: 'white', padding: '24px', borderRadius: '12px',
                        width: '100%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                    }}>
                        <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '1.25rem' }}>{t('inviteToWorkspace')}</h3>
                        <form onSubmit={handleAddMember}>
                            <div style={{ position: 'relative', marginBottom: '16px', width: '100%' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 500 }}>{t('searchUsers')}</label>
                                <div style={{
                                    display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0',
                                    borderRadius: '8px', padding: '8px 12px', gap: '8px', transition: 'all 0.2s'
                                }}>
                                    <input
                                        type="text"
                                        placeholder={t('searchUsers')}
                                        value={searchQuery}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value);
                                            setSelectedUser(null);
                                        }}
                                        style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.875rem' }}
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
                                        {filteredUsers.length > 0 ? (
                                            filteredUsers.map(user => (
                                                <div
                                                    key={user.id}
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setSearchQuery(language === 'ar' ? (user.nameAr || '') : (user.nameEn || ''));
                                                    }}
                                                    style={{
                                                        padding: '10px 12px', cursor: 'pointer',
                                                        borderBottom: '1px solid #f1f5f9',
                                                        display: 'flex', flexDirection: 'column'
                                                    }}
                                                    className="hover:bg-gray-50"
                                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                >
                                                    <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{language === 'ar' ? (user.nameAr || user.name) : (user.nameEn || user.name)}</span>
                                                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{user.type}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <div style={{ padding: '12px', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
                                                {t('noUsersFound')}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 500 }}>{t('role')}</label>
                                <select
                                    value={newRole}
                                    onChange={e => setNewRole(e.target.value)}
                                    style={{
                                        width: '100%', padding: '10px', borderRadius: '8px',
                                        border: '1px solid #e2e8f0', background: 'white'
                                    }}
                                >
                                    <option value="Admin">{t('Admin')}</option>
                                    <option value="Editor">{t('Editor')}</option>
                                    <option value="Viewer">{t('Viewer')}</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    style={{
                                        padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1',
                                        background: 'white', cursor: 'pointer'
                                    }}
                                >
                                    {t('cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={!selectedUser || isSubmitting}
                                    style={{
                                        padding: '8px 24px', borderRadius: '6px', border: 'none',
                                        background: (!selectedUser || isSubmitting) ? '#94a3b8' : '#c3924d',
                                        color: 'white', cursor: (!selectedUser || isSubmitting) ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {isSubmitting ? t('adding') : t('invite')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkspaceMembers;
