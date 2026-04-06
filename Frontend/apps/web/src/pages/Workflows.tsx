import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, GitBranch, Layers, Clock, Users, FileText, Folder, Activity, CheckCircle, Power, Zap, Grid3x3, List as ListIcon, Table2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getWorkflows, toggleWorkflowActiveStatus, Workflow } from '../api/workflows';
import { useLanguage } from '../contexts/LanguageContext';
import { useConfirm } from '../contexts/ConfirmContext';
import { useToast } from '../contexts/ToastContext';
import './Workflows.css';
import DocumentsLayout from '../components/DocumentsLayout';
import Breadcrumb from '../components/Breadcrumb';
import LoadingState from '../components/LoadingState';
import Tooltip from '../components/Tooltip';

import WorkflowDetailsModal from '../components/WorkflowDetailsModal';

const Workflows: React.FC = () => {
  const { t, language } = useLanguage();
  const { confirm, close } = useConfirm();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [detailsPopup, setDetailsPopup] = useState<{ workflowId: string, workflowName: string, type: 'running' | 'completed' | 'docs' | 'folders' } | null>(null);

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      const data = await getWorkflows();
      setWorkflows(data);
    } catch (err) {
      console.error('Error loading workflows:', err);
      error(t('failedToLoadWorkflows') || 'Error loading workflows');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    navigate('/workflows/new');
  };

  const handleEdit = (workflow: Workflow) => {
    if (workflow.isActive || (workflow.id && togglingId === workflow.id)) return; // 🔒 Cannot edit active or toggling workflow
    if (workflow.id) {
      navigate(`/workflows/${workflow.id}/edit`);
    }
  };

  const executeToggle = async (id: string, isActive: boolean, activateAssignments: boolean = false) => {
    try {
      setTogglingId(id);
      const result = await toggleWorkflowActiveStatus(id, isActive, activateAssignments);

      // Handle backend ResponseResult.isSucceeded
      if (result && result.isSucceeded === false) {
        throw new Error(result.message || 'Failed to update workflow status');
      }

      success(isActive ? 'workflowActivated' : 'workflowDeactivated');
      await loadWorkflows();
    } catch (err: any) {
      console.error('Error toggling workflow:', err);
      const msg = err.response?.data?.message || err.message || t('failedToToggleWorkflow') || 'Failed to update workflow status';
      error(msg);
    } finally {
      setTogglingId(null);
    }
  };

  const handleToggleActive = async (workflow: Workflow, e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = !workflow.isActive;

    if (!newStatus && (workflow.activeInstancesCount || 0) > 0) {
      confirm({
        title: t('deactivateWorkflow') || 'Deactivate Workflow',
        message: (
          <div>
            <p style={{ margin: '0 0 10px 0' }}>{t('confirmDeactivateWfWithInstances')}</p>
            <span
              onClick={() => {
                close();
                window.open(`/workflow-instances?workflowId=${workflow.id}`, '_blank');
              }}
              style={{
                cursor: 'pointer',
                color: '#3b82f6',
                textDecoration: 'underline',
                fontWeight: 500,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              {t('viewActiveInstances') || 'View Active Instances'}
            </span>
          </div>
        ) as any,
        confirmText: t('deactivate') || 'Deactivate',
        cancelText: t('cancel'),
        type: 'warning',
        onConfirm: async () => {
          await executeToggle(workflow.id!, newStatus, false);
        }
      });
    } else if (newStatus) {
      let shouldActivateAssignments = false;
      confirm({
        title: t('activateWorkflow') || 'Activate Workflow',
        message: (
          <div>
            <p style={{ margin: '0 0 16px 0', fontSize: '15px' }}>{t('confirmActivateWf') || 'Are you sure you want to activate this workflow?'}</p>
            {((workflow.assignedFoldersCount ?? 0) + (workflow.assignedDocumentsCount ?? 0)) > 0 && (
              <>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', color: '#334155', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <input
                    type="checkbox"
                    onChange={(e) => { shouldActivateAssignments = e.target.checked; }}
                    style={{ cursor: 'pointer', width: '18px', height: '18px', accentColor: 'var(--brand-gold)' }}
                  />
                  <span style={{ fontWeight: 500 }}>{t('activateAssignmentsWithWorkflow') || 'Activate associated assignments as well'}</span>
                </label>
                <div style={{ marginTop: '16px' }}>
                  <span
                    onClick={() => {
                      window.open(`/workflow-assignments/${workflow.id}?name=${encodeURIComponent(workflow.name)}`, '_blank');
                    }}
                    style={{
                      cursor: 'pointer',
                      color: '#3b82f6',
                      textDecoration: 'underline',
                      fontWeight: 500,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '13.5px'
                    }}
                  >
                    {t('viewAssignments') || 'View / Assign Workflow'}
                  </span>
                </div>
              </>
            )}
          </div>
        ) as any,
        confirmText: t('activate') || 'Activate',
        cancelText: t('cancel') || 'Cancel',
        type: 'success',
        onConfirm: async () => {
          await executeToggle(workflow.id!, newStatus, shouldActivateAssignments);
        }
      });
    } else {
      await executeToggle(workflow.id!, newStatus, false);
    }
  };

  const handleStatClick = (e: React.MouseEvent, workflow: Workflow, type: 'running' | 'completed' | 'docs' | 'folders') => {
    e.stopPropagation();
    setDetailsPopup({
      workflowId: workflow.id!,
      workflowName: workflow.name,
      type
    });
  };

  const filteredWorkflows = workflows.filter(workflow =>
    workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workflow.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const breadcrumbs = [
    { label: t('home'), onClick: () => navigate('/') },
    { label: t('workflowsTitle') }
  ];

  const headerActions = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div className="header-search-group" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div className="search-bar" style={{ margin: 0, padding: '0 14px', height: '38px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.02)' }}>
          <Search size={16} color="#94a3b8" />
          <input
            type="text"
            placeholder={t('searchWorkflowsPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '13.5px', width: '200px', color: '#334155', padding: 0 }}
          />
        </div>
      </div>
      <button className="btn-primary" onClick={handleCreateNew} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '0 18px', height: '38px', borderRadius: '8px', background: 'var(--brand-gold)', color: 'white', border: 'none', fontWeight: '600', fontSize: '13.5px', cursor: 'pointer', boxShadow: '0 2px 4px -1px rgba(195, 146, 77, 0.2)' }}>
        <Plus size={16} /> {t('newWorkflow')}
      </button>
    </div>
  );

  const customContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {loading ? (
        <div style={{ padding: '60px 0' }}><LoadingState /></div>
      ) : viewMode === 'table' ? (
        <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', fontSize: '13.5px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('name') || 'Name'}</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', color: '#64748b', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('status') || 'Status'}</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('triggers') || 'Triggers'}</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', color: '#64748b', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('steps') || 'Steps'}</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', color: '#64748b', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('Running') || 'Running'}</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', color: '#64748b', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('Completed') || 'Completed'}</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('updatedAt') || 'Updated'}</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}></th>
              </tr>
            </thead>
            <tbody>
              {filteredWorkflows.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>{t('noWorkflows')}</td></tr>
              ) : filteredWorkflows.map((workflow, idx) => (
                <tr key={workflow.id} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? 'white' : '#fafbfc', cursor: 'pointer', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f0f9ff')}
                  onMouseLeave={e => (e.currentTarget.style.background = idx % 2 === 0 ? 'white' : '#fafbfc')}
                  onClick={() => handleEdit(workflow)}
                >
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: '#1e293b', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{workflow.name}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <span className={`workflow-status-badge status-${workflow.isActive ? 'active' : (workflow.status || 'Draft').toLowerCase()}`}>
                      {workflow.isActive ? t('activeStatus') : t(((workflow.status || 'Draft').toLowerCase()) + 'Status')}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {(workflow.triggers || []).slice(0, 3).map((tr, i) => {
                        const code = tr.triggerCode || String(tr.type);
                        return <span key={i} style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: 600, background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }}>{code}</span>;
                      })}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center', color: '#475569' }}>{workflow.steps?.length || 0}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <span style={{ color: '#3b82f6', fontWeight: 600 }}>{workflow.activeInstancesCount || 0}</span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <span style={{ color: '#10b981', fontWeight: 600 }}>{workflow.completedInstancesCount || 0}</span>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#94a3b8', fontSize: '12.5px', whiteSpace: 'nowrap' }}>
                    {(() => { const d = workflow.updatedAt || workflow.createdAt; return d ? new Date(d).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US') : '—'; })()}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                      {workflow.status !== 'Archived' && (
                        <>
                          <Tooltip content={workflow.isActive ? (t('deactivate') || 'Deactivate') : (t('activate') || 'Activate')}>
                            <button onClick={(e) => handleToggleActive(workflow, e)} className={`workflow-action-btn ${workflow.isActive ? 'active-toggle' : 'inactive-toggle'}`} style={{ color: workflow.isActive ? '#10b981' : '#94a3b8' }} disabled={togglingId === workflow.id}><Power size={15} /></button>
                          </Tooltip>
                          <Tooltip content={workflow.isActive ? (t('deactivateToEdit') || 'Deactivate to edit') : (t('edit') || 'Edit')}>
                            <button onClick={(e) => { e.stopPropagation(); handleEdit(workflow); }} className="workflow-action-btn" disabled={workflow.isActive || togglingId === workflow.id} style={{ opacity: workflow.isActive ? 0.35 : 1 }}><Edit2 size={15} /></button>
                          </Tooltip>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="workflows-grid">
          {filteredWorkflows.length === 0 && (
            <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
              <p>{t('noWorkflows')}</p>
            </div>
          )}
          {filteredWorkflows.map(workflow => (
            <div
              key={workflow.id}
              className={`workflow-card ${togglingId === workflow.id ? 'toggling' : ''}`}
              onClick={() => handleEdit(workflow)}
              style={{
                cursor: (workflow.isActive || togglingId === workflow.id) ? 'default' : 'pointer',
                opacity: togglingId === workflow.id ? 0.7 : 1
              }}
            >
              <div className="workflow-card-header">
                <span className={`workflow-status-badge status-${workflow.isActive ? 'active' : (workflow.status || 'Draft').toLowerCase()}`}>
                  {workflow.isActive ? t('activeStatus') : t(((workflow.status || 'Draft').toLowerCase()) + 'Status')}
                </span>
                <div className="workflow-card-actions">
                  {workflow.status !== 'Archived' && (
                    <>
                      <Tooltip content={workflow.isActive ? (t('deactivate') || 'Deactivate') : (t('activate') || 'Activate')}>
                        <button
                          onClick={(e) => handleToggleActive(workflow, e)}
                          className={`workflow-action-btn ${workflow.isActive ? 'active-toggle' : 'inactive-toggle'} ${togglingId === workflow.id ? 'spinning' : ''}`}
                          style={{ color: workflow.isActive ? '#10b981' : '#94a3b8' }}
                          disabled={togglingId === workflow.id}
                        >
                          <Power size={16} />
                        </button>
                      </Tooltip>
                      <Tooltip content={workflow.isActive || togglingId === workflow.id ? (t('deactivateToEdit') || 'Deactivate to edit') : (t('edit') || 'Edit')}>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEdit(workflow); }}
                          className="workflow-action-btn"
                          disabled={workflow.isActive || togglingId === workflow.id}
                          style={{
                            opacity: (workflow.isActive || togglingId === workflow.id) ? 0.35 : 1,
                            cursor: (workflow.isActive || togglingId === workflow.id) ? 'not-allowed' : 'pointer'
                          }}
                        >
                          <Edit2 size={16} />
                        </button>
                      </Tooltip>
                    </>
                  )}
                </div>
              </div>

              <div className="workflow-card-body">
                <h3>{workflow.name}</h3>
                <p>{workflow.description}</p>

                {/* Triggers */}
                {workflow.triggers && workflow.triggers.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px', marginBottom: '4px' }}>
                    {workflow.triggers.map((tr, idx) => {
                      const code = tr.triggerCode || String(tr.type);
                      const triggerColorMap: Record<string, string> = {
                        upload:   '#3b82f6',
                        delete:   '#ef4444',
                        update:   '#f59e0b',
                        share:    '#8b5cf6',
                        download: '#06b6d4',
                        view:     '#10b981',
                      };
                      const color = triggerColorMap[code.toLowerCase()] || '#64748b';
                      return (
                        <span
                          key={idx}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '3px 10px',
                            borderRadius: '999px',
                            fontSize: '11.5px',
                            fontWeight: 600,
                            background: `${color}18`,
                            color,
                            border: `1px solid ${color}40`,
                            letterSpacing: '0.02em'
                          }}
                        >
                          <Zap size={11} />
                          {code}
                        </span>
                      );
                    })}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '12px', fontSize: '13px', color: '#666' }}>
                  <Tooltip content={`${t('activeInstances')}: ${workflow.activeInstancesCount || 0}`}>
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                      className="stat-item"
                      onClick={(e) => handleStatClick(e, workflow, 'running')}
                    >
                      <Activity size={14} color="#3b82f6" />
                      <span>{workflow.activeInstancesCount || 0} {t('Running')}</span>
                    </div>
                  </Tooltip>
                  <Tooltip content={`${t('completedInstances')}: ${workflow.completedInstancesCount || 0}`}>
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                      className="stat-item"
                      onClick={(e) => handleStatClick(e, workflow, 'completed')}
                    >
                      <CheckCircle size={14} color="#10b981" />
                      <span>{workflow.completedInstancesCount || 0} {t('Completed')}</span>
                    </div>
                  </Tooltip>
                  <Tooltip content={`${t('assignedDocuments')}: ${workflow.assignedDocumentsCount || 0}`}>
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                      className="stat-item"
                      onClick={(e) => handleStatClick(e, workflow, 'docs')}
                    >
                      <FileText size={14} color="#f59e0b" />
                      <span>{workflow.assignedDocumentsCount || 0} {t('Docs')}</span>
                    </div>
                  </Tooltip>
                  <Tooltip content={`${t('assignedWorkspaces')}: ${workflow.assignedFoldersCount || 0}`}>
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                      className="stat-item"
                      onClick={(e) => handleStatClick(e, workflow, 'folders')}
                    >
                      <Folder size={14} color="#8b5cf6" />
                      <span>{workflow.assignedFoldersCount || 0} {t('Workspaces')}</span>
                    </div>
                  </Tooltip>
                </div>

                {((workflow.reviewers && workflow.reviewers.length > 0) || (workflow.approvers && workflow.approvers.length > 0) || (workflow.assignees && workflow.assignees.length > 0)) && (
                  <div style={{ marginTop: '12px', borderTop: '1px solid #eee', paddingTop: '8px', fontSize: '12.5px' }}>
                    {workflow.reviewers && workflow.reviewers.length > 0 && (
                      <div style={{ marginBottom: '4px', display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
                        <strong style={{ color: '#64748b', whiteSpace: 'nowrap' }}>{t('Reviewers')}:</strong>
                        <span style={{ color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {workflow.reviewers.slice(0, 2).join(', ')}{workflow.reviewers.length > 2 ? '...' : ''}
                        </span>
                      </div>
                    )}
                    {workflow.approvers && workflow.approvers.length > 0 && (
                      <div style={{ marginBottom: '4px', display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
                        <strong style={{ color: '#64748b', whiteSpace: 'nowrap' }}>{t('Approvers')}:</strong>
                        <span style={{ color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {workflow.approvers.slice(0, 2).join(', ')}{workflow.approvers.length > 2 ? '...' : ''}
                        </span>
                      </div>
                    )}
                    {workflow.assignees && workflow.assignees.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
                        <strong style={{ color: '#64748b', whiteSpace: 'nowrap' }}>{t('assignees') || (t('Assignees') || 'Assignees')}:</strong>
                        <span style={{ color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {workflow.assignees.slice(0, 2).join(', ')}{workflow.assignees.length > 2 ? '...' : ''}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="workflow-card-footer">
                <div className="workflow-meta-info">
                  <div className="meta-item">
                    <Layers size={14} />
                    {workflow.steps?.length || 0} {t('steps')}
                  </div>
                  <div className="meta-item">
                    <Clock size={14} />
                    {(() => {
                      const dateValue = workflow.updatedAt || workflow.createdAt;
                      if (!dateValue) return '--/--/----';
                      return new Date(dateValue).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US');
                    })()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {detailsPopup && (
        <WorkflowDetailsModal
          isOpen={true}
          onClose={() => setDetailsPopup(null)}
          workflowId={detailsPopup.workflowId}
          workflowName={detailsPopup.workflowName}
          type={detailsPopup.type}
        />
      )}

    </div>
  );

  return (
    <>
      <DocumentsLayout
        title={t('workflowsTitle')}
        headerIcon={GitBranch}
        headerIconColor="var(--brand-gold)"
        breadcrumb={<Breadcrumb items={breadcrumbs} />}
        actions={headerActions}
        showFilterBar={true}
        documents={[]}
        customContent={customContent}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        hideDocuments={true}
      />
      <style>{`
        .stat-item:hover {
            background-color: rgba(0,0,0,0.05);
            border-radius: 4px;
        }
      `}</style>
    </>
  );
};

export default Workflows;
