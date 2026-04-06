import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GitBranch, Clock, CheckCircle, XCircle, Play, Pause, FileText, ChevronRight, Calendar, AlertCircle } from 'lucide-react';
import DocumentsLayout from '../components/DocumentsLayout';
import Breadcrumb from '../components/Breadcrumb';
import { getWorkflowInstances, WorkflowInstance } from '../api/workflowInstances';
import { useLanguage } from '../contexts/LanguageContext';
import '../styles/CommonList.css';

// --- Utility Functions (Embedded to fix import issues) ---

const normalizeWorkflowStatus = (status: any): string => {
  const num = Number(status);
  if (!isNaN(num) && status !== '' && status !== null && status !== undefined) {
    switch (num) {
      case 0: return 'draft';
      case 1: return 'active';
      case 2: return 'suspended';
      case 3: return 'completed';
      case 4: return 'terminated';
      default: break;
    }
  }
  const s = String(status || '').toLowerCase().trim();
  if (s === 'inprogress' || s === 'running') return 'active';
  if (s === 'active') return 'active';
  if (s === 'completed') return 'completed';
  if (s === 'failed' || s === 'terminated') return 'terminated';
  if (s === 'suspended' || s === 'paused') return 'suspended';
  if (s === 'draft') return 'draft';
  return s;
};

const normalizeStepStatus = (status: any): string => {
  const num = Number(status);
  if (!isNaN(num) && status !== '' && status !== null && status !== undefined) {
    switch (num) {
      case 0: return 'pending';
      case 1: return 'ready';
      case 2: return 'active';
      case 3: return 'completed';
      case 4: return 'failed';
      case 5: return 'skipped';
      default: break;
    }
  }
  const s = String(status || '').toLowerCase().trim();
  if (s === 'inprogress') return 'active';
  if (s === 'rejected') return 'failed';
  return s;
};

const sortWorkflowSteps = (steps: any[]): any[] => {
  if (!Array.isArray(steps)) return [];

  const getStepOrder = (step: any): number => {
    const title = String(step.title || step.name || '').toLowerCase().trim();
    const type = String(step.type || step.nodeType || '').toLowerCase().trim();
    if (title === 'start' || type === 'start') return 0;
    if (title === 'end' || type === 'end') return 2;
    return 1;
  };

  return [...steps].sort((a, b) => {
    const orderA = getStepOrder(a);
    const orderB = getStepOrder(b);
    if (orderA !== orderB) return orderA - orderB;
    const dateA = a.startedAt ? new Date(a.startedAt).getTime() : Number.MAX_VALUE;
    const dateB = b.startedAt ? new Date(b.startedAt).getTime() : Number.MAX_VALUE;
    return dateA - dateB;
  });
};

// --- Component ---

const WorkflowInstances: React.FC = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [instances, setInstances] = useState<WorkflowInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'running' | 'completed' | 'failed'>('running');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedInstance, setSelectedInstance] = useState<WorkflowInstance | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    loadInstances();
  }, []);

  const loadInstances = async () => {
    try {
      setLoading(true);
      const data = await getWorkflowInstances();
      if (Array.isArray(data)) {
        setInstances(data);

        // Auto open from URL
        const searchParams = new URLSearchParams(window.location.search);
        const autoOpenId = searchParams.get('id');
        if (autoOpenId) {
          const instance = data.find((i: any) => i.id === autoOpenId);
          if (instance) {
            setSelectedInstance(instance);
            setShowModal(true);
          }
        }
      } else {
        console.error('Invalid data format received for workflow instances:', data);
        setInstances([]);
      }
    } catch (error) {
      console.error('Error loading workflow instances:', error);
      setInstances([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredInstances = instances.filter(instance => {
    const searchParams = new URLSearchParams(location.search);
    const filterWorkflowId = searchParams.get('workflowId');
    if (filterWorkflowId && instance.workflowId !== filterWorkflowId) {
      return false;
    }

    if (filter === 'all') return true;
    const status = normalizeWorkflowStatus(instance.status);

    if (filter === 'running') {
      return status === 'active';
    }
    if (filter === 'failed') {
      return status === 'failed' || status === 'terminated';
    }
    return status === filter;
  });

  const getStatusIcon = (status?: any) => {
    const s = normalizeWorkflowStatus(status);
    switch (s) {
      case 'active': return <Play size={14} fill="currentColor" />;
      case 'completed': return <CheckCircle size={14} />;
      case 'failed':
      case 'terminated': return <XCircle size={14} />;
      case 'suspended': return <Pause size={14} fill="currentColor" />;
      case 'draft': return <GitBranch size={14} />;
      default: return <Clock size={14} />;
    }
  };

  const getStatusStyle = (status?: any) => {
    const s = normalizeWorkflowStatus(status);
    const base = {
      padding: '4px 8px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      border: '1px solid transparent'
    };

    switch (s) {
      case 'active':
        return { ...base, backgroundColor: '#FEF3C7', color: '#B45309', borderColor: '#FDE68A' }; // Amber
      case 'completed':
        return { ...base, backgroundColor: '#D1FAE5', color: '#047857', borderColor: '#A7F3D0' }; // Emerald
      case 'failed':
      case 'terminated':
        return { ...base, backgroundColor: '#FEE2E2', color: '#B91C1C', borderColor: '#FECACA' }; // Red
      case 'suspended':
        return { ...base, backgroundColor: '#FFEDD5', color: '#C2410C', borderColor: '#FED7AA' }; // Orange
      default:
        return { ...base, backgroundColor: '#F3F4F6', color: '#374151', borderColor: '#E5E7EB' }; // Gray
    }
  };

  // Helper to safely format date or fallback to step dates
  const getDisplayDate = (dateVal: Date | string | undefined, steps: any[] | undefined, type: 'start' | 'end', instanceStatus?: any) => {
    // If we have an explicit date on the instance, use it
    if (dateVal) {
      const d = new Date(dateVal);
      if (!isNaN(d.getTime())) return d.toLocaleString();
    }

    // Fallback logic using steps
    if (steps && steps.length > 0) {
      const sorted = sortWorkflowSteps(steps);

      if (type === 'start') {
        // Start date: earliest started step
        const first = sorted.find(s => s.startedAt);
        if (first?.startedAt) return new Date(first.startedAt).toLocaleString();
      } else if (type === 'end') {
        // End date: ONLY if the instance status is completed/failed/terminated
        const normalizedStatus = normalizeWorkflowStatus(instanceStatus);
        const isFinished = ['completed', 'failed', 'terminated'].includes(normalizedStatus);

        if (isFinished) {
          // Look for the last completed step
          const completed = sorted.filter(s => s.completedAt || s.status === 3 || String(s.status).toLowerCase() === 'completed');
          if (completed.length > 0) {
            const last = completed[completed.length - 1];
            if (last.completedAt) return new Date(last.completedAt).toLocaleString();
          }
        }
      }
    }

    return '-';
  };

  const handleViewDetails = (instance: WorkflowInstance) => {
    setSelectedInstance(instance);
    setShowModal(true);
  };

  const breadcrumbs = [
    { label: t('dashboard') || 'Dashboard', onClick: () => navigate('/dashboard') },
    { label: t('workflowInstancesTitle') || 'Workflow Instances' }
  ];

  const filters = [
    t('all') || 'All',
    t('runningStatus') || 'Running',
    t('completedStatus') || 'Completed',
    t('failedStatus') || 'Failed'
  ];

  const handleFilterChange = (selectedFilter: string) => {
    if (selectedFilter === (t('runningStatus') || 'Running')) setFilter('running');
    else if (selectedFilter === (t('completedStatus') || 'Completed')) setFilter('completed');
    else if (selectedFilter === (t('failedStatus') || 'Failed')) setFilter('failed');
    else setFilter('all');
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Pagination Logic
  const totalPages = Math.ceil(filteredInstances.length / itemsPerPage);
  const paginatedInstances = filteredInstances.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);


  return (
    <>
      <DocumentsLayout
        documents={[]}
        title={t('workflowInstancesTitle') || 'Workflow Instances'}
        headerIcon={GitBranch}
        headerIconColor="#6B7280"
        breadcrumb={<Breadcrumb items={breadcrumbs} />}
        filters={filters}
        defaultFilter={t('runningStatus') || 'Running'}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onFilterChange={handleFilterChange}
        sectionTitle={t('workflowInstances') || 'Workflow Instances'}
        showFilterBar={true}
        customContent={
          <>
            {loading && (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <div className="loading-spinner" style={{ marginBottom: '10px' }}></div>
                {t('loading')}
              </div>
            )}

            {!loading && filteredInstances.length === 0 && (
              <div className="empty-state" style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: '60px 20px', background: 'var(--bg-card)', borderRadius: '12px', border: '1px dashed var(--border-color)'
              }}>
                <GitBranch size={48} color="var(--text-secondary)" style={{ opacity: 0.5, marginBottom: '16px' }} />
                <p style={{ fontSize: '16px', fontWeight: '500', color: 'var(--text-secondary)' }}>
                  {t('noWorkflowInstances') || 'No workflow instances found'}
                </p>
              </div>
            )}

            {!loading && filteredInstances.length > 0 && (
              <>
                {viewMode === 'grid' ? (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '20px',
                    marginTop: '20px'
                  }}>
                    {paginatedInstances.map(instance => {
                      const statusStr = normalizeWorkflowStatus(instance.status);
                      const progress = instance.progress !== undefined ? instance.progress :
                        (statusStr === 'completed' ? 100 : (statusStr === 'draft' ? 0 : 50));

                      const startDateDisplay = getDisplayDate(instance.startedAt, instance.steps, 'start', instance.status);

                      return (
                        <div
                          key={instance.id}
                          className="workflow-card"
                          onClick={() => handleViewDetails(instance)}
                          style={{
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '12px',
                            padding: '20px',
                            cursor: 'pointer',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            position: 'relative',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 8px 15px -3px rgba(0, 0, 0, 0.08)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          {/* Top side */}
                          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                              <span style={getStatusStyle(instance.status)}>
                                {getStatusIcon(instance.status)}
                                <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '10px' }}>
                                  {t(statusStr + 'Status') || instance.status}
                                </span>
                              </span>

                              {startDateDisplay !== '-' && (
                                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <Calendar size={12} />
                                  {startDateDisplay.split(',')[0]}
                                </span>
                              )}
                            </div>

                            <h3 style={{
                              fontSize: '18px',
                              fontWeight: '600',
                              marginBottom: '8px',
                              color: 'var(--text-primary)',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}>
                              {instance.workflowName || t('workflow')}
                            </h3>

                            {instance.documentId && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '20px' }}>
                                <FileText size={14} className="text-secondary" />
                                <span style={{
                                  fontSize: '13px',
                                  color: 'var(--text-secondary)',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  maxWidth: '200px',
                                  background: 'var(--bg-base)',
                                  padding: '2px 6px',
                                  borderRadius: '4px'
                                }}>
                                  {instance.documentTitle || t('document') || 'Document'}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Bottom side */}
                          <div style={{ marginTop: 'auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                              <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary)' }}>
                                {t('progress')}
                              </span>
                              <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--brand-gold)' }}>
                                {Math.round(progress)}%
                              </span>
                            </div>
                            <div style={{ width: '100%', height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{
                                width: `${progress}%`,
                                height: '100%',
                                background: statusStr === 'completed' ? '#10B981' : (statusStr === 'failed' || statusStr === 'terminated' ? '#EF4444' : '#c3924d'),
                                borderRadius: '3px',
                                transition: 'width 0.5s ease-out'
                              }} />
                            </div>

                            <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
                              <button className="btn-text" style={{
                                fontSize: '13px', fontWeight: '600', color: 'var(--brand-gold)', padding: '4px 0', display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer'
                              }}>
                                {t('viewDetails') || t('details') || 'View Details'}
                                <ChevronRight size={16} className={language === 'ar' ? 'rotate-180' : ''} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto', marginTop: '20px', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                          <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('workflowName') || 'Workflow'}</th>
                          <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('document') || 'Document'}</th>
                          <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('startedAt') || 'Started At'}</th>
                          <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('progress') || 'Progress'}</th>
                          <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('status') || 'Status'}</th>
                          <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>{t('actions') || 'Actions'}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedInstances.map(instance => {
                          const statusStr = normalizeWorkflowStatus(instance.status);
                          const progress = instance.progress !== undefined ? instance.progress :
                            (statusStr === 'completed' ? 100 : (statusStr === 'draft' ? 0 : 50));
                          const startDateDisplay = getDisplayDate(instance.startedAt, instance.steps, 'start', instance.status);

                          return (
                            <tr key={instance.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s', cursor: 'pointer' }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                              onClick={() => handleViewDetails(instance)}>
                              <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <GitBranch size={16} color="#94a3b8" />
                                  {instance.workflowName || t('workflow')}
                                </div>
                              </td>
                              <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569' }}>
                                {instance.documentTitle ? (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <FileText size={14} color="#94a3b8" />
                                    <span style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                      {instance.documentTitle}
                                    </span>
                                  </div>
                                ) : '-'}
                              </td>
                              <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569' }}>
                                {startDateDisplay !== '-' ? startDateDisplay.split(',')[0] : '-'}
                              </td>
                              <td style={{ padding: '16px 24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '100px' }}>
                                  <div style={{ flex: 1, height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                                    <div style={{
                                      width: `${progress}%`,
                                      height: '100%',
                                      background: statusStr === 'completed' ? '#10B981' : (statusStr === 'failed' || statusStr === 'terminated' ? '#EF4444' : '#c3924d'),
                                      borderRadius: '3px'
                                    }} />
                                  </div>
                                  <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>{Math.round(progress)}%</span>
                                </div>
                              </td>
                              <td style={{ padding: '16px 24px' }}>
                                <span style={{
                                  ...getStatusStyle(instance.status),
                                  padding: '4px 10px',
                                  borderRadius: '12px',
                                  fontSize: '11px',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.05em'
                                }}>
                                  {t(statusStr + 'Status') || instance.status}
                                </span>
                              </td>
                              <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                <button className="btn-text" style={{
                                  fontSize: '13px', fontWeight: '600', color: 'var(--brand-gold)', background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px'
                                }}>
                                  {t('viewDetails') || 'Details'}
                                  <ChevronRight size={14} className={language === 'ar' ? 'rotate-180' : ''} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '30px', padding: '20px 0' }}>
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      style={{ padding: '8px 16px', borderRadius: '6px', background: currentPage === 1 ? '#e2e8f0' : '#c3924d', color: currentPage === 1 ? '#94a3b8' : 'white', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', border: 'none', fontWeight: '500' }}
                    >
                      {t('previous') || 'Previous'}
                    </button>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#475569' }}>
                      {t('page') || 'Page'} {currentPage} {t('of') || 'of'} {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      style={{ padding: '8px 16px', borderRadius: '6px', background: currentPage === totalPages ? '#e2e8f0' : '#c3924d', color: currentPage === totalPages ? '#94a3b8' : 'white', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', border: 'none', fontWeight: '500' }}
                    >
                      {t('next') || 'Next'}
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        }
      />

      {/* Details Modal */}
      {showModal && selectedInstance && (
        <div className="modal-overlay" onClick={() => setShowModal(false)} style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1000,
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          backdropFilter: 'blur(4px)'
        }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{
            maxWidth: '650px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto',
            backgroundColor: 'var(--bg-card)',
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            padding: '0'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: 'linear-gradient(135deg, var(--brand-gold) 0%, var(--brand-gold-dark) 100%)',
              color: 'white',
              borderRadius: '16px 16px 0 0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '12px',
                  background: 'rgba(255,255,255,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <GitBranch size={20} color="white" />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: 'white' }}>
                    {selectedInstance.workflowName || t('details')}
                  </h2>
                  <div style={{ marginTop: '6px' }}>
                    <span style={{
                      ...getStatusStyle(selectedInstance.status),
                      background: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      border: '1px solid rgba(255,255,255,0.3)',
                      fontSize: '11px'
                    }}>
                      {getStatusIcon(selectedInstance.status)}
                      <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {t(normalizeWorkflowStatus(selectedInstance.status) + 'Status') || selectedInstance.status}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'white',
                  width: '36px', height: '36px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
              >
                <XCircle size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px' }}>

              {selectedInstance.documentTitle && selectedInstance.documentTitle !== t('document') && selectedInstance.documentTitle !== 'Document' && (
                <div style={{ marginBottom: '16px', padding: '12px 16px', background: 'var(--bg-page)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid var(--border-color)' }}>
                  <FileText size={18} style={{ color: 'var(--brand-gold)', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('document')}</div>
                    <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--text-primary)' }}>
                      {selectedInstance.documentTitle}
                    </div>
                  </div>
                </div>
              )}

              {selectedInstance.createdBy && !/^[a-f0-9]{24}$/i.test(selectedInstance.createdBy) && (
                <div style={{ marginBottom: '16px', padding: '12px 16px', background: 'var(--bg-page)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('createdBy') || 'Created By'}</div>
                  <div style={{ fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--brand-gold)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 'bold', flexShrink: 0 }}>
                      {selectedInstance.createdBy.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontSize: '14px' }}>{selectedInstance.createdBy}</span>
                  </div>
                </div>
              )}


              {selectedInstance.error && (
                <div style={{
                  marginTop: '0', marginBottom: '20px', padding: '12px 16px',
                  background: '#FEF2F2', borderRadius: '8px', border: '1px solid #FECACA',
                  display: 'flex', gap: '12px', alignItems: 'flex-start'
                }}>
                  <AlertCircle size={20} color="#DC2626" style={{ marginTop: '2px' }} />
                  <div>
                    <div style={{ color: '#DC2626', fontWeight: '600', fontSize: '14px' }}>{t('error') || 'Error Occurred'}</div>
                    <p style={{ color: '#B91C1C', margin: '4px 0 0 0', fontSize: '13px' }}>{selectedInstance.error}</p>
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div style={{ padding: '16px', background: 'var(--bg-base)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>{t('startedAt')}</div>
                  <div style={{ fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={14} />
                    {getDisplayDate(selectedInstance.startedAt, selectedInstance.steps, 'start', selectedInstance.status)}
                  </div>
                </div>
                <div style={{ padding: '16px', background: 'var(--bg-base)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>{t('completedAt')}</div>
                  <div style={{ fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={14} />
                    {getDisplayDate(selectedInstance.completedAt, selectedInstance.steps, 'end', selectedInstance.status)}
                  </div>
                </div>
              </div>

              {selectedInstance.steps && selectedInstance.steps.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>{t('steps')}</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0', border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}>
                    {(() => {
                      const wfTerminated = ['terminated', 'failed'].includes(normalizeWorkflowStatus(selectedInstance.status));
                      return sortWorkflowSteps(selectedInstance.steps).map((step: any, index: number) => {
                        let stepStatus = normalizeStepStatus(step.status);
                        // If workflow is terminated/failed and step never ran → show as skipped
                        if (wfTerminated && (stepStatus === 'pending' || stepStatus === 'ready')) {
                          stepStatus = 'skipped';
                        }
                        const isLast = index === (selectedInstance.steps?.length || 0) - 1;
                        const skippedStyle = {
                          padding: '4px 8px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
                          display: 'inline-flex', alignItems: 'center', gap: '6px',
                          backgroundColor: '#F3F4F6', color: '#6B7280', border: '1px solid #E5E7EB'
                        };
                        return (
                          <div key={step.stepId || index} style={{
                            padding: '16px',
                            background: stepStatus === 'skipped' ? '#FAFAFA' : 'var(--bg-card)',
                            borderBottom: isLast ? 'none' : '1px solid var(--border-color)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            opacity: stepStatus === 'skipped' ? 0.65 : 1
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                              <div style={{
                                width: '32px', height: '32px', borderRadius: '50%',
                                background: stepStatus === 'completed' ? '#D1FAE5' : (stepStatus === 'active' ? '#FEF3C7' : (stepStatus === 'failed' ? '#FEE2E2' : 'var(--bg-base)')),
                                color: stepStatus === 'completed' ? '#047857' : (stepStatus === 'active' ? '#B45309' : (stepStatus === 'failed' ? '#B91C1C' : 'var(--text-secondary)')),
                                border: `1px solid ${stepStatus === 'completed' ? '#A7F3D0' : (stepStatus === 'active' ? '#FDE68A' : (stepStatus === 'failed' ? '#FECACA' : 'var(--border-color)'))}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold'
                              }}>
                                {stepStatus === 'completed' ? <CheckCircle size={16} /> : (index + 1)}
                              </div>
                              <div>
                                <div style={{ fontWeight: stepStatus === 'active' ? '700' : '500', color: stepStatus === 'skipped' ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                                  {step.title || step.name || `${t('steps')} ${index + 1}`}
                                </div>
                                {step.startedAt && (
                                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                    {new Date(step.startedAt).toLocaleTimeString()}
                                  </div>
                                )}
                              </div>
                            </div>
                            {stepStatus === 'skipped' ? (
                              <span style={skippedStyle}>
                                — {t('skipped') || 'Skipped'}
                              </span>
                            ) : (
                              <span style={getStatusStyle(stepStatus)}>
                                {t(stepStatus + 'Status') || stepStatus}
                              </span>
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid var(--border-color)',
              background: 'var(--bg-base)',
              display: 'flex', justifyContent: 'flex-end',
              borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px'
            }}>
              <button
                onClick={() => setShowModal(false)}
                className="btn-primary"
                style={{ padding: '8px 24px' }}
              >
                {t('close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WorkflowInstances;
