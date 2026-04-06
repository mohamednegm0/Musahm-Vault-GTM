import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Edit2, AlertCircle, Grid3x3, Table2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getObligations, createObligation, updateObligation, deleteObligation, getUpcomingObligations, Obligation } from '../api/obligations';
import { useLanguage } from '../contexts/LanguageContext';
import { useConfirm } from '../contexts/ConfirmContext';
import LoadingState from '../components/LoadingState';
import Breadcrumb from '../components/Breadcrumb';
import DocumentsLayout from '../components/DocumentsLayout';
import DatePicker from '../components/DatePicker';
import Tooltip from '../components/Tooltip';
import '../styles/CommonList.css';

const Obligations: React.FC = () => {
  const [obligations, setObligations] = useState<Obligation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const { t } = useLanguage();
  const [filterType, setFilterType] = useState(t('all') || 'All');
  const [formData, setFormData] = useState<Obligation>({
    title: '',
    description: '',
    dueDate: new Date()
  });
  const { confirm } = useConfirm();
  const navigate = useNavigate();

  const breadcrumbs = [
    { label: t('dashboard') || 'Dashboard', onClick: () => navigate('/dashboard') },
    { label: t('obligationsAndDeadlines') || 'Obligations & Deadlines' }
  ];

  useEffect(() => {
    // Reset filter when language changes or component mounts
    setFilterType(t('all') || 'All');
  }, [t]);

  useEffect(() => {
    loadObligations();
  }, [filterType]);

  const loadObligations = async () => {
    try {
      setLoading(true);
      let data: Obligation[];
      // Check translated string or fallback logic
      if (filterType === t('upcoming7days') || filterType === 'Upcoming (7 days)') {
        data = await getUpcomingObligations(7);
      } else {
        data = await getObligations();
      }
      setObligations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading obligations:', error);
      setObligations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await updateObligation(editingId, formData);
      } else {
        await createObligation(formData);
      }
      setShowModal(false);
      setFormData({ title: '', description: '', dueDate: new Date() });
      setEditingId(null);
      loadObligations();
    } catch (error) {
      console.error('Error saving obligation:', error);
    }
  };

  const handleDelete = async (id: string) => {
    confirm({
      title: t('delete'),
      message: t('confirmDelete') || 'Are you sure?',
      confirmText: t('delete'),
      cancelText: t('cancel'),
      type: 'danger',
      onConfirm: async () => {
        try {
          await deleteObligation(id);
          loadObligations();
        } catch (error) {
          console.error('Error deleting obligation:', error);
        }
      }
    });
  };

  const handleEdit = (obligation: Obligation) => {
    setFormData(obligation);
    setEditingId(obligation.id || null);
    setShowModal(true);
  };

  const isOverdue = (dueDate: Date) => new Date(dueDate) < new Date();
  const daysUntilDue = (dueDate: Date) => Math.ceil((new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  const safeObligations = Array.isArray(obligations) ? obligations : [];
  const filteredObligations = safeObligations.filter(obligation =>
    (obligation.title && obligation.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (obligation.description && obligation.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const headerActions = (
    <div className="header-search-group" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div className="search-bar" style={{ margin: 0, padding: '0 14px', height: '38px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.02)' }}>
        <Search size={16} color="#94a3b8" />
        <input
          type="text"
          placeholder={t('searchObligationsPlaceholder') || 'Search obligations...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '13.5px', width: '200px', color: '#334155', padding: 0 }}
        />
      </div>
      <button className="btn-primary" onClick={() => { setFormData({ title: '', description: '', dueDate: new Date() }); setShowModal(true); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '0 18px', height: '38px', borderRadius: '8px', background: 'var(--brand-gold)', color: 'white', border: 'none', fontWeight: '600', fontSize: '13.5px', cursor: 'pointer', boxShadow: '0 2px 4px -1px rgba(195, 146, 77, 0.2)' }}>
        <Plus size={16} /> {t('newObligation') || 'New Obligation'}
      </button>
    </div>
  );

  const renderTable = () => (
    <div className="table-responsive-wrapper" style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      <table className="common-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <tr>
            <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '13px', color: '#64748b', fontWeight: '600' }}>{t('title')}</th>
            <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '13px', color: '#64748b', fontWeight: '600' }}>{t('description')}</th>
            <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '13px', color: '#64748b', fontWeight: '600' }}>{t('dueDate')}</th>
            <th style={{ padding: '12px 20px', textAlign: 'right', fontSize: '13px', color: '#64748b', fontWeight: '600' }}>{t('actions')}</th>
          </tr>
        </thead>
        <tbody>
          {filteredObligations.map(obligation => (
            <tr key={obligation.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '14px 20px', fontSize: '14px', color: '#1e293b', fontWeight: '500' }}>{obligation.title}</td>
              <td style={{ padding: '14px 20px', fontSize: '14px', color: '#64748b' }}>{obligation.description}</td>
              <td style={{ padding: '14px 20px', fontSize: '14px' }}>
                <span className={`due-date ${isOverdue(obligation.dueDate) ? 'overdue' : ''}`}>
                  {new Date(obligation.dueDate).toLocaleDateString()}
                </span>
              </td>
              <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                <button onClick={() => handleEdit(obligation)} className="btn-icon">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => handleDelete(obligation.id!)} className="btn-icon btn-danger">
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
      {loading ? (
        <div style={{ padding: '60px 0' }}><LoadingState /></div>
      ) : viewMode === 'table' ? (
        renderTable()
      ) : (
        <div className="list-grid">
          {filteredObligations.length === 0 && (
            <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
              <p>{t('noObligations') || 'No obligations found.'}</p>
            </div>
          )}
          {filteredObligations.map(obligation => (
            <div key={obligation.id} className={`list-item ${isOverdue(obligation.dueDate) ? 'overdue' : ''}`}>
              <div className="obligation-header">
                <h3>{obligation.title}</h3>
                {isOverdue(obligation.dueDate) && <AlertCircle className="warning-icon" size={20} />}
              </div>
              <p>{obligation.description}</p>
              <div className="obligation-date">
                <span className={`due-date ${isOverdue(obligation.dueDate) ? 'overdue' : daysUntilDue(obligation.dueDate) <= 3 ? 'urgent' : ''}`}>
                  {t('due') || 'Due'}: {new Date(obligation.dueDate).toLocaleDateString()}
                  {!isOverdue(obligation.dueDate) && <span> ({daysUntilDue(obligation.dueDate)} {t('days') || 'days'})</span>}
                </span>
              </div>
              <div className="item-actions">
                <button onClick={() => handleEdit(obligation)} className="btn-icon">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => handleDelete(obligation.id!)} className="btn-icon btn-danger">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      <DocumentsLayout
        title={t('obligationsAndDeadlines') || 'Obligations & Deadlines'}
        headerIcon={AlertCircle}
        headerIconColor="var(--brand-gold)"
        breadcrumb={<Breadcrumb items={breadcrumbs} />}
        actions={headerActions}
        showFilterBar={true}
        filters={[t('all') || 'All', t('upcoming7days') || 'Upcoming (7 days)']}
        defaultFilter={t('all') || 'All'}
        onFilterChange={setFilterType}
        documents={[]}
        customContent={customContent}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editingId ? t('editObligation') || 'Edit Obligation' : t('newObligation') || 'New Obligation'}</h2>
            <input
              type="text"
              placeholder={t('obligationTitlePlaceholder') || 'Title'}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="form-input"
            />
            <textarea
              placeholder={t('obligationDescriptionPlaceholder') || 'Description'}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="form-input"
              rows={4}
            />
            <DatePicker
              value={new Date(formData.dueDate).toISOString().split('T')[0]}
              onChange={(val) => setFormData({ ...formData, dueDate: val ? new Date(val) : new Date() })}
              placeholder={t('dueDate') || 'Due Date'}
            />
            <div className="modal-buttons">
              <button onClick={() => setShowModal(false)} className="btn-secondary">{t('cancel') || 'Cancel'}</button>
              <button onClick={handleSave} className="btn-primary">{t('save') || 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Obligations;
