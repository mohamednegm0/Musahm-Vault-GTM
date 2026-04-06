import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, ArrowRight, FileText, Search, Plus, Users, Edit2, Trash2, X, Eye,
    Download, History, Shield, Info, Folder, ChevronRight,
    Calendar, Clock, AlertCircle, Star, Activity, CheckCircle, GitBranch
} from 'lucide-react';
import { getInstancesByTarget, WorkflowInstance } from '../api/workflowInstances';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../contexts/ConfirmContext';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { Document } from '../api/documents';
import { WorkspaceChild } from '../api/workspaces';
import { DocumentVersion, getDocumentVersions, deleteDocumentVersion, uploadDocumentVersion, downloadDocumentVersion } from '../api/documentVersions';
import { getDocumentInvitations, deleteInvitation } from '../api/invitations';
import { getWorkspaceMemberDetails, WorkspaceMemberDetails } from '../api/workspaceMembers';
import { getDocumentAcls, deleteDocumentAcl, DocumentAcl, updateDocumentAcl } from '../api/documentAcls';
import { getDocumentPreview, downloadDocument } from '../api/documents';
import LoadingState from './LoadingState';
import Tooltip from './Tooltip';
import ShareModal from './ShareModal';
import AddPermissionModal from './AddPermissionModal';
import Breadcrumb from './Breadcrumb';
import Pagination from './Pagination';
import EmptyState from './EmptyState';
import WorkflowAssignmentModal from './WorkflowAssignmentModal';
import { getWorkflows } from '../api/workflows';
import './ExplorerLayout.css';

export interface ExplorerLayoutProps {
    title: string;
    subtitle?: string;
    documents: Document[];
    folders?: WorkspaceChild[];
    breadcrumbs?: { label: string; onClick?: () => void }[];
    isLoading?: boolean;
    onNavigate?: (path: string) => void;
    onFolderClick?: (folderId: string) => void;
    headerActions?: React.ReactNode;
    emptyMessage?: string;
    onRefresh?: () => void;
    showBackCallback?: () => void; // If provided, shows back button
    isStarred?: boolean;
    onStarToggle?: () => void;
    onDocStarToggle?: (docId: string, isStarred: boolean) => void;
    onDeleteDoc?: (docId: string) => void;
    onDeleteFolder?: (folderId: string) => void;
}

const ExplorerLayout: React.FC<ExplorerLayoutProps> = ({
    title,
    subtitle,
    documents,
    folders = [],
    breadcrumbs,
    isLoading = false,
    onNavigate,
    onFolderClick,
    headerActions,
    emptyMessage,
    showBackCallback,
    isStarred,
    onStarToggle,
    onDocStarToggle,
    onDeleteDoc,
    onDeleteFolder
}) => {
    const { t, language } = useLanguage();
    const navigate = useNavigate();
    const { success, error } = useToast();
    const { confirm } = useConfirm();
    const { workspaces } = useWorkspace();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

    // Sidebar State
    const [sidebarTab, setSidebarTab] = useState<'details' | 'actions'>('details');
    const [sidebarVersions, setSidebarVersions] = useState<DocumentVersion[]>([]);
    const [sidebarPermissions, setSidebarPermissions] = useState<any[]>([]);
    const [sidebarAcls, setSidebarAcls] = useState<DocumentAcl[]>([]);
    const [sidebarWorkflows, setSidebarWorkflows] = useState<WorkflowInstance[]>([]);
    const [workspaceMembers, setWorkspaceMembers] = useState<WorkspaceMemberDetails[]>([]);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewType, setPreviewType] = useState<'image' | 'pdf' | 'other' | null>(null);
    const [loadingSidebarData, setLoadingSidebarData] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isAddPermissionModalOpen, setIsAddPermissionModalOpen] = useState(false);
    const [isWorkflowModalOpen, setIsWorkflowModalOpen] = useState(false);
    const [selectedAssignmentTarget, setSelectedAssignmentTarget] = useState<{ id: string, name: string, type: 'Document' | 'Folder' | 'Workspace' } | null>(null);
    const [hasWorkflows, setHasWorkflows] = useState(false);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (selectedDoc) {
            loadPreview(selectedDoc.id);
            loadSidebarData(selectedDoc.id);
            setSidebarTab('details');
        } else {
            setPreviewUrl(null);
            setPreviewType(null);
            previewDocIdRef.current = null;
            setSidebarVersions([]);
            setSidebarPermissions([]);
            setSidebarAcls([]);
            setSidebarWorkflows([]);
        }
    }, [selectedDoc]);

    useEffect(() => {
        const checkWorkflows = async () => {
            try {
                const workflows = await getWorkflows();
                setHasWorkflows(workflows && workflows.length > 0);
            } catch (e) {
                console.error("Failed to check workflows", e);
            }
        };
        checkWorkflows();
    }, []);

    const loadSidebarData = async (docId: string) => {
        setLoadingSidebarData(true);
        try {
            const versions = await getDocumentVersions(docId);
            setSidebarVersions(versions);
            const invites = await getDocumentInvitations(docId);
            setSidebarPermissions(invites);
            const acls = await getDocumentAcls(docId);
            setSidebarAcls(acls);

            // Fetch workspace members for name mapping if doc has workspace_id
            if (selectedDoc?.workspace_id) {
                const members = await getWorkspaceMemberDetails(selectedDoc.workspace_id);
                setWorkspaceMembers(members);
            }
            
            // Fetch Workflows
            try {
                const wfInstances = await getInstancesByTarget(docId);
                setSidebarWorkflows(wfInstances);
            } catch (e) {
                setSidebarWorkflows([]);
            }
        } catch (e) {
            console.error("Failed to load sidebar data", e);
        } finally {
            setLoadingSidebarData(false);
        }
    };

    const previewDocIdRef = useRef<string | null>(null);

    const loadPreview = async (id: string) => {
        if (previewDocIdRef.current === id) return;
        previewDocIdRef.current = id;
        try {
            const blob = await getDocumentPreview(id);
            if (blob && blob.size > 0) {
                const url = URL.createObjectURL(blob);
                setPreviewUrl(url);
                if (blob.type.includes('image')) setPreviewType('image');
                else if (blob.type.includes('pdf')) setPreviewType('pdf');
                else setPreviewType('other');
            }
        } catch (e) {
            console.error("Preview load failed", e);
        }
    };

    const getDocStatusClass = (status: string = '') => {
        const s = status.toLowerCase();
        if (s === 'approved' || s === 'signed') return 'status-approved-pill';
        if (s === 'pending signature' || s === 'pending' || s === 'in review' || s === 'inreview') return 'status-pending-pill';
        if (s === 'draft') return 'status-draft-pill';
        return 'status-neutral-pill';
    };

    const getDocStatusText = (status: string = '') => {
        const statusMap: { [key: string]: string } = {
            'Approved': t('approved'),
            'Pending Signature': t('pendingSignature'),
            'Signed': t('signed'),
            'In Review': t('inReview'),
            'InReview': t('inReview'),
            'Draft': t('draft')
        };
        // If it's already localized or not in map, return as is or attempt translation
        return statusMap[status] || status;
    };

    const getWorkflowStatusText = (status: any) => {
        // Map integer status to string
        const statusMap: { [key: number]: string } = {
            0: t('draft') || 'Draft',
            1: t('active') || 'Active',
            2: t('suspended') || 'Suspended',
            3: t('completed') || 'Completed',
            4: t('terminated') || 'Terminated'
        };
        
        if (typeof status === 'number') {
            return statusMap[status] || 'Unknown';
        }
        return status; // fallback if string
    };

    const getWorkflowStatusClass = (status: any) => {
        if (status === 1 || status === 'Active' || status === 'InProgress') return 'status-pending-pill';
        if (status === 3 || status === 'Completed') return 'status-approved-pill';
        if (status === 4 || status === 'Terminated') return 'status-danger-pill';
        return 'status-neutral-pill';
    };

    // Filter docs locally
    const filteredDocs = documents.filter(doc =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Pagination logic
    const totalPages = Math.ceil(filteredDocs.length / itemsPerPage);
    const paginatedDocs = filteredDocs.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const renderFolders = () => {
        if (!folders || folders.length === 0) return null;

        return (
            <div className="folders-grid-section">
                <div className="section-header-row">
                    <h3 className="section-title">
                        <Folder size={18} className="title-icon" />
                        <div style={{ margin: '0 5px' }}>{t('folders')}</div>
                        <span>({folders.length})</span>
                    </h3>
                </div>
                <div className="folders-grid">
                    {folders.map(folder => (
                        <div
                            key={folder.id}
                            className="folder-card"
                            onClick={() => onFolderClick ? onFolderClick(folder.id) : navigate(`/workspace/${folder.id}`)}
                        >
                            <div className="folder-card-content">
                                <div className="folder-icon-box">
                                    <div className="folder-icon-wrapper">
                                        <Folder size={24} className="main-folder-icon" />
                                        <div className="folder-icon-back"></div>
                                    </div>
                                </div>
                                <div className="folder-info">
                                    <div className="folder-name-row" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                        <span className="folder-name-text" style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {folder.name}
                                        </span>
                                        {onDeleteFolder && (
                                            <button
                                                className="btn-icon-sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDeleteFolder(folder.id);
                                                }}
                                                style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                                                title={t('delete') || "Delete"}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                    <div className="folder-stats">
                                        <span className="stat-item">
                                            <Folder size={12} />
                                            <div>
                                                {folder.childCount ?? 0}
                                            </div>
                                            <div>
                                                {t('folders')}
                                            </div>
                                        </span>
                                        <span className="stat-divider">•</span>
                                        <span className="stat-item">
                                            <FileText size={12} />
                                            <div>{folder.documentCount ?? 0}</div>
                                            <div>{t('documents')}</div>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const isPendingDoc = selectedDoc ? ['pending', 'pending signature', 'in review', 'inreview'].includes(selectedDoc.status?.toLowerCase().trim() || '') : false;

    return (
        <>
            {selectedAssignmentTarget && (
                <WorkflowAssignmentModal
                    isOpen={isWorkflowModalOpen}
                    onClose={() => {
                        setIsWorkflowModalOpen(false);
                        setSelectedAssignmentTarget(null);
                    }}
                    targetId={selectedAssignmentTarget.id}
                    targetType={selectedAssignmentTarget.type}
                    targetName={selectedAssignmentTarget.name}
                />
            )}
            <div className={`workspace-explorer-view ${language === 'ar' ? 'rtl' : 'ltr'}`}>
                {breadcrumbs && breadcrumbs.length > 0 && (
                <div >
                    <Breadcrumb items={breadcrumbs} />
                </div>
            )}
            <div className="explorer-header" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div className="explorer-header-left" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {showBackCallback && (
                        <button
                            type="button"
                            className="header-back-btn"
                            onClick={showBackCallback}
                        >
                            {language === 'ar' ? <ArrowRight size={22} /> : <ArrowLeft size={22} />}
                        </button>
                    )}
                    <div className="title-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h1 style={{ marginBottom: 0 }}>{title}</h1>
                        {onStarToggle && (
                            <button
                                className={`star-btn ${isStarred ? 'starred' : ''}`}
                                onClick={onStarToggle}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    color: isStarred ? '#c3924d' : '#64748b',
                                    transition: 'all 0.2s ease'
                                }}
                                data-tooltip-content={isStarred ? t('removeFromFavorites') : t('addToFavorites')}
                            >
                                <Star size={20} fill={isStarred ? "#c3924d" : "none"} />
                            </button>
                        )}
                    </div>
                </div>
                <div className="explorer-header-right">
                    <div className="search-box-input">
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            placeholder={t('searchDocuments') || 'Search documents...'}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    {headerActions && (
                        <>
                            <div className="header-actions-divider"></div>
                            {headerActions}
                        </>
                    )}
                </div>
            </div>

            <div className="explorer-content-layout">
                <div className={`explorer-main-area ${selectedDoc ? 'with-sidebar' : ''}`}>
                    {isLoading ? (
                        <LoadingState fullPage={false} />
                    ) : (
                        <>
                            {renderFolders()}
                            {filteredDocs.length === 0 ? (
                                <EmptyState
                                    title={emptyMessage || t('noDocumentsFound')}
                                    description={t('noDocumentsFoundDescription') || 'Try adjusting your search or filters to find what you are looking for.'}
                                    icon={FileText}
                                />
                            ) : (
                                <>
                                    <div className="explorer-table-container">
                                        <table className="explorer-table">
                                            <thead>
                                                <tr>
                                                    <th className="th-checkbox">
                                                        <div className="checkbox-cell"></div>
                                                    </th>
                                                    <th className="th-subject">{t('subject') || 'Subject'}</th>
                                                    <th className="th-status">{t('status') || 'Status'}</th>
                                                    <th className="th-updated">{t('updated') || 'Updated'}</th>
                                                    <th className="th-folder">{t('folder') || 'Folder'}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {paginatedDocs.map(doc => (
                                                    <tr
                                                        key={doc.id}
                                                        className={selectedDoc?.id === doc.id ? 'row-selected' : ''}
                                                        onClick={() => setSelectedDoc(selectedDoc?.id === doc.id ? null : doc)}
                                                    >
                                                        <td className="td-checkbox">
                                                            <div className="radio-circle">
                                                                {selectedDoc?.id === doc.id && <div className="radio-inner"></div>}
                                                            </div>
                                                        </td>
                                                        <td className="td-subject">
                                                            <div className="subject-content">
                                                                <div className="doc-icon-wrapper">
                                                                    <FileText size={18} />
                                                                </div>
                                                                <div className="subject-text">
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                        <span className="doc-name">{doc.title}</span>
                                                                    </div>
                                                                    <span className="doc-owner">{doc.createdByName || t('unknown')}</span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="td-status">
                                                            <span className={`status-pill ${getDocStatusClass(doc.status)}`}>
                                                                {getDocStatusText(doc.status)}
                                                            </span>
                                                        </td>
                                                        <td className="td-updated">
                                                            {doc.created_at ? new Date(doc.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '-'}
                                                        </td>
                                                        <td className="td-folder">
                                                            <span className="folder-text">
                                                                {workspaces.find(w => w.id === doc.workspace_id)?.name || '---'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={setCurrentPage}
                                        totalItems={filteredDocs.length}
                                        itemsPerPage={itemsPerPage}
                                    />
                                </>
                            )}
                        </>
                    )}
                </div>

                {selectedDoc && (
                    <div className="explorer-sidebar">
                        <div className="sidebar-header" style={{ justifyContent: 'space-between' }}>
                            <h2>{t('documentDetails')}</h2>
                            <button
                                className="close-sidebar-btn"
                                onClick={() => setSelectedDoc(null)}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="sidebar-tabs">
                            <button
                                className={`sidebar-tab ${sidebarTab === 'details' ? 'active' : ''}`}
                                onClick={() => setSidebarTab('details')}
                            >
                                <Info size={16} />
                                <span>{t('details') || 'Details'}</span>
                            </button>
                            <button
                                className={`sidebar-tab ${sidebarTab === 'actions' ? 'active' : ''}`}
                                onClick={() => {
                                    if (isPendingDoc) return;
                                    setSidebarTab('actions');
                                }}
                                disabled={isPendingDoc}
                                style={isPendingDoc ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                            >
                                <Shield size={16} />
                                <span>{t('actions') || 'Actions'}</span>
                            </button>
                        </div>

                        <div className="sidebar-actions-row">
                            <button 
                                className="btn-sidebar-primary" 
                                onClick={() => !isPendingDoc && navigate(`/document/${selectedDoc.id}`)}
                                disabled={isPendingDoc}
                                style={isPendingDoc ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                            >
                                <Eye size={18} />
                                <span>{t('viewDocument') || 'View Document'}</span>
                            </button>
                            <div className="secondary-actions">
                                {hasWorkflows && (
                                    <button 
                                        className="btn-sidebar-secondary" 
                                        onClick={() => {
                                            if (isPendingDoc) return;
                                            setSelectedAssignmentTarget({
                                                id: selectedDoc.id!,
                                                name: selectedDoc.title,
                                                type: 'Document'
                                            });
                                            setIsWorkflowModalOpen(true);
                                        }}
                                        disabled={isPendingDoc}
                                        style={isPendingDoc ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                                    >
                                        <GitBranch size={18} />
                                        <span>{t('workflowAssignments') || 'Workflow'}</span>
                                    </button>
                                )}
                                <button 
                                    className="btn-sidebar-secondary" 
                                    onClick={async () => {
                                        if (isPendingDoc) return;
                                    try {
                                        const blob = await downloadDocument(selectedDoc.id);
                                        const url = window.URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = selectedDoc.title;
                                        document.body.appendChild(a);
                                        a.click();
                                        window.URL.revokeObjectURL(url);
                                        document.body.removeChild(a);
                                    } catch (err) {
                                        error(t('downloadError'));
                                    }
                                }}
                                disabled={isPendingDoc}
                                style={isPendingDoc ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                                >
                                    <Download size={18} />
                                    <span>{t('download') || 'Download'}</span>
                                </button>
                                {onDeleteDoc && (
                                    <button 
                                        className="btn-sidebar-secondary" 
                                        onClick={() => {
                                            if (isPendingDoc) return;
                                            onDeleteDoc(selectedDoc.id!);
                                        }}
                                        disabled={isPendingDoc}
                                        style={isPendingDoc ? { opacity: 0.5, cursor: 'not-allowed', color: '#ef4444' } : { color: '#ef4444' }}
                                    >
                                        <Trash2 size={18} />
                                        <span>{t('delete') || 'Delete'}</span>
                                    </button>
                                )}

                            </div>
                        </div>

                        <div className="sidebar-scroll-area">
                            {sidebarTab === 'details' ? (
                                <>
                                    <div className="sidebar-preview-card">
                                        {previewUrl ? (
                                            previewType === 'image' ? (
                                                <img src={previewUrl} alt={selectedDoc.title} className="sidebar-preview-img" />
                                            ) : previewType === 'pdf' ? (
                                                <iframe src={`${previewUrl}#toolbar=0`} className="sidebar-preview-pdf" title="preview" />
                                            ) : (
                                                <div className="preview-placeholder">
                                                    <FileText size={48} />
                                                    <p>{t('previewNotAvailable')}</p>
                                                </div>
                                            )
                                        ) : (
                                            <div className="preview-placeholder">
                                                <FileText size={48} />
                                            </div>
                                        )}
                                    </div>

                                    <div className="sidebar-info-section">
                                        <h3 className="sidebar-doc-title">{selectedDoc.title}</h3>
                                        <div className="sidebar-status-tag-wrapper">
                                            <div className={`status-pill ${getDocStatusClass(selectedDoc.status)}`}>
                                                <div className="status-dot"></div>
                                                <span>{getDocStatusText(selectedDoc.status)}</span>
                                            </div>
                                        </div>

                                        <div className="sidebar-metadata-grid">
                                            <div className="meta-item">
                                                <div className="meta-icon-label">
                                                    <Calendar size={14} />
                                                    <span className="meta-label">{t('created') || 'Created'}</span>
                                                </div>
                                                <span className="meta-value">{selectedDoc.created_at ? new Date(selectedDoc.created_at).toLocaleDateString() : '-'}</span>
                                            </div>
                                            <div className="meta-item">
                                                <div className="meta-icon-label">
                                                    <Clock size={14} />
                                                    <span className="meta-label">{t('updated') || 'Updated'}</span>
                                                </div>
                                                <span className="meta-value">{selectedDoc.created_at ? new Date(selectedDoc.created_at).toLocaleDateString() : '-'}</span>
                                            </div>
                                            <div className="meta-item">
                                                <div className="meta-icon-label">
                                                    <Folder size={14} />
                                                    <span className="meta-label">{t('folder') || 'Folder'}</span>
                                                </div>
                                                <span
                                                    className="meta-value folder-link"
                                                    style={{ color: 'var(--brand-gold)', cursor: 'pointer' }}
                                                    onClick={() => selectedDoc.workspace_id && navigate(`/workspace/${selectedDoc.workspace_id}`)}
                                                >
                                                    {workspaces.find(w => w.id === selectedDoc.workspace_id)?.name || '-'}
                                                </span>
                                            </div>
                                            <div className="meta-item">
                                                <div className="meta-icon-label">
                                                    <AlertCircle size={14} />
                                                    <span className="meta-label">{t('expires') || 'Expires'}</span>
                                                </div>
                                                <span className="meta-value">{selectedDoc.expiry_date ? new Date(selectedDoc.expiry_date).toLocaleDateString() : '-'}</span>
                                            </div>
                                        </div>

                                        <div className="sidebar-workflow-section">
                                            <h4>{t('workflows') || 'Workflows'}</h4>
                                            {sidebarWorkflows.length === 0 ? (
                                                <p className="workflow-empty">{t('noActiveWorkflows') || 'No active workflows'}</p>
                                            ) : (
                                                <div className="workflow-list-stack">
                                                    {sidebarWorkflows
                                                        .sort((a, b) => new Date(b.startedAt || 0).getTime() - new Date(a.startedAt || 0).getTime())
                                                        .map(wf => {
                                                            const wfStatusRaw = String(wf.status || '').toLowerCase();
                                                            const isTerminated = wfStatusRaw === 'terminated' || wfStatusRaw === '4';
                                                            const isCompleted  = wfStatusRaw === 'completed'  || wfStatusRaw === '3';
                                                            const isActive     = wfStatusRaw === 'active' || wfStatusRaw === 'inprogress' || wfStatusRaw === '1';
                                                            const badgeStyle = isCompleted
                                                                ? { background: '#D1FAE5', color: '#047857', border: '1px solid #A7F3D0' }
                                                                : isActive
                                                                    ? { background: '#FEF3C7', color: '#B45309', border: '1px solid #FDE68A' }
                                                                    : isTerminated
                                                                        ? { background: '#FEE2E2', color: '#B91C1C', border: '1px solid #FECACA' }
                                                                        : { background: '#F3F4F6', color: '#6B7280', border: '1px solid #E5E7EB' };
                                                            const badgeLabel = isCompleted ? (t('completedStatus') || 'Completed')
                                                                : isActive ? (t('runningStatus') || 'Running')
                                                                : isTerminated ? (t('terminatedStatus') || 'Terminated')
                                                                : String(wf.status);
                                                            return (
                                                                <div key={wf.id} className="workflow-status-card">
                                                                    <div className="wf-header">
                                                                        <span className="wf-name" style={{ fontWeight: '600', fontSize: '14px' }}>{wf.workflowName || 'Workflow'}</span>
                                                                        <span style={{
                                                                            ...badgeStyle,
                                                                            padding: '3px 10px', borderRadius: '20px',
                                                                            fontSize: '11px', fontWeight: '700',
                                                                            textTransform: 'uppercase', letterSpacing: '0.04em'
                                                                        }}>{badgeLabel}</span>
                                                                    </div>
                                                                    <div className="wf-steps">
                                                                        {wf.steps?.slice().sort((a: any, b: any) => {
                                                                            const order = (s: any) => {
                                                                                const tt = String(s.title || s.name || '').toLowerCase();
                                                                                if (tt === 'start') return 0;
                                                                                if (tt === 'end') return 2;
                                                                                return 1;
                                                                            };
                                                                            return order(a) - order(b);
                                                                        }).map((step: any, idx: number, arr: any[]) => {
                                                                            const sRaw = String(step.status || '').toLowerCase();
                                                                            const sCompleted = sRaw === 'completed' || sRaw === '3';
                                                                            const sActive    = sRaw === 'inprogress' || sRaw === 'active' || sRaw === '2';
                                                                            const sFailed    = sRaw === 'failed' || sRaw === 'rejected' || sRaw === '4';
                                                                            const sSkipped   = isTerminated && !sCompleted && !sActive && !sFailed;
                                                                            const isLastStep = idx === arr.length - 1;
                                                                            const iconColor  = sCompleted ? '#10B981' : sActive ? '#3B82F6' : sFailed ? '#EF4444' : '#D1D5DB';
                                                                            const lineColor  = sCompleted ? '#10B981' : '#E5E7EB';
                                                                            return (
                                                                                <div key={idx} style={{ display: 'flex', gap: '10px', opacity: sSkipped ? 0.5 : 1 }}>
                                                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '20px', flexShrink: 0 }}>
                                                                                        <div style={{
                                                                                            width: '20px', height: '20px', borderRadius: '50%',
                                                                                            background: sCompleted ? '#D1FAE5' : sActive ? '#DBEAFE' : sFailed ? '#FEE2E2' : '#F3F4F6',
                                                                                            border: `2px solid ${iconColor}`,
                                                                                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                                                                        }}>
                                                                                            {sCompleted ? <CheckCircle size={12} color="#10B981" />
                                                                                                : sFailed ? <X size={12} color="#EF4444" />
                                                                                                : sActive ? <Activity size={12} color="#3B82F6" />
                                                                                                : <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#D1D5DB' }} />}
                                                                                        </div>
                                                                                        {!isLastStep && (
                                                                                            <div style={{ width: '2px', flex: 1, minHeight: '12px', background: lineColor, marginTop: '2px' }} />
                                                                                        )}
                                                                                    </div>
                                                                                    <div style={{ paddingBottom: isLastStep ? '0' : '12px', flex: 1 }}>
                                                                                        <div style={{ fontSize: '13px', fontWeight: sActive ? '700' : '500', color: sSkipped ? '#9CA3AF' : '#111827' }}>
                                                                                            {step.title || step.name}
                                                                                        </div>
                                                                                        {step.completedByName && (
                                                                                            <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '2px' }}>
                                                                                                {t('by') || 'By'} {step.completedByName}
                                                                                            </div>
                                                                                        )}
                                                                                        {sActive && step.actionConfig?.assigneeName && (
                                                                                            <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '2px' }}>
                                                                                                {t('assignedTo') || 'Assigned to'} {step.actionConfig.assigneeName}
                                                                                            </div>
                                                                                        )}
                                                                                        {step.startedAt && (
                                                                                            <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>
                                                                                                {new Date(step.startedAt).toLocaleDateString()}
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="sidebar-tab-actions">
                                    {/* Versions */}
                                    <div className="sidebar-card">
                                        <div className="card-header-minimal">
                                            <History size={18} className="text-brand-gold" />
                                            <h3>{t('versionHistory')}</h3>
                                            {!isPendingDoc && (
                                                <button
                                                    className="add-inline-btn"
                                                    onClick={() => fileInputRef.current?.click()}
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            )}
                                        </div>
                                        <div className="compact-list">
                                            {sidebarVersions.length === 0 ? (
                                                <p className="empty-text-small">{t('noVersions')}</p>
                                            ) : (
                                                sidebarVersions.sort((a, b) => (b.version || 0) - (a.version || 0)).map((v) => (
                                                    <div key={v.id} className="compact-item">
                                                        <div className="item-main">
                                                            <div className="item-title-row">
                                                                <span className="item-title">v{v.version}</span>
                                                                {v.version === selectedDoc.current_version && <span className="current-badge">{t('current')}</span>}
                                                            </div>
                                                            <span className="item-meta">{v.created_at ? new Date(v.created_at).toLocaleDateString() : '-'} • {v.createdByName || '-'}</span>
                                                        </div>
                                                        <div className="item-actions">
                                                            <Tooltip content={t('download')}>
                                                                <button 
                                                                    className="icon-btn-small" 
                                                                    onClick={async () => {
                                                                        if (isPendingDoc) return;
                                                                        try {
                                                                            const blob = await downloadDocumentVersion(v.id);
                                                                            const url = window.URL.createObjectURL(blob);
                                                                            const a = document.createElement('a');
                                                                            a.href = url;
                                                                            a.download = v.file_name;
                                                                            document.body.appendChild(a);
                                                                            a.click();
                                                                            window.URL.revokeObjectURL(url);
                                                                            document.body.removeChild(a);
                                                                        } catch (err) {
                                                                            error(t('downloadError'));
                                                                        }
                                                                    }}
                                                                    disabled={isPendingDoc}
                                                                    style={isPendingDoc ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                                                                >
                                                                    <Download size={14} />
                                                                </button>
                                                            </Tooltip>
                                                            <Tooltip content={t('delete')}>
                                                                <button 
                                                                    className="icon-btn-small text-danger" 
                                                                    onClick={() => {
                                                                        if (isPendingDoc) return;
                                                                        confirm({
                                                                        title: t('delete'),
                                                                        message: t('confirmDeleteVersion'),
                                                                        type: 'danger',
                                                                        onConfirm: async () => {
                                                                            try {
                                                                                const result = await deleteDocumentVersion(v.id);
                                                                                if (result.isSucceeded || result.apiStatusCode === 200) {
                                                                                    success(result.successMessage || t('versionDeleted'));
                                                                                    loadSidebarData(selectedDoc.id);
                                                                                } else {
                                                                                    error(result.errorMessage || t('deleteError'));
                                                                                }
                                                                            } catch (err: any) {
                                                                                error(t('deleteError'));
                                                                            }
                                                                        }
                                                                    });
                                                                }}
                                                                disabled={isPendingDoc}
                                                                style={isPendingDoc ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </Tooltip>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            style={{ display: 'none' }}
                                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.odt,.ods,.odp,.rtf,.txt,.csv,.png,.jpg,.jpeg,.gif,.bmp,.tiff,.tif,.webp,.svg,.json,.xml,.zip,.rar,.7z"
                                            onChange={async (e) => {
                                                if (e.target.files?.[0]) {
                                                    try {
                                                        const result = await uploadDocumentVersion(selectedDoc.id, e.target.files[0]);
                                                        if (result.isSucceeded || result.apiStatusCode === 200) {
                                                            success(result.successMessage || t('versionUploaded'));
                                                            loadSidebarData(selectedDoc.id);
                                                        } else {
                                                            error(result.errorMessage || t('uploadError'));
                                                        }
                                                    } catch (err: any) {
                                                        error(err.message || t('uploadError'));
                                                    }
                                                }
                                            }}
                                        />
                                    </div>

                                    {/* Document Access (ACLs) */}
                                    <div className="sidebar-card">
                                        <div className="card-header-minimal">
                                            <Shield size={18} className="text-brand-gold" />
                                            <h3>{t('documentAccess') || 'Document Access'}</h3>
                                            {!isPendingDoc && (
                                                <button className="add-inline-btn" onClick={() => setIsAddPermissionModalOpen(true)}>
                                                    <Plus size={16} />
                                                </button>
                                            )}
                                        </div>
                                        <div className="compact-list">
                                            {sidebarAcls.length === 0 ? (
                                                <p className="empty-text-small">{t('noOneHasAccess')}</p>
                                            ) : (
                                                sidebarAcls.map((acl) => {
                                                    const isOwner = selectedDoc.owner_user_id === acl.userId;
                                                    const member = workspaceMembers.find(m => m.userId === acl.userId);
                                                    const name = acl.name || (member ? (member.nameEn || member.nameAr) : (acl.userId || t('user')));

                                                    return (
                                                        <div key={acl.id || acl.userId} className="compact-item">
                                                            <div className="user-avatar-small">
                                                                {name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div className="item-main">
                                                                <span className="item-title">{name}</span>
                                                                {isOwner ? (
                                                                    <span className="role-chip">{t('owner')}</span>
                                                                ) : (
                                                                    <select
                                                                        value={acl.permission}
                                                                        onChange={async (e) => {
                                                                            if (isPendingDoc) return;
                                                                            try {
                                                                                await updateDocumentAcl({
                                                                                    documentId: selectedDoc.id,
                                                                                    userId: acl.userId || '',
                                                                                    permission: e.target.value
                                                                                });
                                                                                success(t('permissionUpdated'));
                                                                                loadSidebarData(selectedDoc.id);
                                                                            } catch (err) {
                                                                                error(t('updateError'));
                                                                            }
                                                                        }}
                                                                        className="role-select-tiny"
                                                                        style={{
                                                                            fontSize: '11px', padding: '2px 4px',
                                                                            borderRadius: '4px', border: '1px solid #e2e8f0',
                                                                            width: 'fit-content',
                                                                            ...(isPendingDoc ? { opacity: 0.5, cursor: 'not-allowed' } : {})
                                                                        }}
                                                                        disabled={isPendingDoc}
                                                                    >
                                                                        <option value="viewer">{t('viewer')}</option>
                                                                        <option value="editor">{t('editor')}</option>
                                                                        <option value="admin">{t('admin')}</option>
                                                                    </select>
                                                                )}
                                                            </div>
                                                            {!isOwner && acl.id && (
                                                                <Tooltip content={t('removeAccess')}>
                                                                    <button
                                                                        className="icon-btn-small text-danger"
                                                                        onClick={() => {
                                                                            if (isPendingDoc) return;
                                                                            confirm({
                                                                                title: t('removeAccess'),
                                                                                message: t('confirmRemoveAccess'),
                                                                                type: 'danger',
                                                                                onConfirm: async () => {
                                                                                    try {
                                                                                        await deleteDocumentAcl(acl.id!);
                                                                                        success(t('accessRemoved'));
                                                                                        loadSidebarData(selectedDoc.id);
                                                                                    } catch (err: any) {
                                                                                        error(t('removeAccessError'));
                                                                                    }
                                                                                }
                                                                            });
                                                                        }}
                                                                        disabled={isPendingDoc}
                                                                        style={isPendingDoc ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                                                                    >
                                                                        <Trash2 size={14} />
                                                                    </button>
                                                                </Tooltip>
                                                            )}
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>

                                    {/* External Invitations */}
                                    <div className="sidebar-card">
                                        <div className="card-header-minimal">
                                            <Users size={18} className="text-brand-gold" />
                                            <h3>{t('externalSharing') || 'External Sharing'}</h3>
                                            {!isPendingDoc && (
                                                <button className="add-inline-btn" onClick={() => setIsShareModalOpen(true)}>
                                                    <Plus size={16} />
                                                </button>
                                            )}
                                        </div>
                                        <div className="compact-list">
                                            {sidebarPermissions.length === 0 ? (
                                                <p className="empty-text-small">{t('noOneHasAccess')}</p>
                                            ) : (
                                                sidebarPermissions.map((p) => (
                                                    <div key={p.id} className="compact-item">
                                                        <div className="user-avatar-small">
                                                            {(p.email || p.name || 'U').charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="item-main">
                                                            <span className="item-title">{p.email || p.name}</span>
                                                            <span className="role-chip">{p.isOwner ? t('owner') : t(p.role || 'viewer')}</span>
                                                        </div>
                                                        {!p.isOwner && (
                                                            <Tooltip content={t('removeAccess')}>
                                                                <button
                                                                    className="icon-btn-small text-danger"
                                                                    onClick={() => {
                                                                        if (isPendingDoc) return;
                                                                        confirm({
                                                                            title: t('removeAccess'),
                                                                            message: t('confirmRemoveAccess'),
                                                                            type: 'danger',
                                                                            onConfirm: async () => {
                                                                                try {
                                                                                    await deleteInvitation(p.id);
                                                                                    success(t('accessRemoved'));
                                                                                    loadSidebarData(selectedDoc.id);
                                                                                } catch (err: any) {
                                                                                    error(t('removeAccessError'));
                                                                                }
                                                                            }
                                                                        });
                                                                    }}
                                                                    disabled={isPendingDoc}
                                                                    style={isPendingDoc ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </Tooltip>
                                                        )}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <ShareModal
                isOpen={isShareModalOpen}
                onClose={() => {
                    setIsShareModalOpen(false);
                    if (selectedDoc) {
                        loadSidebarData(selectedDoc.id);
                    }
                }}
                documentName={selectedDoc?.title || ''}
                documentId={selectedDoc?.id || ''}
                onSuccess={() => {
                    if (selectedDoc) {
                        loadSidebarData(selectedDoc.id);
                    }
                }}
            />

            {selectedDoc && (
                <AddPermissionModal
                    isOpen={isAddPermissionModalOpen}
                    onClose={() => setIsAddPermissionModalOpen(false)}
                    documentId={selectedDoc.id}
                    onPermissionAdded={() => loadSidebarData(selectedDoc.id)}
                />
            )}
        </div>
        </>
    );
};

export default ExplorerLayout;
