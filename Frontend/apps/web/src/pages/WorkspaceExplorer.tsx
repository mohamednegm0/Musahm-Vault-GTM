import React, { useState, useEffect } from 'react';
import Breadcrumb, { BreadcrumbItem } from '../components/Breadcrumb';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  DocumentVersion,
  getDocumentVersions,
  deleteDocumentVersion,
  downloadDocumentVersion,
  uploadDocumentVersion
} from '../api/documentVersions';
import { getDocumentInvitations, deleteInvitation, Invitation } from '../api/invitations';
import { getWorkspaceMemberDetails, WorkspaceMemberDetails } from '../api/workspaceMembers';
import { getDocumentAcls, deleteDocumentAcl, DocumentAcl, updateDocumentAcl } from '../api/documentAcls';
import { ArrowLeft, ArrowRight, FileText, Search, Plus, Users, Edit2, Trash2, X, Eye, Download, Send, History, Shield, Info, ChevronRight, MoreVertical, Folder, Calendar, Clock, AlertCircle, Star, GitBranch, Activity, CheckCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { useToast } from '../contexts/ToastContext';
import DocumentsLayout from '../components/DocumentsLayout';
import { Document as DocCard } from '../components/DocumentCard';
import { getDocuments, getDocumentsByWorkspaceId, Document, uploadDocumentWithMetadata, updateDocument, getDocumentPreview, downloadDocument, deleteDocument } from '../api/documents';
import { getWorkspaceById, updateWorkspace, deleteWorkspace, deactivateWorkspace, Workspace, getWorkspaceChildren, WorkspaceChild } from '../api/workspaces';
import { getWorkflows } from '../api/workflows';
import { getInstancesByTarget, WorkflowInstance } from '../api/workflowInstances';
import { WorkspaceType } from '../services/workspaceService';
import { setWorkspaceQuickAccess, setDocumentQuickAccess } from '../services/quickAccessService';
import apiClient from '../api/apiClient';
import UploadDocumentModal from '../components/UploadDocumentModal';
import UpdateDocumentModal from '../components/UpdateDocumentModal';
import ShareModal from '../components/ShareModal';
import AddPermissionModal from '../components/AddPermissionModal';
import WorkflowAssignmentModal from '../components/WorkflowAssignmentModal';
import { useConfirm } from '../contexts/ConfirmContext';
import Tooltip from '../components/Tooltip';
import LoadingState from '../components/LoadingState';
import Pagination from '../components/Pagination';
import EmptyState from '../components/EmptyState';

import './WorkspaceExplorer.css';

const WorkspaceExplorer: React.FC = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language } = useLanguage();
  const { refreshWorkspaces, workspaces } = useWorkspace(); // Global sync & list
  const { success, error } = useToast(); // Toast notifications
  const { confirm } = useConfirm();

  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [folders, setFolders] = useState<WorkspaceChild[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingName, setEditingName] = useState('');
  const [editingSlug, setEditingSlug] = useState('');
  const [editingDescription, setEditingDescription] = useState('');
  const [editingType, setEditingType] = useState<WorkspaceType>(WorkspaceType.Board);
  const [editingPrivacy, setEditingPrivacy] = useState('private');
  const [editingStorageLimit, setEditingStorageLimit] = useState(1000);
  const [editingAllowInvites, setEditingAllowInvites] = useState(true);
  const [editError, setEditError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Star State
  const [isStarred, setIsStarred] = useState(false);
  // State for add folder modal
  const [isAddFolderModalOpen, setIsAddFolderModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isWorkflowModalOpen, setIsWorkflowModalOpen] = useState(false);
  const [selectedAssignmentTarget, setSelectedAssignmentTarget] = useState<{ id: string, name: string, type: 'Folder' | 'Workspace' | 'Document' } | null>(null);
  const [hasWorkflows, setHasWorkflows] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [newFolderName, setNewFolderName] = useState('');
  const [addingFolder, setAddingFolder] = useState(false);
  const [addFolderError, setAddFolderError] = useState('');

  const [editingDocument, setEditingDocument] = useState<Document | null>(null);

  // New UI State
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<'image' | 'pdf' | 'other' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadWorkspaceData();
  }, [workspaceId]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('openAssignments') === 'true') {
      setIsWorkflowModalOpen(true);
    }
  }, [location.search]);

  const [sidebarTab, setSidebarTab] = useState<'details' | 'actions'>('details');
  const [sidebarVersions, setSidebarVersions] = useState<DocumentVersion[]>([]);
  const [sidebarPermissions, setSidebarPermissions] = useState<any[]>([]);
  const [sidebarAcls, setSidebarAcls] = useState<DocumentAcl[]>([]);
  const [sidebarWorkflows, setSidebarWorkflows] = useState<WorkflowInstance[]>([]);
  const [workspaceMembers, setWorkspaceMembers] = useState<WorkspaceMemberDetails[]>([]);
  const [loadingSidebarData, setLoadingSidebarData] = useState(false);
  const [isAddPermissionModalOpen, setIsAddPermissionModalOpen] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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
      setWorkspaceMembers([]);
    }
  }, [selectedDoc]);

  const loadSidebarData = async (docId: string) => {
    setLoadingSidebarData(true);
    try {
      const [versions, invites, acls] = await Promise.all([
        getDocumentVersions(docId).catch(() => []),
        getDocumentInvitations(docId).catch(() => []),
        getDocumentAcls(docId).catch(() => [])
      ]);

      setSidebarVersions(versions);
      setSidebarPermissions(invites);
      setSidebarAcls(acls);

      // Fetch Workflows
      try {
        const wfInstances = await getInstancesByTarget(docId);
        setSidebarWorkflows(wfInstances);
      } catch (e) {
        setSidebarWorkflows([]);
      }

      // Fetch workspace members for name mapping if doc has workspace_id
      if (selectedDoc?.workspace_id) {
        const members = await getWorkspaceMemberDetails(selectedDoc.workspace_id).catch(() => []);
        setWorkspaceMembers(members);
      } else if (workspaceId && workspaceId !== 'all') {
        const members = await getWorkspaceMemberDetails(workspaceId).catch(() => []);
        setWorkspaceMembers(members);
      }
    } catch (e) {
      console.error("Failed to load sidebar data", e);
    } finally {
      setLoadingSidebarData(false);
    }
  };

  const previewDocIdRef = React.useRef<string | null>(null);

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

  const loadWorkspaceData = async () => {
    if (!workspaceId) return;

    try {
      setLoading(true);

      // Load workspace details and documents
      const isAllDocs = workspaceId === 'all';

      const workspacePromise = isAllDocs
        ? Promise.resolve(null)
        : getWorkspaceById(workspaceId).catch(() => null);

      // 2. Fetch Documents (All vs Specific Workspace)
      const documentsPromise = isAllDocs
        ? getDocuments().catch(() => [])
        : getDocumentsByWorkspaceId(workspaceId).catch(() => []);

      // 3. Fetch Children (Folders)
      const childrenPromise = !isAllDocs
        ? getWorkspaceChildren(workspaceId).catch(() => [])
        : Promise.resolve([]);

      // 4. Check for workflows
      const workflowsPromise = getWorkflows().catch(() => []);

      // eslint-disable-next-line
      const [workspaceData, fetchedDocuments, children, workflows] = await Promise.all([
        workspacePromise,
        documentsPromise,
        childrenPromise,
        workflowsPromise
      ]);

      setHasWorkflows(workflows && workflows.length > 0);

      if (workspaceData) {
        setWorkspace(workspaceData);
        // Initialize edit form state
        setEditingName(workspaceData.name || '');
        setEditingSlug(workspaceData.slug || '');
        setEditingDescription(workspaceData.description || '');
        setEditingType((workspaceData.type as WorkspaceType) || WorkspaceType.Board);
        setEditingPrivacy(workspaceData.settings?.privacy || 'private');
        setEditingStorageLimit(workspaceData.settings?.storageLimitMb || 1000);
        setEditingAllowInvites(workspaceData.settings?.allowInvites ?? true);

        // Check if starred (quick access)
        setIsStarred(workspaceData.isQuickAccess || false);

        // Build Breadcrumbs
        const items: BreadcrumbItem[] = [
          { label: t('home'), onClick: () => navigate('/') }
        ];

        // Fetch parents
        let current = workspaceData;
        const chain: Workspace[] = [current];

        let depth = 0;
        let parentId = current.parentId;

        // Fetch ancestors
        while (parentId && depth < 5) {
          try {
            // Sequential fetch to ensure order
            const parent = await getWorkspaceById(parentId);
            if (parent) {
              chain.unshift(parent);
              parentId = parent.parentId;
            } else {
              break;
            }
          } catch (e) {
            break;
          }
          depth++;
        }

        chain.forEach(w => {
          items.push({
            label: w.name,
            onClick: () => navigate(`/workspace/${w.id}`)
          });
        });

        setBreadcrumbs(items);

      } else if (isAllDocs) {
        setWorkspace(null);
        setBreadcrumbs([
          { label: t('home'), onClick: () => navigate('/') },
          { label: t('allDocuments') }
        ]);
      }

      setDocuments(fetchedDocuments);
      const foldersWithCounts = (children ? (children as WorkspaceChild[]).filter((c: WorkspaceChild) => !c.type || c.type === 'folder' || c.isDir) : []);
      setFolders(foldersWithCounts);

    } catch (err) {
      console.error('Error loading workspace:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderFolders = () => {
    if (!folders || folders.length === 0) return null;

    return (
      <div className="folders-grid-section">
        <div className="section-header-row">
          <h3 className="section-title">
            <Folder size={18} className="title-icon" />
            <div style={{ margin: '0 5px' }}>{t('folders')}</div> <span>({folders.length})</span>
          </h3>
        </div>
        <div className="folders-grid">
          {folders.map(folder => (
            <div
              key={folder.id}
              className="folder-card"
              onClick={() => navigate(`/workspace/${folder.id}`)}
            >
              <div className="folder-card-content">
                <div className="folder-icon-box">
                  <div className="folder-icon-wrapper">
                    <Folder size={24} className="main-folder-icon" />
                    <div className="folder-icon-back"></div>
                  </div>
                </div>
                <div className="folder-info">
                  <div className="folder-name-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="folder-name-text">
                      {folder.name}
                    </span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {!workspace?.legalHold && (
                        <>
                          {hasWorkflows && (
                            <button
                              className="folder-action-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedAssignmentTarget({
                                  id: folder.id,
                                  name: folder.name,
                                  type: 'Folder'
                                });
                                setIsWorkflowModalOpen(true);
                              }}
                              data-tooltip-content={t('workflowAssignments') || 'Workflow Assignments'}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#64748b', opacity: 0.7 }}
                            >
                              <GitBranch size={16} />
                            </button>
                          )}
                          <button
                            className="folder-action-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteFolder(folder.id);
                            }}
                            data-tooltip-content={t('delete') || 'Delete'}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#ef4444' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
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

  const handleToggleStar = async () => {
    if (!workspaceId || workspaceId === 'all') return;
    const newState = !isStarred;
    setIsStarred(newState);
    try {
      await setWorkspaceQuickAccess(workspaceId, newState);
      await refreshWorkspaces();
      success(newState ? (t('workspaceStarred') || 'Workspace starred') : (t('workspaceUnstarred') || 'Workspace unstarred'));
    } catch (err) {
      console.error("Failed to toggle star", err);
      setIsStarred(!newState);
      error(t('errorTogglingStar') || 'Failed to toggle star');
    }
  };

  const hasDependencies = documents.length > 0 || folders.length > 0;

  const handleDeleteWorkspace = async () => {
    if (!workspaceId || workspaceId === 'all') return;

    confirm({
      title: t('deleteWorkspace') || 'Delete Workspace',
      message: t('confirmDeleteWorkspace') || 'Are you sure you want to delete this workspace and all its contents?',
      confirmText: t('delete') || 'Delete',
      cancelText: t('cancel') || 'Cancel',
      type: 'danger',
      onConfirm: async () => {
        try {
          const result = await deleteWorkspace(workspaceId);

          if (result.apiStatusCode === 460) {
            success(
              t('workspaceDeletePendingWorkflow') ||
              'تم إرسال طلب الحذف — يحتاج موافقة من المهام / Delete request sent — awaiting approval in Tasks'
            );
            return;
          }

          if (!result.isSucceeded) {
            error(result.errorMessage || t('errorDeletingWorkspace') || 'Failed to delete workspace');
            return;
          }

          await refreshWorkspaces();
          success(t('workspaceDeleted') || 'Workspace deleted successfully');
          navigate('/');
        } catch (err: any) {
          console.error("Failed to delete workspace", err);
          error(err.errorMessage || t('errorDeletingWorkspace') || 'Failed to delete workspace');
        }
      }
    });
  };

  const handleDeleteFolder = async (folderId: string) => {
    confirm({
      title: t('deleteFolder') || 'Delete Folder',
      message: t('confirmDeleteFolder') || 'Are you sure you want to delete this folder and all its contents?',
      confirmText: t('delete') || 'Delete',
      cancelText: t('cancel') || 'Cancel',
      type: 'danger',
      onConfirm: async () => {
        try {
          const result = await deleteWorkspace(folderId);

          if (result.apiStatusCode === 460) {
            success(
              t('workspaceDeletePendingWorkflow') ||
              'تم إرسال طلب الحذف — يحتاج موافقة من المهام / Delete request sent — awaiting approval in Tasks'
            );
            return;
          }

          if (!result.isSucceeded) {
            error(result.errorMessage || t('errorDeletingFolder') || 'Failed to delete folder');
            return;
          }

          await refreshWorkspaces();
          success(t('folderDeleted') || 'Folder deleted successfully');
          loadWorkspaceData(); // Refresh current view
        } catch (err: any) {
          console.error("Failed to delete folder", err);
          error(err.errorMessage || t('errorDeletingFolder') || 'Failed to delete folder');
        }
      }
    });
  };

  const handleDeleteDoc = async (docId: string) => {
    confirm({
      title: t('deleteDocument') || 'Delete Document',
      message: t('confirmDeleteDocument') || 'Are you sure you want to delete this document?',
      confirmText: t('delete') || 'Delete',
      cancelText: t('cancel') || 'Cancel',
      type: 'danger',
      onConfirm: async () => {
        try {
          const result = await deleteDocument(docId);

          if (result && (result as any).apiStatusCode === 460) {
            success(
              t('documentDeletePendingWorkflow') ||
              'تم إرسال طلب حذف المستند — في انتظار موافقة مسار العمل'
            );
            if (selectedDoc?.id === docId) setSelectedDoc(null);
            loadWorkspaceData();
            return;
          }

          if (result && result.isSucceeded === false) {
            error(result.errorMessage || t('errorDeletingDocument') || 'Failed to delete document');
            return;
          }
          success(t('documentDeleted') || 'Document deleted successfully');
          if (selectedDoc?.id === docId) {
            setSelectedDoc(null);
          }
          loadWorkspaceData(); // refresh view
        } catch (err: any) {
          console.error("Failed to delete document", err);
          error(err.response?.data?.errorMessage || err.errorMessage || t('errorDeletingDocument') || 'Failed to delete document');
        }
      }
    });
  };

  const handleEditWorkspace = () => {
    if (!workspace) return;
    setEditingName(workspace.name || '');
    setEditingSlug(workspace.slug || '');
    setEditingDescription(workspace.description || '');
    setEditingType((workspace.type as WorkspaceType) || WorkspaceType.Board);
    setEditingPrivacy(workspace.settings?.privacy || 'private');
    setEditingStorageLimit(workspace.settings?.storageLimitMb || 1000);
    setEditingAllowInvites(workspace.settings?.allowInvites ?? true);
    setEditError('');
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!workspaceId) return;

    if (!editingName.trim()) {
      setEditError(t('workspaceNameRequired'));
      return;
    }

    try {
      setIsSaving(true);
      const updateData: Workspace = {
        ...workspace,
        name: editingName,
        description: editingDescription,
        type: editingType,
        settings: {
          privacy: editingPrivacy,
          allowInvites: editingAllowInvites,
          storageLimitMb: editingStorageLimit
        }
      };

      const result = await updateWorkspace(workspaceId, updateData);

      // 460 = WorkflowRequired: action is held pending task approval
      if (result.apiStatusCode === 460) {
        setIsEditModalOpen(false);
        // Show an informational toast, not an error
        success(
          t('workspaceUpdatePendingWorkflow') ||
          'تم إرسال طلب التعديل — يحتاج موافقة من المهام / Update request sent — awaiting approval in Tasks'
        );
        return;
      }

      if (!result.isSucceeded) {
        const msg = result.errorMessage || t('errorUpdatingWorkspace') || 'Error updating workspace';
        setEditError(msg);
        error(msg);
        return;
      }

      setWorkspace(updateData);
      await refreshWorkspaces();
      success(t('workspaceUpdated') || 'Workspace updated successfully');
      setIsEditModalOpen(false);
    } catch (err: any) {
      console.error("Failed to update workspace", err);
      const errorMsg = err.response?.data?.errorMessage || err.response?.data?.message || t('errorUpdatingWorkspace');
      setEditError(errorMsg);
      error(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseEditModal = () => {
    setEditError('');
    setIsEditModalOpen(false);
  };

  const getWorkspaceTitle = () => {
    if (!workspaceId) return '';
    if (workspaceId === 'all') return t('allDocuments') || 'All Documents';
    if (workspace?.name) return workspace.name;
    const contextWorkspace = workspaces.find(w => w.id === workspaceId);
    if (contextWorkspace?.name) return contextWorkspace.name;
    return decodeURIComponent(workspaceId);
  };

  const workspaceTitle = getWorkspaceTitle();

  const getDocStatusClass = (status: string = '') => {
    const s = status.toLowerCase();
    if (s === 'approved' || s === 'signed') return 'status-approved-pill';
    if (s === 'active') return 'status-active-pill';
    if (s === 'pending signature' || s === 'pending' || s === 'in review' || s === 'inreview') return 'status-pending-pill';
    if (s === 'draft') return 'status-draft-pill';
    return 'status-neutral-pill';
  };

  const getDocStatusText = (status: string = '') => {
    const statusMap: { [key: string]: string } = {
      'Approved': t('approved'),
      'Active': t('active') || 'Active',
      'Pending Signature': t('pendingSignature'),
      'Pending': t('pending') || 'Pending',
      'Signed': t('signed'),
      'In Review': t('inReview'),
      'InReview': t('inReview'),
      'Draft': t('draft')
    };
    return statusMap[status] || status;
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

  const toggleStar = async () => {
    if (!workspaceId || workspaceId === 'all') return;
    try {
      const newState = !isStarred;
      await setWorkspaceQuickAccess(workspaceId, newState);
      setIsStarred(newState);
      if (newState) {
        success(t('addedToFavorites') || 'Added to favorites');
      } else {
        success(t('removedFromFavorites') || 'Removed from favorites');
      }
    } catch (err) {
      console.error("Failed to toggle favorites", err);
      error(t('errorUpdatingFavorites') || 'Error updating favorites');
    }
  };

  const handleNavigate = (path: string) => {
    navigate(`/workspace/${workspaceId}${path}`);
  };

  const toggleDocStar = async (docId: string, currentState: boolean) => {
    try {
      const newState = !currentState;
      await setDocumentQuickAccess(docId, newState);

      // Update local state
      setDocuments(prev => prev.map(d =>
        d.id === docId ? { ...d, isQuickAccess: newState } : d
      ));

      if (newState) {
        success(t('addedToFavorites') || 'Added to favorites');
      } else {
        success(t('removedFromFavorites') || 'Removed from favorites');
      }
    } catch (err) {
      console.error("Failed to toggle document favorites", err);
      error(t('errorUpdatingFavorites') || 'Error updating favorites');
    }
  };

  const handleAddFolder = async () => {
    if (!newFolderName.trim()) {
      setAddFolderError(t('folderNameRequired'));
      return;
    }
    setAddingFolder(true);
    setAddFolderError('');
    try {
      await apiClient.post('/api/Workspaces', {
        name: newFolderName,
        parentId: workspaceId
      });
      setIsAddFolderModalOpen(false);
      setNewFolderName('');
      loadWorkspaceData();
    } catch (e) {
      setAddFolderError(t('errorSaving') || 'حدث خطأ أثناء الحفظ');
    } finally {
      setAddingFolder(false);
    }
  };

  const handleUploadDocument = async (data: { title: string; documentType: string; status: string; tags: string[]; file: File }) => {
    if (!workspaceId || workspaceId === 'all') return;

    try {
      const result = await uploadDocumentWithMetadata({
        Title: data.title,
        WorkspaceId: workspaceId,
        ParentId: workspaceId, // Set ParentId to current folder/workspace
        DocumentType: data.documentType,
        Status: data.status,
        Tags: data.tags,
        file: data.file
      });

      if (result.apiStatusCode === 200 || result.isSucceeded) {
        success(result.successMessage || t('documentUploaded') || 'Document uploaded successfully');
        loadWorkspaceData();
      } else {
        error(result.errorMessage || t('errorUploading') || 'Failed to upload document');
      }
    } catch (err: any) {
      console.error('Failed to upload document:', err);
      error(err.errorMessage || t('errorUploading') || 'Failed to upload document');
    }
  };

  const handleEditDocument = (docCard: DocCard) => {
    const fullDoc = documents.find(d => d.id === docCard.id);
    if (fullDoc) {
      setEditingDocument(fullDoc);
    }
  };

  const handleUpdateDocument = async (id: string, data: { title: string; status: string; tags: string[] }) => {
    try {
      await updateDocument(id, {
        title: data.title,
        status: data.status,
        tags: data.tags
      });
      loadWorkspaceData();
    } catch (error) {
      console.error('Failed to update document:', error);
      throw error;
    }
  };

  // Status mapping for filtering
  const statusMapping: Record<string, string> = {
    [t('pendingSignature')]: 'Pending Signature',
    [t('inReview')]: 'In Review',
    [t('approved')]: 'Approved',
    [t('signed')]: 'Signed'
  };

  // Map backend status to frontend status
  const mapStatus = (backendStatus: string | undefined): DocCard['status'] => {
    switch (backendStatus) {
      case 'PendingSignature': case 'Pending': return 'Pending Signature';
      case 'InReview': return 'In Review';
      case 'Approved': return 'Approved';
      case 'Signed': return 'Signed';
      case 'Archived': return 'Expired';
      case 'Draft': return 'Draft';
      default: return 'Draft';
    }
  };

  const workspaceDocuments: DocCard[] = documents.map(doc => ({
    id: doc.id || '',
    name: doc.title,
    category: doc.document_type || 'Document',
    status: mapStatus(doc.status),
    date: doc.created_at ? new Date(doc.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    legal_hold: doc.legal_hold
  }));

  const filters = [t('all'), t('pendingSignature'), t('inReview'), t('approved'), t('signed')];

  // Actions for the header
  const headerActions = workspaceId !== 'all' && (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <button className="btn-primary" onClick={() => setIsUploadModalOpen(true)} style={{ height: '40px', padding: '0 16px' }}>
        <Plus size={18} /> {t('uploadDocument')}
      </button>
      <button className="btn-primary" onClick={() => setIsAddFolderModalOpen(true)} style={{ height: '40px', padding: '0 16px' }}>
        <Plus size={18} /> {t('addFolder')}
      </button>
      <div style={{ width: '1px', height: '24px', background: 'var(--border-color)', margin: '0 4px' }}></div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <Tooltip content={t('members')} position="bottom">
          <button className="btn-icon" onClick={() => handleNavigate('/invite')} style={{ width: '40px', height: '40px' }}><Users size={18} /></button>
        </Tooltip>
        {!workspace?.legalHold && (
          <>
            {hasWorkflows && (
              <Tooltip content={t('workflowAssignments') || 'Workflow Assignments'} position="bottom">
                <button className="btn-icon" onClick={() => setIsWorkflowModalOpen(true)} style={{ width: '40px', height: '40px', color: 'var(--brand-gold)' }}><GitBranch size={18} /></button>
              </Tooltip>
            )}
            <Tooltip content={t('editWorkspace')} position="bottom">
              <button className="btn-icon" onClick={handleEditWorkspace} style={{ width: '40px', height: '40px', color: 'var(--brand-gold)' }}><Edit2 size={18} /></button>
            </Tooltip>
            <Tooltip content={t('deleteWorkspace') || 'Delete Workspace'} position="bottom">
              <button className="btn-icon" onClick={handleDeleteWorkspace} style={{ width: '40px', height: '40px', color: '#ef4444' }}>
                <Trash2 size={18} />
              </button>
            </Tooltip>
          </>
        )}
      </div>
    </div>
  );

  const isPendingDoc = selectedDoc ? ['pending', 'pending signature', 'in review', 'inreview'].includes(selectedDoc.status?.toLowerCase().trim() || '') : false;

  return (
    <>
      {(workspaceId && workspaceId !== 'all') || selectedAssignmentTarget ? (
        <WorkflowAssignmentModal
          isOpen={isWorkflowModalOpen}
          onClose={() => {
            setIsWorkflowModalOpen(false);
            setSelectedAssignmentTarget(null);
          }}
          targetId={selectedAssignmentTarget ? selectedAssignmentTarget.id : workspaceId!}
          targetType={selectedAssignmentTarget ? selectedAssignmentTarget.type : (workspace?.parentId ? 'Folder' : 'Workspace')}
          targetName={selectedAssignmentTarget ? selectedAssignmentTarget.name : (workspace?.name || '')}
        />
      ) : null}
      <div className={`workspace-explorer-view ${language === 'ar' ? 'rtl' : 'ltr'}`}>
        <div >
          <Breadcrumb items={breadcrumbs} />
        </div>
        <div className="explorer-header" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="explorer-header-left" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              type="button"
              className="header-back-btn"
              onClick={() => navigate('/')}
            >
              {language === 'ar' ? <ArrowRight size={22} /> : <ArrowLeft size={22} />}
            </button>
            <div className="title-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {workspace?.legalHold && (
                <Tooltip
                  content={t('legalHoldLockedMsg') || 'System folders cannot be edited, deleted, or assigned workflows.'}
                  position={language === 'ar' ? 'bottom-end' : 'bottom-start'}
                >
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    cursor: 'help',
                    color: '#f59e0b',
                    fontSize: '20px',
                    lineHeight: 1,
                  }}>🔒</span>
                </Tooltip>
              )}
              <h1 style={{ marginBottom: 0 }}>{workspaceTitle}</h1>
              {workspaceId !== 'all' && (
                <button
                  className={`star-btn ${isStarred ? 'starred' : ''}`}
                  onClick={toggleStar}
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
            <div className="header-actions-divider"></div>
            {headerActions}
          </div>
        </div>



        <div className="explorer-content-layout">
          <div className={`explorer-main-area ${selectedDoc ? 'with-sidebar' : ''}`}>
            {loading ? (
              <LoadingState fullPage={false} />
            ) : (
              <>
                {renderFolders()}
                {filteredDocs.length === 0 ? (
                  <EmptyState
                    title={t('noDocumentsFound')}
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

                  <button
                    className="btn-sidebar-secondary"
                    onClick={() => {
                      if (isPendingDoc) return;
                      handleDeleteDoc(selectedDoc.id!);
                    }}
                    disabled={isPendingDoc}
                    style={isPendingDoc ? { opacity: 0.5, cursor: 'not-allowed', color: '#ef4444' } : { color: '#ef4444' }}
                  >
                    <Trash2 size={18} />
                    <span>{t('delete') || 'Delete'}</span>
                  </button>

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
                          <span className="meta-value">{selectedDoc.updated_at ? new Date(selectedDoc.updated_at).toLocaleDateString() : '-'}</span>
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
                            {sidebarWorkflows.map(wf => {
                              const wfStatusRaw = String(wf.status || '').toLowerCase();
                              const isTerminated = wfStatusRaw === 'terminated' || wfStatusRaw === '4';
                              const isCompleted = wfStatusRaw === 'completed' || wfStatusRaw === '3';
                              const isActive = wfStatusRaw === 'active' || wfStatusRaw === 'inprogress' || wfStatusRaw === '1';
                              const badgeStyle = isCompleted
                                ? { background: '#D1FAE5', color: '#047857', border: '1px solid #A7F3D0' }
                                : isActive
                                  ? { background: '#FEF3C7', color: '#B45309', border: '1px solid #FDE68A' }
                                  : isTerminated
                                    ? { background: '#FEE2E2', color: '#B91C1C', border: '1px solid #FECACA' }
                                    : { background: '#F3F4F6', color: '#6B7280', border: '1px solid #E5E7EB' };
                              const badgeLabel = isCompleted ? (t('completedStatus') || 'Completed')
                                : isActive ? (t('runningStatus') || 'Active')
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
                                      const sActive = sRaw === 'inprogress' || sRaw === 'active' || sRaw === '2';
                                      const sFailed = sRaw === 'failed' || sRaw === 'rejected' || sRaw === '4';
                                      const sSkipped = isTerminated && !sCompleted && !sActive && !sFailed;
                                      const isLastStep = idx === arr.length - 1;
                                      const iconColor = sCompleted ? '#10B981' : sActive ? '#3B82F6' : sFailed ? '#EF4444' : '#D1D5DB';
                                      const lineColor = sCompleted ? '#10B981' : '#E5E7EB';
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
                                            const apiError = err.response?.data;
                                            if (apiError && apiError.errorMessage) {
                                              error(apiError.errorMessage);
                                            } else {
                                              error(t('deleteError'));
                                            }
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
                              const apiData = err.response?.data;
                              if (apiData) {
                                if (apiData.errorMessage) {
                                  error(apiData.errorMessage);
                                } else {
                                  error(t('uploadError'));
                                }
                              } else {
                                error(err.message || t('uploadError'));
                              }
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

                    {/* External Sharing */}
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

        {isUploadModalOpen && workspaceId !== 'all' && (
          <UploadDocumentModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} onUpload={handleUploadDocument} />
        )}

        <UpdateDocumentModal isOpen={!!editingDocument} onClose={() => setEditingDocument(null)} document={editingDocument} onUpdate={handleUpdateDocument} />

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

        {isAddFolderModalOpen && (
          <div className="modal-overlay">
            <div className="modal" style={{ maxWidth: '400px' }}>
              <h2>{t('addFolder')}</h2>
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label>{t('folderName')}</label>
                <input type="text" value={newFolderName} onChange={e => setNewFolderName(e.target.value)} placeholder={t('enterFolderName')} autoFocus className="form-input" />
              </div>
              {addFolderError && <div style={{ color: '#ef4444', marginBottom: 16, fontSize: '14px' }}>{addFolderError}</div>}
              <div className="modal-buttons">
                <button onClick={() => setIsAddFolderModalOpen(false)} className="btn-secondary">{t('cancel')}</button>
                <button onClick={handleAddFolder} className="btn-primary" disabled={addingFolder}>{addingFolder ? t('saving') : t('save')}</button>
              </div>
            </div>
          </div>
        )}

        {isEditModalOpen && (
          <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) handleCloseEditModal(); }}>
            <div className="workspace-modal workspace-modal-lg">
              <div className="modal-header">
                <h2>{t('editWorkspace') || 'Edit Workspace'}</h2>
                <button className="modal-close-btn" onClick={handleCloseEditModal}><X size={20} /></button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="editWorkspaceName">{t('workspaceName')} *</label>
                  <input type="text" id="editWorkspaceName" value={editingName} onChange={(e) => { setEditingName(e.target.value); setEditError(''); }} placeholder={t('workspaceNamePlaceholder')} disabled={isSaving} />
                </div>
                {/* <div className="form-group">
                  <label htmlFor="editWorkspaceSlug">{t('workspaceSlug')} *</label>
                  <input type="text" id="editWorkspaceSlug" value={editingSlug} onChange={(e) => { const slug = e.target.value.toLowerCase().replace(/\s+/g, '-'); setEditingSlug(slug); setEditError(''); }} placeholder={t('workspaceSlugPlaceholder')} disabled={isSaving} />
                </div> */}
                <div className="form-group">
                  <label htmlFor="editWorkspaceDescription">{t('description')}</label>
                  <textarea id="editWorkspaceDescription" value={editingDescription} onChange={(e) => { setEditingDescription(e.target.value); setEditError(''); }} placeholder={t('enterDescription')} disabled={isSaving} rows={3} />
                </div>
                <div className="form-group">
                  <label htmlFor="editWorkspaceType">{t('workspaceType')} *</label>
                  <select id="editWorkspaceType" value={editingType} onChange={(e) => setEditingType(e.target.value as WorkspaceType)} disabled={isSaving}>
                    <option value={WorkspaceType.Board}>{t('board')}</option>
                    <option value={WorkspaceType.Legal}>{t('legal')}</option>
                    <option value={WorkspaceType.Compliance}>{t('compliance')}</option>
                    <option value={WorkspaceType.HR}>{t('hr')}</option>
                    <option value={WorkspaceType.Projects}>{t('projects')}</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="editWorkspacePrivacy">{t('workspacePrivacy')} *</label>
                  <select id="editWorkspacePrivacy" value={editingPrivacy} onChange={(e) => setEditingPrivacy(e.target.value)} disabled={isSaving}>
                    <option value="private">{t('private')}</option>
                    <option value="internal">{t('internal')}</option>
                    <option value="public">{t('public')}</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="editWorkspaceStorage">{t('workspaceStorage')} (MB)</label>
                  <input type="number" id="editWorkspaceStorage" value={editingStorageLimit} onChange={(e) => setEditingStorageLimit(Math.max(0, Number.parseInt(e.target.value) || 0))} placeholder="1000" disabled={isSaving} />
                </div>
                <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '12px' }}>
                  <input type="checkbox" id="editAllowInvites" checked={editingAllowInvites} onChange={(e) => setEditingAllowInvites(e.target.checked)} disabled={isSaving} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                  <label htmlFor="editAllowInvites" style={{ margin: 0, cursor: 'pointer' }}>{t('allowInvitesLabel')}</label>
                </div>
                {editError && <span className="error-message" style={{ marginTop: '12px', color: '#ef4444' }}>{editError}</span>}
              </div>
              <div className="modal-footer">
                <button className="btn-cancel" onClick={handleCloseEditModal} disabled={isSaving}>{t('cancel')}</button>
                <button className="btn-add" onClick={handleSaveEdit} disabled={isSaving} style={{ background: '#c3924d', color: 'white' }}>{isSaving ? t('saving') : t('save')}</button>
              </div>
            </div>
          </div>
        )}
      </div>
      <AddPermissionModal
        isOpen={isAddPermissionModalOpen}
        onClose={() => setIsAddPermissionModalOpen(false)}
        documentId={selectedDoc?.id || ''}
        onPermissionAdded={() => selectedDoc && loadSidebarData(selectedDoc.id)}
      />
    </>
  );
};

export default WorkspaceExplorer;
