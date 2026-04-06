import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Clock,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Users,
  FolderOpen,
  Calendar,
  Bell,
  Activity,
  Plus,
  Search,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Layout,
  ArrowRight,
  CheckSquare,
  GitBranch
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { getDocuments } from '../api/documents';
import { getTasks } from '../api/tasks';
import { getObligations } from '../api/obligations';
import { getAgentActionLogs } from '../api/agentActionLogs';
import { getWorkspaces } from '../api/workspaces';
import LoadingState from '../components/LoadingState';
import Counter from '../components/Counter';
import EmptyState from '../components/EmptyState';
import CreateWorkspaceModal from '../components/CreateWorkspaceModal';
import '../styles/Dashboard.css';

interface DashboardStats {
  totalDocuments: number;
  pendingTasks: number;
  upcomingObligations: number;
  pendingAgentActions: number;
  totalWorkspaces: number;
  recentActivity: number;
}

interface RecentItem {
  id: string;
  title: string;
  type: 'document' | 'task' | 'obligation' | 'agent';
  date: string;
  status?: string;
}

const Dashboard: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalDocuments: 0,
    pendingTasks: 0,
    upcomingObligations: 0,
    pendingAgentActions: 0,
    totalWorkspaces: 0,
    recentActivity: 0
  });
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const userName = user?.name || user?.email?.split('@')[0] || t('user') || 'User';

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const [documents, tasks, obligations, agentActions, workspaces] = await Promise.all([
        getDocuments().catch(() => []),
        getTasks().catch(() => []),
        getObligations().catch(() => []),
        getAgentActionLogs().catch(() => []),
        getWorkspaces().catch(() => [])
      ]);

      const safeDocuments = Array.isArray(documents) ? documents : [];
      const safeTasks = Array.isArray(tasks) ? tasks : [];
      const safeObligations = Array.isArray(obligations) ? obligations : [];
      const safeAgentActions = Array.isArray(agentActions) ? agentActions : [];
      const safeWorkspaces = Array.isArray(workspaces) ? workspaces : [];

      const pendingTasks = safeTasks.filter(t => t.status === 'Pending').length;
      const pendingAgentActions = safeAgentActions.filter(a => a.status === 'Pending' || a.status === 'Draft').length;

      setStats({
        totalDocuments: safeDocuments.length,
        pendingTasks,
        upcomingObligations: safeObligations.length,
        pendingAgentActions,
        totalWorkspaces: safeWorkspaces.length,
        recentActivity: safeDocuments.length + safeTasks.length
      });

      const recent: RecentItem[] = [];
      safeDocuments.slice(0, 5).forEach(doc => {
        recent.push({
          id: doc.id || '',
          title: doc.title,
          type: 'document',
          date: doc.created_at?.toString() || new Date().toISOString(),
          status: doc.status
        });
      });

      const sortedRecent = [...recent].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setRecentItems(sortedRecent);

    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState fullPage />;
  }

  return (
    <div className="dashboard-wrapper">
      {/* Header section */}
      <header className="dashboard-header">
        <h1>{t('welcomeBack')} {userName}</h1>
        <p className="subtitle">{t('dashboardGreetingDesc')}</p>
      </header>

      {/* AI Search Bar */}
      <div className="search-container" style={{ marginBottom: '30px', maxWidth: '700px' }}>
        <div className="ai-search-card">
          <Sparkles className="search-icon-ai" size={20} />
          <input
            type="text"
            placeholder={t('aiSearchPlaceholder')}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && searchQuery.trim()) navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`); }}
          />
          <button className="search-btn" onClick={() => { if (searchQuery.trim()) navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`); }}>
            <Search size={18} />
            {t('search')}
          </button>
        </div>
      </div>

      {/* Stats Grid - 6 stats as requested */}
      <div className="stats-grid-premium">
        <StatCard
          label={t('totalDocuments')}
          value={stats.totalDocuments}
          icon={FileText}
          color="#c3924d"
          trend="+12%"
          onClick={() => navigate('/workspace/all')}
        />
        <StatCard
          label={t('totalWorkspaces')}
          value={stats.totalWorkspaces}
          icon={Layout}
          color="#3b82f6"
          trend="+2 new"
          onClick={() => navigate('/')}
        />
        <StatCard
          label={t('pendingTasks')}
          value={stats.pendingTasks}
          icon={Clock}
          color="#f59e0b"
          onClick={() => navigate('/tasks')}
        />
        <StatCard
          label={t('upcomingObligations')}
          value={stats.upcomingObligations}
          icon={AlertCircle}
          color="#ef4444"
          onClick={() => navigate('/obligations')}
        />
        <StatCard
          label={t('pendingAgentActions')}
          value={stats.pendingAgentActions}
          icon={Bell}
          color="#8b5cf6"
          onClick={() => navigate('/agent-actions')}
        />
        <StatCard
          label={t('recentActivity')}
          value={stats.recentActivity}
          icon={Activity}
          color="#10b981"
          trend="+8%"
          onClick={() => navigate('/activities')}
        />
      </div>

      {/* Main Grid: Activity and Quick Actions */}
      <div className="dashboard-main-grid">
        {/* Recent Activity */}
        <div className="premium-card">
          <div className="card-title-row">
            <div>
              <h2>{t('recentActivity')}</h2>
              <span className="card-subtitle">{t('latestUpdates')}</span>
            </div>
            <button className="btn-link" onClick={() => navigate('/activities')}>
              {t('viewAll')}
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="activity-list-premium">
            {recentItems.length === 0 ? (
              <EmptyState
                title={t('noRecentActivity')}
                icon={<Activity size={40} />}
                className="dashboard-empty-state"
              />
            ) : (
              recentItems.map(item => (
                <div key={item.id} className="activity-item-premium">
                  <div className="act-icon-wrapper">
                    <FileText size={18} />
                  </div>
                  <div className="act-details">
                    <p className="act-name">{item.title}</p>
                    <p className="act-desc">{t('documentCreated')}</p>
                  </div>
                  <span className="act-time">
                    {formatTimeAgo(item.date, t)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Quick Actions & CTA */}
        <div>
          <div className="premium-card">
            <div className="card-title-row">
              <div>
                <h2>{t('quickActions')}</h2>
                <span className="card-subtitle">{t('getStartedTasks')}</span>
              </div>
            </div>

            <div className="quick-actions-grid">
              <QuickActionCard
                title={t('browseWorkspaces') || 'Browse Workspaces'}
                desc={t('openWorkspaceToUpload') || 'Open a workspace to upload documents'}
                icon={FolderOpen}
                className="act-blue"
                onClick={() => navigate('/')}
              />
              <QuickActionCard
                title={t('newWorkspace')}
                desc={t('createWorkspaceDesc')}
                icon={FolderOpen}
                className="act-green"
                onClick={() => setIsWorkspaceModalOpen(true)}
              />
              <QuickActionCard
                title={t('teamSettings')}
                desc={t('manageTeamMembers')}
                icon={Users}
                className="act-purple"
                onClick={() => navigate('/users')}
              />
              <QuickActionCard
                title={t('obligations') || 'Obligations'}
                desc={t('upcomingObligations') || 'View upcoming deadlines'}
                icon={Calendar}
                className="act-gold"
                onClick={() => navigate('/obligations')}
              />
            </div>
          </div>

          <div className="cta-card-premium">
            <h3>{t('manageYourWorkflow') || 'Manage Your Workflow'}</h3>
            <p>{t('trackAndExecute') || 'Track your pending tasks and execute workflows with ease.'}</p>
            <div className="cta-actions">
              <button className="cta-btn-white" onClick={() => navigate('/tasks')}>
                <CheckSquare size={18} />
                {t('viewTasks') || 'View Tasks'}
              </button>
              <button className="cta-btn-outline-white" onClick={() => navigate('/workflows?tab=manage')}>
                <GitBranch size={18} />
                {t('manageWorkflows') || 'Manage Workflows'}
              </button>
            </div>
          </div>
        </div>
      </div>
      <CreateWorkspaceModal
        isOpen={isWorkspaceModalOpen}
        onClose={() => setIsWorkspaceModalOpen(false)}
        onSuccess={loadDashboardData}
      />
    </div >
  );
};

// Helper Components
const StatCard: React.FC<{
  label: string;
  value: number;
  icon: any;
  color: string;
  trend?: string;
  onClick: () => void;
}> = ({ label, value, icon: Icon, color, trend, onClick }) => {
  return (
    <div className="stat-card-premium" onClick={onClick} style={{ cursor: 'pointer' }}>
      <div className="stat-info">
        <span className="title">{label}</span>
        <div className="value">
          <Counter end={value} />
        </div>
        {trend && (
          <div className={`trend ${trend.startsWith('+') ? 'up' : 'down'}`}>
            {trend.startsWith('+') ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {trend}
          </div>
        )}
      </div>
      <div className="stat-icon-wrapper" style={{ backgroundColor: `${color}15`, color: color }}>
        <Icon size={24} />
      </div>
    </div>
  );
};

const QuickActionCard: React.FC<{
  title: string;
  desc: string;
  icon: any;
  className: string;
  onClick: () => void;
}> = ({ title, desc, icon: Icon, className, onClick }) => {
  return (
    <button className={`action-card-premium ${className}`} onClick={onClick}>
      <div className="icon-circle">
        <Icon size={18} />
      </div>
      <h3>{title}</h3>
      <p>{desc}</p>
    </button>
  );
};

const formatTimeAgo = (date: string, t: any) => {
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return t('today');
  if (days === 1) return t('yesterday');
  return `${days} ${t('daysAgo')}`;
};

export default Dashboard;

