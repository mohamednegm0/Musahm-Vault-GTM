import React, { useState } from 'react';
import { Clock, Lock, Trash2, Archive, AlertTriangle, Plus, Edit2, Grid3x3, Table2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useConfirm } from '../contexts/ConfirmContext';
import DocumentsLayout from '../components/DocumentsLayout';
import Tooltip from '../components/Tooltip';
import '../styles/CommonList.css';

interface RetentionPolicy {
  id: string;
  name: string;
  description: string;
  workspaceId?: string;
  documentType?: string;
  retentionPeriod: number; // in days
  retentionUnit: 'days' | 'months' | 'years';
  action: 'archive' | 'delete' | 'notify';
  legalHold: boolean;
  status: 'active' | 'inactive';
  createdAt?: string;
}

import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb';
import Pagination from '../components/Pagination';

const RetentionPolicies: React.FC = () => {
  const { t } = useLanguage();
  const { confirm } = useConfirm();
  const navigate = useNavigate();

  const breadcrumbs = [
    { label: t('dashboard') || 'Dashboard', onClick: () => navigate('/dashboard') },
    { label: t('retentionPolicies') || 'Retention & Lifecycle Policies' }
  ];
  const [policies, setPolicies] = useState<RetentionPolicy[]>([
    {
      id: '1',
      name: 'Board Minutes Retention',
      description: 'Keep board minutes for 7 years',
      documentType: 'Board MoM',
      retentionPeriod: 7,
      retentionUnit: 'years',
      action: 'archive',
      legalHold: false,
      status: 'active',
      createdAt: '2024-01-01'
    },
    {
      id: '2',
      name: 'Contract Retention',
      description: 'Keep contracts for 10 years after expiry',
      documentType: 'Commercial Contract',
      retentionPeriod: 10,
      retentionUnit: 'years',
      action: 'archive',
      legalHold: false,
      status: 'active',
      createdAt: '2024-01-15'
    },
    {
      id: '3',
      name: 'NDA Retention',
      description: 'Keep NDAs for 5 years',
      documentType: 'NDA',
      retentionPeriod: 5,
      retentionUnit: 'years',
      action: 'delete',
      legalHold: false,
      status: 'active',
      createdAt: '2024-02-01'
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<RetentionPolicy>({
    id: '',
    name: '',
    description: '',
    documentType: '',
    retentionPeriod: 1,
    retentionUnit: 'years',
    action: 'archive',
    legalHold: false,
    status: 'active'
  });
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(policies.length / itemsPerPage);
  const paginatedPolicies = policies.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  React.useEffect(() => {
    setCurrentPage(1);
  }, [policies.length]);

  const handleSave = () => {
    if (editingId) {
      setPolicies(policies.map(p => p.id === editingId ? { ...formData, id: editingId } : p));
    } else {
      setPolicies([...policies, { ...formData, id: Date.now().toString(), createdAt: new Date().toISOString() }]);
    }
    setShowModal(false);
    resetForm();
  };

  const handleEdit = (policy: RetentionPolicy) => {
    setFormData(policy);
    setEditingId(policy.id);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    confirm({
      title: t('delete'),
      message: t('confirmDelete') || 'Are you sure?',
      confirmText: t('delete'),
      cancelText: t('cancel'),
      type: 'danger',
      onConfirm: () => {
        setPolicies(policies.filter(p => p.id !== id));
      }
    });
  };

  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      description: '',
      documentType: '',
      retentionPeriod: 1,
      retentionUnit: 'years',
      action: 'archive',
      legalHold: false,
      status: 'active'
    });
    setEditingId(null);
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'archive': return <Archive size={16} />;
      case 'delete': return <Trash2 size={16} />;
      case 'notify': return <AlertTriangle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'archive': return '#c3924d';
      case 'delete': return '#EF4444';
      case 'notify': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const headerActions = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <button className="btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
        <Plus size={20} /> {t('newPolicy') || 'New Policy'}
      </button>
    </div>
  );

  const renderTable = () => (
    <div className="table-responsive-wrapper" style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      <table className="common-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <tr>
            <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '13px', color: '#64748b', fontWeight: '600' }}>{t('policyName')}</th>
            <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '13px', color: '#64748b', fontWeight: '600' }}>{t('documentType')}</th>
            <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '13px', color: '#64748b', fontWeight: '600' }}>{t('retentionPeriod')}</th>
            <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '13px', color: '#64748b', fontWeight: '600' }}>{t('action')}</th>
            <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '13px', color: '#64748b', fontWeight: '600' }}>{t('status')}</th>
            <th style={{ padding: '12px 20px', textAlign: 'right', fontSize: '13px', color: '#64748b', fontWeight: '600' }}>{t('actions')}</th>
          </tr>
        </thead>
        <tbody>
          {paginatedPolicies.map(policy => (
            <tr key={policy.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '14px 20px', fontSize: '14px', color: '#1e293b', fontWeight: '500' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {policy.name}
                  {policy.legalHold && <Lock size={12} color="#EF4444" />}
                </div>
              </td>
              <td style={{ padding: '14px 20px', fontSize: '14px', color: '#64748b' }}>{policy.documentType || t('allDocuments')}</td>
              <td style={{ padding: '14px 20px', fontSize: '14px', color: '#64748b' }}>{policy.retentionPeriod} {policy.retentionUnit}</td>
              <td style={{ padding: '14px 20px', fontSize: '14px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: getActionColor(policy.action) }}>
                  {getActionIcon(policy.action)}
                  {policy.action}
                </span>
              </td>
              <td style={{ padding: '14px 20px', fontSize: '14px' }}>
                <span className={`status status-${policy.status === 'active' ? 'success' : 'pending'}`}>
                  {policy.status}
                </span>
              </td>
              <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                <button onClick={() => handleEdit(policy)} className="btn-icon">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => handleDelete(policy.id)} className="btn-icon btn-danger">
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const customContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="info-banner" style={{ padding: '16px', background: '#FEF3C7', borderRadius: '8px', border: '1px solid #FDE68A', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <AlertTriangle size={20} color="#92400E" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong style={{ color: '#92400E' }}>{t('retentionWarning') || 'Important:'}</strong>
          <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#B45309' }}>
            {t('retentionWarningText') || 'Retention policies apply automatically. Documents under legal hold cannot be deleted or modified.'}
          </p>
        </div>
      </div>

      {viewMode === 'table' ? (
        renderTable()
      ) : (
        <div className="list-grid">
          {paginatedPolicies.map(policy => (
            <div key={policy.id} className="list-item">
              <div className="item-header">
                <h3>{policy.name}</h3>
                {policy.legalHold && (
                  <span className="badge" style={{ background: '#FEE2E2', color: '#991B1B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Lock size={12} /> Legal Hold
                  </span>
                )}
              </div>
              <p>{policy.description}</p>

              <div className="policy-details" style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {policy.documentType && (
                  <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                    <strong>{t('documentType') || 'Document Type'}:</strong> {policy.documentType}
                  </div>
                )}
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  <strong>{t('retentionPeriod') || 'Retention Period'}:</strong> {policy.retentionPeriod} {policy.retentionUnit}
                </div>
                <div style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <strong>{t('action') || 'Action'}:</strong>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: getActionColor(policy.action) }}>
                    {getActionIcon(policy.action)}
                    {policy.action.charAt(0).toUpperCase() + policy.action.slice(1)}
                  </span>
                </div>
              </div>

              <div className="item-meta" style={{ marginTop: '12px' }}>
                <span className={`status status-${policy.status === 'active' ? 'success' : 'pending'}`}>
                  {policy.status}
                </span>
                {policy.createdAt && (
                  <span className="created-date">
                    {t('created') || 'Created'}: {new Date(policy.createdAt).toLocaleDateString()}
                  </span>
                )}
              </div>

              <div className="item-actions">
                <button onClick={() => handleEdit(policy)} className="btn-icon">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => handleDelete(policy.id)} className="btn-icon btn-danger">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={policies.length}
        itemsPerPage={itemsPerPage}
      />
    </div>
  );

  return (
    <>
      <DocumentsLayout
        title={t('retentionPolicies') || 'Retention & Lifecycle Policies'}
        subtitle={t('retentionSubtitle') || 'Manage document retention, archival, and legal hold policies'}
        headerIcon={Clock}
        headerIconColor="var(--brand-gold)"
        breadcrumb={<Breadcrumb items={breadcrumbs} />}
        actions={headerActions}
        documents={[]}
        customContent={customContent}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        hideDocuments={true}
      />

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editingId ? (t('editPolicy') || 'Edit Policy') : (t('newPolicy') || 'New Policy')}</h2>
            <div className="form-group">
              <label>{t('policyName') || 'Policy Name'}</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('enterPolicyName') || 'Enter policy name'}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>{t('description') || 'Description'}</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={t('enterDescription') || 'Enter description'}
                rows={3}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>{t('documentType') || 'Document Type'} ({t('optional') || 'Optional'})</label>
              <select
                value={formData.documentType}
                onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
                className="form-input"
              >
                <option value="">{t('allDocuments') || 'All Documents'}</option>
                <option value="Board MoM">Board MoM</option>
                <option value="Resolution">Resolution</option>
                <option value="NDA">NDA</option>
                <option value="Commercial Contract">Commercial Contract</option>
                <option value="Policy">Policy / SOP</option>
                <option value="License">License / Permit</option>
              </select>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>{t('retentionPeriod') || 'Retention Period'}</label>
                <input
                  type="number"
                  min="1"
                  value={formData.retentionPeriod}
                  onChange={(e) => setFormData({ ...formData, retentionPeriod: parseInt(e.target.value) })}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>{t('unit') || 'Unit'}</label>
                <select
                  value={formData.retentionUnit}
                  onChange={(e) => setFormData({ ...formData, retentionUnit: e.target.value as any })}
                  className="form-input"
                >
                  <option value="days">{t('days') || 'Days'}</option>
                  <option value="months">{t('months') || 'Months'}</option>
                  <option value="years">{t('years') || 'Years'}</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>{t('actionAfterRetention') || 'Action After Retention'}</label>
              <select
                value={formData.action}
                onChange={(e) => setFormData({ ...formData, action: e.target.value as any })}
                className="form-input"
              >
                <option value="archive">{t('archive') || 'Archive'}</option>
                <option value="delete">{t('delete') || 'Delete'}</option>
                <option value="notify">{t('notify') || 'Notify Only'}</option>
              </select>
            </div>
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.legalHold}
                  onChange={(e) => setFormData({ ...formData, legalHold: e.target.checked })}
                />
                <Lock size={16} />
                {t('legalHold') || 'Legal Hold (Prevent Deletion)'}
              </label>
            </div>
            <div className="form-group">
              <label>{t('status') || 'Status'}</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="form-input"
              >
                <option value="active">{t('active') || 'Active'}</option>
                <option value="inactive">{t('inactive') || 'Inactive'}</option>
              </select>
            </div>
            <div className="modal-actions">
              <button onClick={() => { setShowModal(false); resetForm(); }} className="btn-secondary">
                {t('cancel') || 'Cancel'}
              </button>
              <button onClick={handleSave} className="btn-primary">
                {t('save') || 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RetentionPolicies;
