import React, { useState, useEffect } from 'react';
import {
  Search,
  Activity as ActivityIcon,
  FileText,
  CheckCircle,
  Play,
  AlertCircle,
  Clock,
  User,
  Filter,
  Grid3x3,
  Table2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getActivities, deleteActivity, Activity } from '../api/activities';
import { useLanguage } from '../contexts/LanguageContext';
import LoadingState from '../components/LoadingState';
import Breadcrumb from '../components/Breadcrumb';
import DocumentsLayout from '../components/DocumentsLayout';
import Pagination from '../components/Pagination';
import Tooltip from '../components/Tooltip';
import '../styles/CommonList.css';

const Activities: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const itemsPerPage = viewMode === 'table' ? 20 : 12;
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const breadcrumbs = [
    { label: t('home'), onClick: () => navigate('/') },
    { label: t('activitiesTitle') || 'Activities' }
  ];

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const result = await getActivities();

      // Safety: check if result is returnData or the whole array
      let data: Activity[] = [];
      if (Array.isArray(result)) {
        data = result;
      } else if (result && typeof result === 'object' && (result as any).returnData) {
        data = (result as any).returnData;
      }

      // Sort by date descending
      const sortedData = data.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
      setActivities(sortedData);
    } catch (error) {
      console.error('Error loading activities:', error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (action: string) => {
    const act = action.toLowerCase();
    if (act.includes('start') || act.includes('trigger')) return <Play size={18} color="var(--brand-gold)" />;
    if (act.includes('approve')) return <CheckCircle size={18} color="#10b981" />;
    if (act.includes('reject')) return <AlertCircle size={18} color="#ef4444" />;
    if (act.includes('complete')) return <CheckCircle size={18} color="#2563eb" />;
    if (act.includes('update') || act.includes('edit')) return <FileText size={18} color="#64748b" />;
    return <ActivityIcon size={18} color="#94a3b8" />;
  };

  const filteredActivities = activities.filter(activity => {
    if (!activity) return false;
    const searchLow = searchTerm.toLowerCase();
    return (
      activity.title?.toLowerCase().includes(searchLow) ||
      activity.details?.toLowerCase().includes(searchLow) ||
      activity.action?.toLowerCase().includes(searchLow)
    );
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentActivities = filteredActivities.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);

  const headerActions = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div className="header-search-group" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div className="search-bar" style={{ margin: 0, padding: '0 14px', height: '38px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.02)' }}>
          <Search size={16} color="#94a3b8" />
          <input
            type="text"
            placeholder={t('searchActivitiesPlaceholder') || 'Search activities...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '13.5px', width: '200px', color: '#334155', padding: 0 }}
          />
        </div>
      </div>
    </div>
  );

  const renderActivitiesTable = () => (
    <div className="table-responsive-wrapper" style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      <table className="common-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <tr>
            <th style={{ padding: '12px 20px', textAlign: language === 'ar' ? 'right' : 'left', fontSize: '13px', color: '#64748b', fontWeight: '600' }}>{t('action')}</th>
            <th style={{ padding: '12px 20px', textAlign: language === 'ar' ? 'right' : 'left', fontSize: '13px', color: '#64748b', fontWeight: '600' }}>{t('details')}</th>
            <th style={{ padding: '12px 20px', textAlign: language === 'ar' ? 'right' : 'left', fontSize: '13px', color: '#64748b', fontWeight: '600' }}>{t('user')}</th>
            <th style={{ padding: '12px 20px', textAlign: language === 'ar' ? 'right' : 'left', fontSize: '13px', color: '#64748b', fontWeight: '600' }}>{t('date')}</th>
          </tr>
        </thead>
        <tbody>
          {currentActivities.map((activity, index) => (
            <tr key={activity.id || index} style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '14px 20px', fontSize: '14px', color: '#1e293b', fontWeight: '500' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {getActivityIcon(activity.action || '')}
                  {activity.action || t('systemActivity')}
                </div>
              </td>
              <td style={{ padding: '14px 20px', fontSize: '14px', color: '#64748b' }}>
                {activity.details || activity.description || ''}
              </td>
              <td style={{ padding: '14px 20px', fontSize: '14px', color: '#64748b' }}>
                {activity.userName || (activity.userId === '000000000000000000000000' ? t('system') : activity.userId)}
              </td>
              <td style={{ padding: '14px 20px', fontSize: '12px', color: '#94a3b8' }}>
                {activity.createdAt ? new Date(activity.createdAt).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US') : ''}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const customContent = (
    <div className="activities-timeline" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '4px' }}>
      {loading ? (
        <div style={{ padding: '60px 0' }}><LoadingState /></div>
      ) : filteredActivities.length === 0 ? (
        <div className="empty-state" style={{
          textAlign: 'center',
          padding: '80px 0',
          background: 'white',
          borderRadius: '16px',
          border: '2px dashed #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px'
        }}>
          <ActivityIcon size={48} style={{ opacity: 0.1 }} />
          <div style={{ color: '#64748b' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600' }}>{t('noActivities')}</h3>
            <p style={{ margin: 0, fontSize: '14px' }}>{t('systemActivitiesWillShowHere') || 'System activities and workflow logs will appear here.'}</p>
          </div>
        </div>
      ) : (
        <>
          {viewMode === 'table' ? renderActivitiesTable() : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {currentActivities.map((activity, index) => (
                <div
                  key={activity.id || index}
                  className="activity-item-card"
                  style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    border: '1px solid #f1f5f9',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '16px',
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div className="activity-icon-wrapper" style={{
                    padding: '10px',
                    borderRadius: '10px',
                    background: '#f8fafc',
                    border: '1px solid #f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {getActivityIcon(activity.action || '')}
                  </div>

                  <div className="activity-content" style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                      <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#1e293b' }}>
                        {activity.action || t('systemActivity')}
                      </h4>
                      <span style={{
                        fontSize: '12px',
                        color: '#94a3b8',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: '#f8fafc',
                        padding: '2px 8px',
                        borderRadius: '6px'
                      }}>
                        <Clock size={12} />
                        {activity.createdAt ? new Date(activity.createdAt).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US') : ''}
                      </span>
                    </div>

                    <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#64748b', lineHeight: '1.5' }}>
                      {activity.details || activity.description || ''}
                    </p>

                    <div className="activity-meta" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
                      {activity.userId && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b', background: '#f1f5f9', padding: '4px 10px', borderRadius: '20px' }}>
                          <User size={14} color="#64748b" />
                          <span style={{ fontWeight: 500 }}>{activity.userName || (activity.userId === '000000000000000000000000' ? t('system') || 'System' : activity.userId)}</span>
                        </div>
                      )}
                      {(activity.workspaceName || activity.workspaceId) && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b', background: '#fef3c7', padding: '4px 10px', borderRadius: '20px' }}>
                          <Filter size={14} color="#d97706" />
                          <span style={{ color: '#b45309', fontWeight: 500 }}>{activity.workspaceName || activity.workspaceId}</span>
                        </div>
                      )}
                      {(activity as any).documentName && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b', background: '#dcfce7', padding: '4px 10px', borderRadius: '20px' }}>
                          <FileText size={14} color="#16a34a" />
                          <span style={{ color: '#15803d', fontWeight: 500 }}>{(activity as any).documentName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filteredActivities.length}
              itemsPerPage={itemsPerPage}
            />
          )}
        </>
      )}
    </div>
  );

  return (
    <DocumentsLayout
      title={t('activitiesTitle')}
      subtitle={t('activitiesSubtitle')}
      headerIcon={ActivityIcon}
      headerIconColor="var(--brand-gold)"
      breadcrumb={<Breadcrumb items={breadcrumbs} />}
      actions={headerActions}
      showFilterBar={true}
      documents={[]}
      customContent={customContent}
      viewMode={viewMode}
      onViewModeChange={setViewMode}
    />
  );
};

export default Activities;
