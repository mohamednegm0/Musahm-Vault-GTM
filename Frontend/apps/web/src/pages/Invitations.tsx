import React, { useState, useEffect } from 'react';
import { Users, Mail, Calendar, FileText, ArrowRight, Clock, Table2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getInvitations, getPendingInvitations, Invitation } from '../api/invitations';
import { useLanguage } from '../contexts/LanguageContext';
import DocumentsLayout from '../components/DocumentsLayout';
import Breadcrumb from '../components/Breadcrumb';
import LoadingState from '../components/LoadingState';
import Pagination from '../components/Pagination';
import Tooltip from '../components/Tooltip';
import { Grid3x3 } from 'lucide-react';
import '../styles/CommonList.css';

const Invitations: React.FC = () => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'pending'>('pending');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const itemsPerPage = viewMode === 'table' ? 20 : 10;
  const { t } = useLanguage();
  const navigate = useNavigate();

  const breadcrumbs = [
    { label: t('dashboard') || 'Dashboard', onClick: () => navigate('/dashboard') },
    { label: t('invitations') || 'Invitations' }
  ];

  useEffect(() => {
    loadInvitations();
  }, [filterType]);

  const loadInvitations = async () => {
    try {
      setLoading(true);
      let data: Invitation[];
      if (filterType === 'pending') {
        data = await getPendingInvitations();
      } else {
        data = await getInvitations();
      }
      setInvitations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading invitations:', error);
      setInvitations([]);
    } finally {
      setLoading(false);
    }
  };

  // Accept/Decline is handled via the Tasks workflow screen — not here.

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning'; // Changed to standard warning style
      case 'Accepted':
        return 'success';
      case 'Declined':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  const handleFilterChange = (filter: string) => {
    if (filter === (t('invitationspending') || 'Pending Workflow') || filter === 'Pending' || filter === 'Pending Workflow') {
      setFilterType('pending');
    } else {
      setFilterType('all');
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(invitations.length / itemsPerPage);
  const paginatedInvitations = invitations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [invitations, itemsPerPage]); // Added itemsPerPage to dependency array

  const customContent = (
    <div>
      {loading ? (
        <div style={{ padding: '60px 0' }}><LoadingState /></div>
      ) : invitations.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: '#94a3b8', border: '2px dashed #e2e8f0', borderRadius: '16px' }}>
          <Mail size={52} style={{ marginBottom: '16px', opacity: 0.15 }} />
          <p style={{ margin: 0, fontSize: '15px' }}>{t('invitationsEmpty') || 'No share requests found.'}</p>
        </div>
      ) : (
        <>
          {viewMode === 'table' ? (
            <>
            <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', fontSize: '13.5px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{t('status') || 'Status'}</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{t('emailAddress') || 'Email'}</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{t('document') || 'Document'}</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{t('sharedBy') || 'Shared By'}</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{t('invitationsExpires') || 'Expires'}</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedInvitations.map((invitation, idx) => (
                    <tr key={invitation.id} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? 'white' : '#fafbfc' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', letterSpacing: '0.4px', textTransform: 'uppercase', background: invitation.status === 'pending' ? '#fef3c7' : invitation.status?.toLowerCase() === 'accepted' ? '#dcfce7' : '#fee2e2', color: invitation.status === 'pending' ? '#92400e' : invitation.status?.toLowerCase() === 'accepted' ? '#166534' : '#991b1b' }}>
                          {invitation.status === 'pending' ? '⏳' : invitation.status?.toLowerCase() === 'accepted' ? '✅' : '❌'}
                          &nbsp;{invitation.status === 'pending' ? (t('invitationspending') || 'Pending') : invitation.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#1e293b', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{invitation.email}</td>
                      <td style={{ padding: '12px 16px', color: '#475569', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{invitation.fileName || '—'}</td>
                      <td style={{ padding: '12px 16px', color: '#475569', whiteSpace: 'nowrap' }}>{(invitation as any).createdByName || '—'}</td>
                      <td style={{ padding: '12px 16px', color: '#94a3b8', whiteSpace: 'nowrap', fontSize: '12.5px' }}>{invitation.expiresAt ? new Date(invitation.expiresAt).toLocaleDateString() : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} totalItems={invitations.length} itemsPerPage={itemsPerPage} />
            )}
            </>
          ) : (
          <>
          <div className="invitations-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
            {paginatedInvitations.map(invitation => (
              <div key={invitation.id} style={{
                background: 'white',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}>
                {/* Colored top accent */}
                <div style={{
                  height: '4px',
                  background: invitation.status === 'pending'
                    ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                    : invitation.status?.toLowerCase() === 'accepted'
                    ? 'linear-gradient(90deg, #10b981, #34d399)'
                    : 'linear-gradient(90deg, #ef4444, #f87171)',
                }} />

                {/* Card Top: Email + Status */}
                <div style={{ padding: '18px 20px 14px' }}>
                  {/* Status Badge */}
                  <div style={{ marginBottom: '10px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: '20px',
                      letterSpacing: '0.4px',
                      textTransform: 'uppercase',
                      background: invitation.status === 'pending' ? '#fef3c7' : invitation.status?.toLowerCase() === 'accepted' ? '#dcfce7' : '#fee2e2',
                      color: invitation.status === 'pending' ? '#92400e' : invitation.status?.toLowerCase() === 'accepted' ? '#166534' : '#991b1b',
                    }}>
                      {invitation.status === 'pending' ? '⏳' : invitation.status?.toLowerCase() === 'accepted' ? '✅' : '❌'}
                      &nbsp;{invitation.status === 'pending' ? (t('invitationspending') || 'Pending Workflow') : invitation.status}
                    </span>
                  </div>

                  {/* Email — full width, wraps naturally */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <div style={{ background: '#eef2ff', borderRadius: '8px', padding: '8px', flexShrink: 0, marginTop: '1px' }}>
                      <Mail size={16} color="#6366f1" />
                    </div>
                    <span style={{
                      fontSize: '15px',
                      fontWeight: 700,
                      color: '#0f172a',
                      lineHeight: '1.4',
                      wordBreak: 'break-all',
                    }}>
                      {invitation.email}
                    </span>
                  </div>
                </div>

                {/* Divider */}
                <div style={{ height: '1px', background: '#f1f5f9', margin: '0 20px' }} />

                {/* Card Body — metadata */}
                <div style={{ padding: '14px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {invitation.fileName && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <FileText size={15} color="#94a3b8" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>{t('document') || 'Document'}</div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#334155', wordBreak: 'break-word' }}>{invitation.fileName}</div>
                      </div>
                    </div>
                  )}
                  {(invitation as any).createdByName && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <Users size={15} color="#94a3b8" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>{t('sharedBy') || 'Shared by'}</div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>{(invitation as any).createdByName}</div>
                      </div>
                    </div>
                  )}
                  {invitation.expiresAt && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <Calendar size={15} color="#94a3b8" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>{t('invitationsExpires') || 'Expires'}</div>
                        <div style={{ fontSize: '13px', color: '#334155' }}>{new Date(invitation.expiresAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer — only for pending */}
                {invitation.status === 'pending' && (
                  <div style={{
                    background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                    borderTop: '1px solid #fde68a',
                    padding: '12px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '12.5px', color: '#92400e', fontWeight: 600 }}>
                      <Clock size={14} style={{ flexShrink: 0 }} />
                      {t('awaitingWorkflowApproval') || 'Awaiting approval in Tasks'}
                    </span>
                    <button
                      onClick={() => navigate('/tasks')}
                      style={{
                        background: 'linear-gradient(135deg, #b45309 0%, #d97706 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '7px 16px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                        boxShadow: '0 2px 6px rgba(180,83,9,0.3)',
                        transition: 'opacity 0.15s',
                      }}
                      onMouseOver={e => (e.currentTarget.style.opacity = '0.88')}
                      onMouseOut={e => (e.currentTarget.style.opacity = '1')}
                    >
                      {t('goToTasks') || 'Go to Tasks'} <ArrowRight size={13} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
          {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={invitations.length}
                itemsPerPage={itemsPerPage}
              />
          )}
          </> /* closes grid/list mode */
          )} {/* closes viewMode === 'table' ternary */}
        </>
      )}
    </div>
  );

  return (
    <DocumentsLayout
      title={t('invitations') || 'Invitations'}
      subtitle={
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            background: '#f1f5f9', 
            color: '#475569', 
            padding: '4px 12px', 
            borderRadius: '8px', 
            fontSize: '13px', 
            fontWeight: 600, 
            border: '1px solid #e2e8f0'
          }}>
            {t('invitationsTitle') || 'Document Share Requests'}
          </span>
          <span style={{ color: '#64748b' }}>
            {t('invitationsSubtitle') || 'Monitor external share requests and their workflow status'}
          </span>
        </div>
      }
      headerIcon={Users}
      headerIconColor="var(--brand-gold)"
      breadcrumb={<Breadcrumb items={breadcrumbs} />}
      actions={
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {invitations.length > 0 && (
            <span className="badge" style={{ background: '#c3924d', color: 'white', padding: '4px 12px', borderRadius: '12px' }}>
              {invitations.length}
            </span>
          )}
        </div>
      }
      viewMode={viewMode}
      onViewModeChange={setViewMode}
      showFilterBar={true}
      filters={[t('invitationspending') || 'Pending Workflow', t('invitationsAll') || 'All Requests']}
      defaultFilter={filterType === 'pending' ? (t('invitationspending') || 'Pending Workflow') : (t('invitationsAll') || 'All Requests')}
      onFilterChange={handleFilterChange}
      documents={[]}
      customContent={customContent}
      hideDocuments={true}
    />
  );
};

export default Invitations;
