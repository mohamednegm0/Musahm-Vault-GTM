import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  FileText,
  Folder,
  Star,
  Calendar,
  Clock,
  Users,
  FileQuestion,
  Download,
  Trash2,
  Share2,
  Edit,
  Eye,
  Maximize2,
  MoreVertical,
  Plus,
  Shield,
  Upload,
  History,
  Info,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Search,
  CheckCircle2,
  AlertCircle,
  Activity,
  CheckCircle,
  X
} from 'lucide-react';

import { getInstancesByTarget, WorkflowInstance } from '../api/workflowInstances';

import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../contexts/ConfirmContext';
import {
  Document,
  getDocumentById,
  getDocumentPreview,
  deleteDocument,
  updateDocument,
  downloadDocument
} from '../api/documents';
import {
  DocumentVersion,
  getDocumentVersions,
  deleteDocumentVersion,
  downloadDocumentVersion,
  uploadDocumentVersion
} from '../api/documentVersions';
import {
  getDocumentAcls,
  createDocumentAcl,
  updateDocumentAcl,
  deleteDocumentAcl,
  DocumentAcl
} from '../api/documentAcls';
import { getWorkspaceMemberDetails, WorkspaceMemberDetails } from '../api/workspaceMembers';
import { getWorkspaceById } from '../api/workspaces';
import { getDocumentInvitations, deleteInvitation, Invitation } from '../api/invitations';

import Breadcrumb, { BreadcrumbItem } from '../components/Breadcrumb';
import LoadingState from '../components/LoadingState';
import Tooltip from '../components/Tooltip';
import EmptyState from '../components/EmptyState';
import ShareModal from '../components/ShareModal';
import AddPermissionModal from '../components/AddPermissionModal';
import UpdateDocumentModal from '../components/UpdateDocumentModal';

import './DocumentDetails.css';

interface UserPermission {
  id: string;
  userId: string;
  name: string;
  email?: string;
  role: string;
  isOwner?: boolean;
}

const DocumentDetails: React.FC = () => {
  const navigate = useNavigate();
  const { documentId } = useParams<{ documentId: string }>();
  const { t, language } = useLanguage();
  const { success, error } = useToast();
  const { confirm } = useConfirm();
  const location = useLocation();

  // State
  const [doc, setDoc] = useState<Document | null>(location.state?.document || null);
  const [loading, setLoading] = useState<boolean>(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<'image' | 'pdf' | 'other' | null>(null);
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [permissions, setPermissions] = useState<Invitation[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowInstance[]>([]);
  const [workspaceName, setWorkspaceName] = useState<string>('');

  // Modals
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isAddPermissionModalOpen, setIsAddPermissionModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  // Sidebar State
  const [sidebarTab, setSidebarTab] = useState<'details' | 'actions'>('details');
  const [acls, setAcls] = useState<DocumentAcl[]>([]);
  const [workspaceMembers, setWorkspaceMembers] = useState<WorkspaceMemberDetails[]>([]);

  // Versions Upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingVersion, setUploadingVersion] = useState(false);
  const previewDocIdRef = useRef<string | null>(null);

  // Load Main Data
  useEffect(() => {
    if (documentId) {
      loadAllData();
    }
  }, [documentId]);

  const loadAllData = async () => {
    if (!documentId) return;
    setLoading(true);
    try {
      // 1. Fetch Document
      const docData = await getDocumentById(documentId);
      setDoc(docData);

      // 2. Fetch Preview
      try {
        if (previewDocIdRef.current !== documentId) {
          previewDocIdRef.current = documentId;
          const previewBlob = await getDocumentPreview(documentId);
          if (previewBlob && previewBlob.size > 0) {
            const url = URL.createObjectURL(previewBlob);
            setPreviewUrl(url);
            // Simple type check
            if (previewBlob.type.includes('image')) setPreviewType('image');
            else if (previewBlob.type.includes('pdf')) setPreviewType('pdf');
            else setPreviewType('other');
          }
        }
      } catch (e) {
        console.error("Preview load failed", e);
      }

      // 3. Fetch Versions
      try {
        const versionData = await getDocumentVersions(documentId);
        setVersions(versionData);
      } catch (e) {
        console.error("Versions load failed", e);
      }

      // Fetch ACLs
      try {
        const aclData = await getDocumentAcls(documentId);
        setAcls(aclData);
      } catch (e) {
        console.error("ACLs load failed", e);
      }

      // Fetch Workspace Members
      if (docData.workspace_id) {
        try {
          const members = await getWorkspaceMemberDetails(docData.workspace_id);
          setWorkspaceMembers(members);
        } catch (e) {
          console.error("Workspace members load failed", e);
        }
      }

      // 4. Fetch Permissions (Invitations)
      try {
        const invites = await getDocumentInvitations(documentId);
        setPermissions(invites);
      } catch (e) {
        console.error("Invitations load failed", e);
      }

      // 5. Workspace info
      if (docData.workspace_id) {
        try {
          const ws = await getWorkspaceById(docData.workspace_id);
          setWorkspaceName(ws.name || '');
        } catch (e) {
          console.error("Workspace load failed", e);
        }
      }

      // 6. Fetch Workflows
      try {
        const wfInstances = await getInstancesByTarget(documentId);
        setWorkflows(wfInstances);
      } catch (e) {
        setWorkflows([]);
      }

    } catch (err) {
      console.error("Failed to load document details", err);
      error(t('documentFetchError'));
    } finally {
      setLoading(false);
    }
  };

  // Actions
  const handleUpdate = async (id: string, data: any) => {
    try {
      await updateDocument(id, data);
      success(t('updateSuccess'));
      loadAllData(); // Refresh
    } catch (err) {
      error(t('updateError'));
      throw err;
    }
  };

  const handleDelete = () => {
    if (!doc) return;
    confirm({
      title: t('delete'),
      message: t('confirmDelete'),
      type: 'danger',
      onConfirm: async () => {
        try {
          const response: any = await deleteDocument(doc.id);

          if (response && response.apiStatusCode === 460) {
            success(
              t('documentDeletePendingWorkflow') ||
              'تم إرسال طلب حذف المستند — في انتظار موافقة مسار العمل'
            );
            return;
          }

          if (response && response.apiStatusCode && response.apiStatusCode !== 200) {
            error(response.errorMessage || t('deleteError'));
            return;
          }

          success(t('deleteSuccess'));
          navigate('/');
        } catch (err: any) {
          const msg = err.response?.data?.errorMessage || err.errorMessage || t('deleteError');
          error(msg);
        }
      }
    });
  };

  const handleDownload = async () => {
    if (!doc) return;
    try {
      const blob = await downloadDocument(doc.id);
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = doc.title;
      window.document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      window.document.body.removeChild(a);
    } catch (err) {
      error(t('downloadError'));
    }
  };

  const handleDownloadVersion = async (v: DocumentVersion) => {
    try {
      const blob = await downloadDocumentVersion(v.id);
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = v.file_name;
      window.document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      window.document.body.removeChild(a);
    } catch (err) {
      error(t('downloadError'));
    }
  };

  const handleDeleteVersion = async (versionId: string) => {
    confirm({
      title: t('deleteVersion') || 'Delete Version',
      message: t('confirmDeleteVersion') || 'Are you sure you want to delete this version?',
      type: 'danger',
      onConfirm: async () => {
        try {
          const response: any = await deleteDocumentVersion(versionId);
          // Assuming API follows the structure mentioned
          if (response && response.apiStatusCode && response.apiStatusCode !== 200) {
            error(response.errorMessage || t('deleteError'));
            return;
          }

          success(t('deleteSuccess'));
          // Reload versions
          if (documentId) {
            const versionData = await getDocumentVersions(documentId);
            setVersions(versionData);
          }
        } catch (err: any) {
          const msg = err.response?.data?.errorMessage || t('deleteError');
          error(msg);
        }
      }
    });
  };

  const handleRemovePermission = async (permId: string) => {
    if (permId === 'owner') return;
    confirm({
      title: t('removeAccess') || 'Remove Access',
      message: t('confirmRemoveAccess'),
      type: 'danger',
      onConfirm: async () => {
        try {
          await deleteDocumentAcl(permId);
          success(t('accessRemoved'));
          // Reload permissions
          if (documentId) {
            const aclData = await getDocumentAcls(documentId);
            setAcls(aclData);
          }
        } catch (err) {
          error(t('removeAccessError'));
        }
      }
    });
  };

  const handleUploadNewVersion = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && documentId) {
      const file = e.target.files[0];
      try {
        setUploadingVersion(true);
        const response: any = await uploadDocumentVersion(documentId, file);

        // Handle specific API status check if provided in response directly
        if (response && response.apiStatusCode && response.apiStatusCode !== 200) {
          error(response.errorMessage || t('uploadError'));
          return;
        }

        success(t('versionUploaded'));
        // Reload versions
        const versionData = await getDocumentVersions(documentId);
        setVersions(versionData);
      } catch (err: any) {
        // If it's an axios error response
        const apiResp = err.response?.data;
        if (apiResp && apiResp.apiStatusCode && apiResp.apiStatusCode !== 200) {
          error(apiResp.errorMessage || t('uploadError'));
        } else {
          error(t('uploadError'));
        }
      } finally {
        setUploadingVersion(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }
  };

  const getDocStatusClass = (status: string = '') => {
    const s = status.toLowerCase();
    if (s === 'approved' || s === 'signed') return 'status-approved';
    if (s === 'pending signature' || s === 'pending' || s === 'inreview' || s === 'in review') return 'status-pending';
    if (s === 'expired') return 'status-expired';
    return 'status-draft';
  };

  const getDocStatusText = (status: string = '') => {
    const statusMap: { [key: string]: string } = {
      'Approved': t('approved'),
      'Pending Signature': t('pendingSignature'),
      'Signed': t('signed'),
      'InReview': t('inReview'),
      'In Review': t('inReview'),
      'Expired': t('expired'),
      'Draft': t('draft')
    };
    return statusMap[status] || status;
  };

  if (loading && !doc) return <LoadingState fullPage />;

  if (!doc) {
    return (
      <div className="document-details-page">
        <EmptyState
          icon={FileQuestion}
          title={t('documentNotFound')}
          description={t('documentFetchError')}
        />
      </div>
    );
  }

  const breadcrumbs: BreadcrumbItem[] = [
    { label: t('dashboard') || 'Dashboard', onClick: () => navigate('/dashboard') }
  ];

  if (doc.workspace_id) {
    breadcrumbs.push({
      label: workspaceName || t('workspace') || 'Workspace',
      onClick: () => navigate(`/workspace/${doc.workspace_id}`)
    });
  } else {
    breadcrumbs.push({
      label: t('allDocuments') || 'All Documents',
      onClick: () => navigate('/')
    });
  }

  breadcrumbs.push({ label: doc.title || t('document') || 'Document' });

  const isPendingDoc = doc ? ['pending', 'pending signature', 'in review', 'inreview'].includes(doc.status?.toLowerCase().trim() || '') : false;

  return (
    <div className={`document-details-page ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      <div style={{ padding: '24px 24px 0 24px' }}>
        <Breadcrumb items={breadcrumbs} />
      </div>
      <div className="doc-header">
        <div className="doc-header-left">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (doc?.workspace_id) {
                navigate(`/workspace/${doc.workspace_id}`);
              } else {
                navigate(-1);
              }
            }}
            className="back-button-circle"
          >
            {language === 'ar' ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
          </button>
          <div className="doc-header-info">
            <h1 className="doc-title">{doc.title}</h1>
            <div className="doc-subtitle">
              <span>{t('created')} {doc.created_at ? new Date(doc.created_at).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US') : ''}</span>
              <span className="dot-separator">•</span>
              <span>{t('updated')} {doc.updated_at ? new Date(doc.updated_at).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US') : ''}</span>
              <span className="dot-separator">•</span>
              <span className={`status-tag ${getDocStatusClass(doc.status)}`}>
                {getDocStatusText(doc.status)}
              </span>
            </div>
          </div>
        </div>

        <div className="doc-header-actions">
          <button 
            className="btn-secondary" 
            onClick={() => {
              if (isPendingDoc) return;
              setIsUpdateModalOpen(true);
            }}
            disabled={isPendingDoc}
            style={isPendingDoc ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
          >
            <Edit size={18} />
            <span>{t('editFields') || t('update')}</span>
          </button>
          <button 
            className="btn-primary" 
            onClick={() => {
              if (isPendingDoc) return;
              setIsShareModalOpen(true);
            }}
            disabled={isPendingDoc}
            style={isPendingDoc ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
          >
            <Share2 size={18} />
            <span>{t('share')}</span>
          </button>
        </div>
      </div>

      <div className="doc-content-layout">
        <div className="doc-preview-section">
          <div className="preview-container-header">
            <h2 className="section-title">{t('documentPreview') || 'Document Preview'}</h2>
            <div className="preview-toolbar">
              <Tooltip content={t('download')}>
                <button 
                  onClick={handleDownload} 
                  className="toolbar-btn"
                  disabled={isPendingDoc}
                  style={isPendingDoc ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                >
                  <Download size={18} />
                </button>
              </Tooltip>
              <Tooltip content={t('openInNewTab')}>
                <button 
                  onClick={() => !isPendingDoc && previewUrl && window.open(previewUrl, '_blank')} 
                  className="toolbar-btn"
                  disabled={isPendingDoc}
                  style={isPendingDoc ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                >
                  <Maximize2 size={18} />
                </button>
              </Tooltip>
            </div>
          </div>

          <div className="preview-viewport">
            {previewUrl ? (
              previewType === 'image' ? (
                <img src={previewUrl} alt={doc.title} className="preview-image" />
              ) : previewType === 'pdf' ? (
                <iframe src={`${previewUrl}#toolbar=0`} className="preview-pdf" title="document-preview" />
              ) : (
                <div className="preview-fallback">
                  <FileText size={64} className="text-gray-300" />
                  <p>{t('previewNotAvailable') || 'Preview not supported for this file type'}</p>
                  <button className="btn-outline" onClick={handleDownload}>{t('downloadToView')}</button>
                </div>
              )
            ) : (
              <div className="preview-loading">
                <LoadingState />
                <p>{t('loadingPreview')}</p>
              </div>
            )}
          </div>
        </div>

        <div className="explorer-sidebar">
          <div className="sidebar-header">
            <h2>{t('documentDetails')}</h2>
          </div>



          <div className="sidebar-scroll-area">
            {/* Details Section */}
            <div className="sidebar-section-container">
              <div className="professional-section-header">
                <Info size={18} className="text-brand-gold" />
                <span>{t('details')}</span>
              </div>
              <div className="sidebar-info-section">
                <h3 className="sidebar-doc-title">{doc.title}</h3>
                <div className="sidebar-status-tag-wrapper">
                  <div className={`status-pill ${getDocStatusClass(doc.status)}`}>
                    <div className="status-dot"></div>
                    <span>{getDocStatusText(doc.status)}</span>
                  </div>
                </div>

                <div className="sidebar-metadata-grid">
                  <div className="meta-item">
                    <div className="meta-icon-label">
                      <Calendar size={14} />
                      <span className="meta-label">{t('created') || 'Created'}</span>
                    </div>
                    <span className="meta-value">{doc.created_at ? new Date(doc.created_at).toLocaleDateString() : '-'}</span>
                  </div>
                  <div className="meta-item">
                    <div className="meta-icon-label">
                      <Clock size={14} />
                      <span className="meta-label">{t('updated') || 'Updated'}</span>
                    </div>
                    <span className="meta-value">{doc.updated_at ? new Date(doc.updated_at).toLocaleDateString() : '-'}</span>
                  </div>
                  <div className="meta-item">
                    <div className="meta-icon-label">
                      <Folder size={14} />
                      <span className="meta-label">{t('folder') || 'Folder'}</span>
                    </div>
                    <span
                      className="meta-value folder-link"
                      style={{ color: 'var(--brand-gold)', cursor: 'pointer' }}
                      onClick={() => doc.workspace_id && navigate(`/workspace/${doc.workspace_id}`)}
                    >
                      {workspaceName || '-'}
                    </span>
                  </div>
                  <div className="meta-item">
                    <div className="meta-icon-label">
                      <AlertCircle size={14} />
                      <span className="meta-label">{t('expires') || 'Expires'}</span>
                    </div>
                    <span className="meta-value">{doc.expiry_date ? new Date(doc.expiry_date).toLocaleDateString() : '-'}</span>
                  </div>
                </div>

                <div className="sidebar-workflow-section">
                  <h4>{t('workflows') || 'Workflows'}</h4>
                  {workflows.length === 0 ? (
                    <p className="workflow-empty">{t('noActiveWorkflows') || 'No active workflows'}</p>
                  ) : (
                    <div className="workflow-list-stack">
                      {workflows.map(wf => {
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
                                  const t = String(s.title || s.name || '').toLowerCase();
                                  if (t === 'start') return 0;
                                  if (t === 'end') return 2;
                                  return 1;
                                };
                                return order(a) - order(b);
                              }).map((step: any, idx: number, arr: any[]) => {
                                const sRaw = String(step.status || '').toLowerCase();
                                const sCompleted = sRaw === 'completed' || sRaw === '3';
                                const sActive    = sRaw === 'inprogress' || sRaw === 'active' || sRaw === '2';
                                const sFailed    = sRaw === 'failed' || sRaw === 'rejected' || sRaw === '4';
                                // If workflow terminated and step never ran → skipped
                                const sSkipped   = (isTerminated) && !sCompleted && !sActive && !sFailed;
                                const isLast     = idx === arr.length - 1;

                                const iconColor  = sCompleted ? '#10B981' : sActive ? '#3B82F6' : sFailed ? '#EF4444' : '#D1D5DB';
                                const lineColor  = sCompleted ? '#10B981' : '#E5E7EB';

                                return (
                                  <div key={idx} style={{ display: 'flex', gap: '10px', opacity: sSkipped ? 0.5 : 1 }}>
                                    {/* Icon + Line column */}
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '20px', flexShrink: 0 }}>
                                      {/* Icon */}
                                      <div style={{
                                        width: '20px', height: '20px', borderRadius: '50%',
                                        background: sCompleted ? '#D1FAE5' : sActive ? '#DBEAFE' : sFailed ? '#FEE2E2' : '#F3F4F6',
                                        border: `2px solid ${iconColor}`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        flexShrink: 0
                                      }}>
                                        {sCompleted
                                          ? <CheckCircle size={12} color="#10B981" />
                                          : sFailed
                                            ? <X size={12} color="#EF4444" />
                                            : sActive
                                              ? <Activity size={12} color="#3B82F6" />
                                              : <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#D1D5DB' }} />
                                        }
                                      </div>
                                      {/* Connector line */}
                                      {!isLast && (
                                        <div style={{ width: '2px', flex: 1, minHeight: '12px', background: lineColor, marginTop: '2px' }} />
                                      )}
                                    </div>
                                    {/* Content */}
                                    <div style={{ paddingBottom: isLast ? '0' : '12px', flex: 1 }}>
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
            </div>

            {/* Actions Section */}
            <div className="sidebar-section-container">
              <div className="professional-section-header">
                <Shield size={18} className="text-brand-gold" />
                <span>{t('actions')}</span>
              </div>
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
                        disabled={uploadingVersion || isPendingDoc}
                      >
                        <Plus size={16} />
                      </button>
                    )}
                  </div>
                  <div className="compact-list">
                    {versions.length === 0 ? (
                      <p className="empty-text-small">{t('noVersions')}</p>
                    ) : (
                      versions.sort((a, b) => (b.version || 0) - (a.version || 0)).map((v, i) => (
                        <div key={v.id} className="compact-item">
                          <div className="item-main">
                            <div className="item-title-row">
                              <span className="item-title">v{v.version}</span>
                              {v.version === doc.current_version && <span className="current-badge">{t('current')}</span>}
                            </div>
                            <span className="item-meta"> {v.createdByName || '-'}</span>
                            <span className="item-meta"> {v.created_at ? new Date(v.created_at).toLocaleDateString() : '-'} </span>
                          </div>
                          <div className="item-actions">
                            <Tooltip content={t('download')}>
                              <button 
                                className="icon-btn-small" 
                                onClick={() => {
                                  if (isPendingDoc) return;
                                  handleDownloadVersion(v);
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
                                  handleDeleteVersion(v.id);
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
                    onChange={handleUploadNewVersion}
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
                    {acls.length === 0 ? (
                      <p className="empty-text-small">{t('noOneHasAccess')}</p>
                    ) : (
                      acls.map((acl) => {
                        const isOwner = doc.owner_user_id === acl.userId;
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
                                        documentId: doc.id,
                                        userId: acl.userId || '',
                                        permission: e.target.value
                                      });
                                      success(t('permissionUpdated'));
                                      loadAllData();
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
                                    handleRemovePermission(acl.id!);
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
                    {permissions.length === 0 ? (
                      <p className="empty-text-small">{t('noOneHasAccess')}</p>
                    ) : (
                      permissions.map((p) => (
                        <div key={p.id} className="compact-item">
                          <div className="user-avatar-small">
                            {p.email.charAt(0).toUpperCase()}
                          </div>
                          <div className="item-main">
                            <span className="item-title">{p.email}</span>
                            <span className="role-chip">{t(p.role || 'viewer')}</span>
                          </div>
                          <Tooltip content={t('removeAccess')}>
                            <button
                              className="icon-btn-small text-danger"
                              onClick={async () => {
                                if (isPendingDoc) return;
                                confirm({
                                  title: t('removeAccess'),
                                  message: t('confirmRemoveAccess'),
                                  type: 'danger',
                                  onConfirm: async () => {
                                    try {
                                      await deleteInvitation(p.id);
                                      success(t('accessRemoved'));
                                      loadAllData();
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
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Quick Actions Card removed to match ExplorerLayout */}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => {
          setIsShareModalOpen(false);
          loadAllData();
        }}
        documentName={doc.title}
        documentId={doc.id}
        onSuccess={loadAllData}
      />

      <AddPermissionModal
        isOpen={isAddPermissionModalOpen}
        onClose={() => setIsAddPermissionModalOpen(false)}
        documentId={doc.id}
        onPermissionAdded={loadAllData}
      />

      <UpdateDocumentModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        document={doc}
        onUpdate={handleUpdate}
      />
    </div>
  );
};

export default DocumentDetails;
