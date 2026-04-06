import React, { useState, useEffect } from 'react';
import { Search, History, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAuditLogs, AuditLog } from '../api/auditLogs';
import { useLanguage } from '../contexts/LanguageContext';
import DocumentsLayout from '../components/DocumentsLayout';
import Breadcrumb from '../components/Breadcrumb';
import LoadingState from '../components/LoadingState';
import Pagination from '../components/Pagination';
import DatePicker from '../components/DatePicker';
import '../styles/CommonList.css';

const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { t } = useLanguage();
  const navigate = useNavigate();

  const breadcrumbs = [
    { label: t('dashboard') || 'Dashboard', onClick: () => navigate('/dashboard') },
    { label: t('auditLogsTitle') || 'Audit Logs' }
  ];

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await getAuditLogs();
      // Safe check
      setLogs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading audit logs:', error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const safeLogs = Array.isArray(logs) ? logs : [];

  const filteredLogs = safeLogs.filter(log => {
    if (!log) return false;

    // Only apply text search if something is typed
    const hasSearch = searchTerm.trim().length > 0;
    if (hasSearch) {
      const userMatch = (typeof log.actorUserId === 'string' && log.actorUserId.toLowerCase().includes(searchTerm.toLowerCase())) ||
                        (typeof log.actorUserName === 'string' && log.actorUserName.toLowerCase().includes(searchTerm.toLowerCase()));
      const actionMatch = typeof log.action === 'string' && log.action.toLowerCase().includes(searchTerm.toLowerCase());
      const entityTypeMatch = typeof log.entityType === 'string' && log.entityType.toLowerCase().includes(searchTerm.toLowerCase());
      const entityNameMatch = typeof log.entityName === 'string' && log.entityName.toLowerCase().includes(searchTerm.toLowerCase());
      if (!userMatch && !actionMatch && !entityTypeMatch && !entityNameMatch) return false;
    }

    // Action filter
    if (filterAction && log.action !== filterAction) return false;

    // Date range filter
    const logDate = new Date(log.createdAt || new Date());
    const start = startDate ? new Date(startDate) : new Date(0);
    const end = endDate ? new Date(endDate) : new Date();
    if (endDate) end.setHours(23, 59, 59, 999);
    if (logDate < start || logDate > end) return false;

    return true;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterAction, startDate, endDate]);

  const uniqueActions = Array.from(new Set(safeLogs.map(log => log.action))).filter(Boolean);

  const customContent = (
    <div className="audit-logs-container">
      {/* Filters Section */}
      <div className="audit-filters" style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '1.5rem',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {/* Search */}
          <div className="filter-group">
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
              {t('auditLogsSearch') || 'Search'}
            </label>
            <div className="search-input-wrapper" style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input
                type="text"
                placeholder={t('auditLogsSearchPlaceholder') || 'User, Action, Entity...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '0.5rem 0.5rem 0.5rem 2.25rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.875rem' }}
              />
            </div>
          </div>

          {/* Action Filter */}
          <div className="filter-group">
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
              {t('auditLogsAction') || 'Action'}
            </label>
            <div style={{ position: 'relative' }}>
              <Filter size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                style={{ width: '100%', padding: '0.5rem 0.5rem 0.5rem 2.25rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.875rem', appearance: 'none', background: 'white' }}
              >
                <option value="">{t('auditLogsAllActions') || 'All Actions'}</option>
                {uniqueActions.map(action => (
                  <option key={action} value={action}>{action}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Date Range - From */}
          <div className="filter-group">
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
              {t('auditLogsFrom') || 'From'}
            </label>
            <DatePicker
              value={startDate}
              onChange={setStartDate}
              placeholder={t('auditLogsFrom') || 'From'}
            />
          </div>

          {/* Date Range - To */}
          <div className="filter-group">
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
              {t('auditLogsTo') || 'To'}
            </label>
            <DatePicker
              value={endDate}
              onChange={setEndDate}
              placeholder={t('auditLogsTo') || 'To'}
              minDate={startDate || undefined}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '60px 0' }}><LoadingState /></div>
      ) : filteredLogs.length === 0 ? (
        <div className="empty-state" style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <History size={48} color="#9ca3af" style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <p style={{ color: '#4b5563' }}>{t('auditLogsEmpty') || 'No audit logs found matching your criteria.'}</p>
        </div>
      ) : (
        <div className="audit-table-container" style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <tr>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: '#374151' }}>{t('auditLogsTimestamp') || 'Timestamp'}</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: '#374151' }}>{t('auditLogsUser') || 'User'}</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: '#374151' }}>{t('auditLogsAction') || 'Action'}</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: '#374151' }}>{t('auditLogsEntityType') || 'Entity Type'}</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: '#374151' }}>{t('auditLogsEntityName') || 'Entity Name'}</th>
              </tr>
            </thead>
            <tbody style={{ borderTop: '1px solid #e5e7eb' }}>
              {paginatedLogs.map((log, index) => (
                <tr key={log.id} style={{ borderTop: index > 0 ? '1px solid #e5e7eb' : 'none', background: index % 2 === 0 ? 'white' : '#f9fafb' }}>
                  <td style={{ padding: '0.75rem 1rem', color: '#4b5563' }}>{log.createdAt ? new Date(log.createdAt).toLocaleString() : '-'}</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#111827', fontWeight: 500 }}>{log.actorUserName || log.actorUserId}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      background: '#e0f2fe',
                      color: '#0369a1'
                    }}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: '#4b5563' }}>{log.entityType}</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#374151' }}>{log.entityName || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredLogs.length}
            itemsPerPage={itemsPerPage}
          />
        </div>
      )}
    </div>
  );

  return (
    <DocumentsLayout
      title={t('auditLogsTitle') || 'Audit Logs'}
      subtitle={t('auditLogsSubtitle') || 'Track system activity and security events'}
      headerIcon={History}
      headerIconColor="var(--brand-gold)"
      breadcrumb={<Breadcrumb items={breadcrumbs} />}
      actions={safeLogs.length > 0 ? <span className="badge" style={{ background: '#c3924d', color: 'white', padding: '4px 12px', borderRadius: '12px' }}>{filteredLogs.length} / {safeLogs.length}</span> : null}
      documents={[]}
      customContent={customContent}
      hideDocuments={true}
      showFilterBar={false}
    />
  );
};

export default AuditLogs;
