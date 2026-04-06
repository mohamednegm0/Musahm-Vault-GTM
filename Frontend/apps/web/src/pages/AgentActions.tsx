import React, { useState, useEffect } from 'react';
import { Settings, ShieldCheck, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAgentActionLogs, getPendingAgentActions, approveAgentAction, rejectAgentAction, AgentActionLog } from '../api/agentActionLogs';
import { useLanguage } from '../contexts/LanguageContext';
import LoadingState from '../components/LoadingState';
import Breadcrumb from '../components/Breadcrumb';
import DocumentsLayout from '../components/DocumentsLayout';
import Tooltip from '../components/Tooltip';
import '../styles/CommonList.css';

const AgentActions: React.FC = () => {
  const [actions, setActions] = useState<AgentActionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'pending'>('pending');
  const [selectedAction, setSelectedAction] = useState<AgentActionLog | null>(null);
  const [showModal, setShowModal] = useState(false);
  const { t } = useLanguage();
  const navigate = useNavigate();

  const breadcrumbs = [
    { label: t('dashboard') || 'Dashboard', onClick: () => navigate('/dashboard') },
    { label: t('agentActions') || 'Agent Actions' }
  ];

  useEffect(() => {
    loadActions();
  }, [filterType]);

  const loadActions = async () => {
    try {
      setLoading(true);
      let data: AgentActionLog[];
      if (filterType === 'pending') {
        data = await getPendingAgentActions();
      } else {
        data = await getAgentActionLogs();
      }
      setActions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading agent actions:', error);
      setActions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await approveAgentAction(id);
      loadActions();
      setShowModal(false);
    } catch (error) {
      console.error('Error approving action:', error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectAgentAction(id);
      loadActions();
      setShowModal(false);
    } catch (error) {
      console.error('Error rejecting action:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft':
      case 'Pending':
        return 'warning';
      case 'Approved':
      case 'Executed':
        return 'success';
      case 'Rejected':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  const handleFilterChange = (filter: string) => {
    if (filter === (t('agentActionsAll') || 'All')) {
      setFilterType('all');
    } else {
      setFilterType('pending');
    }
  };

  const customContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {loading ? (
        <div style={{ padding: '60px 0' }}><LoadingState /></div>
      ) : actions.length === 0 ? (
        <div className="empty-state">
          <ShieldCheck size={64} color="var(--text-muted)" style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <p>{t('agentActionsEmpty') || 'No agent actions'}</p>
        </div>
      ) : (
        <div className="list-grid">
          {actions.map(action => (
            <div key={action.id} className="list-item">
              <div className="item-header">
                <h3>{action.action}</h3>
                <span className={`status status-${getStatusColor(action.status)}`}>
                  {t(action.status) || action.status}
                </span>
              </div>
              <p style={{ margin: '8px 0', color: 'var(--text-secondary)' }}>{action.description}</p>

              <div className="action-meta" style={{ marginTop: '8px', fontSize: '0.85rem' }}>
                {action.createdAt && (
                  <span className="created-date" style={{ color: 'var(--text-disabled)' }}>
                    {new Date(action.createdAt).toLocaleDateString()}
                  </span>
                )}
              </div>

              {action.status === 'Pending' && (
                <div className="item-actions" style={{ marginTop: '16px', borderTop: '1px solid #e5e7eb', paddingTop: '12px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <button
                    onClick={() => {
                      setSelectedAction(action);
                      setShowModal(true);
                    }}
                    className="btn-primary"
                    style={{ fontSize: '0.9rem', padding: '6px 12px' }}
                  >
                    {t('agentActionsReview') || 'Review'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      <DocumentsLayout
        title={t('agentActions') || 'Agent Actions'}
        subtitle={t('agentActionsDesc') || 'Monitor and approve automated agent activities'}
        headerIcon={ShieldCheck}
        headerIconColor="var(--brand-gold)"
        breadcrumb={<Breadcrumb items={breadcrumbs} />}
        showFilterBar={true}
        filters={[t('agentActionsPending') || 'Pending', t('agentActionsAll') || 'All']}
        defaultFilter={filterType === 'pending' ? (t('agentActionsPending') || 'Pending') : (t('agentActionsAll') || 'All')}
        onFilterChange={handleFilterChange}
        actions={actions.length > 0 && filterType === 'pending' ? <span className="badge" style={{ background: '#c3924d', color: 'white', padding: '4px 12px', borderRadius: '12px' }}>{actions.length}</span> : null}
        documents={[]}
        customContent={customContent}
        hideDocuments={true}
      />

      {showModal && selectedAction && (
        <div className="modal-overlay">
          <div className="modal action-modal">
            <h2>{t('agentActionsReview') || 'Review Agent Action'}</h2>
            <div className="review-content" style={{ display: 'flex', flexDirection: 'column', gap: '16px', margin: '20px 0' }}>
              <div className="field-group">
                <label style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{t('agentActionsAction') || 'Action'}:</label>
                <p style={{ margin: '4px 0', fontSize: '1.1rem' }}>{selectedAction.action}</p>
              </div>
              <div className="field-group">
                <label style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{t('agentActionsDescription') || 'Description'}:</label>
                <div style={{ background: '#f9fafb', padding: '12px', borderRadius: '6px', marginTop: '4px' }}>
                  <p>{selectedAction.description}</p>
                </div>
              </div>
              <div className="field-group">
                <label style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{t('agentActionsStatus') || 'Status'}:</label>
                <span className={`status status-${getStatusColor(selectedAction.status)}`} style={{ display: 'inline-block', marginTop: '4px' }}>
                  {t(selectedAction.status) || selectedAction.status}
                </span>
              </div>
            </div>
            <div className="modal-buttons" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowModal(false)} className="btn-secondary">{t('agentActionsClose') || 'Close'}</button>
              <button
                onClick={() => handleReject(selectedAction.id!)}
                className="btn-danger"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#EF4444', color: 'white', border: 'none' }}
              >
                <XCircle size={16} /> {t('agentActionsReject') || 'Reject'}
              </button>
              <button
                onClick={() => handleApprove(selectedAction.id!)}
                className="btn-success"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#10B981', color: 'white', border: 'none', padding: '10px 20px' }}
              >
                <CheckCircle size={16} /> {t('agentActionsApprove') || 'Approve'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AgentActions;
