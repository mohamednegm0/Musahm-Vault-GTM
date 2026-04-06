import React, { useState, useEffect } from 'react';
import {
  FileText,
  Folder,
  Users,
  Star,
  X,
  Plus,
  Gavel,
  Building,
  Edit2,
  Trash2,
  Share2,
  LayoutDashboard,
  Search,
  CheckSquare,
  History,
  Workflow,
  Play,
  Clock,
  FileScan,
  UserPlus,
  Bot,
  ShieldCheck,
  Settings
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useWorkspace } from '../contexts/WorkspaceContext';
import CreateWorkspaceModal from './CreateWorkspaceModal';
import Tooltip from './Tooltip';
import './Sidebar.css';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface WorkspaceItem {
  id: string;
  nameKey?: string;
  name?: string;
  icon: React.ElementType;
  active?: boolean;
  legalHold?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { t, language } = useLanguage();
  useAuth(); // Ensure auth context is available
  const location = useLocation();
  const navigate = useNavigate();
  const { workspaces, refreshWorkspaces } = useWorkspace(); // Use context

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [visibleWorkspacesCount, setVisibleWorkspacesCount] = useState(6);

  const isStarredPage = location.pathname === '/starred';

  const quickAccess = [
    { id: 'dashboard', name: t('dashboard'), icon: LayoutDashboard, path: '/dashboard' },
    { id: 'starred', name: t('starred'), icon: Star, path: '/starred' },
    { id: 'shared', name: t('sharedWithMe'), icon: Share2, path: '/shared' },
    { id: 'recycle-bin', name: t('recycleBin') || (language === 'ar' ? 'سلة المهملات' : 'Recycle Bin'), icon: Trash2, path: '/recycle-bin' },
    { id: 'search', name: t('searchVault'), icon: Search, path: '/search' },
    { id: 'tasks', name: t('tasks'), icon: CheckSquare, path: '/tasks' },
    { id: 'activities', name: t('activities'), icon: History, path: '/activities' },
    { id: 'obligations', name: t('obligations'), icon: Gavel, path: '/obligations' },
    { id: 'workflows', name: t('workflows'), icon: Workflow, path: '/workflows' },
    { id: 'workflow-instances', name: t('workflowInstances'), icon: Play, path: '/workflow-instances' },
    { id: 'retention-policies', name: t('retentionPolicies'), icon: Clock, path: '/retention-policies' },
    { id: 'extractions', name: t('extractionReview'), icon: FileScan, path: '/extractions' },
    { id: 'invitations', name: t('invitations'), icon: UserPlus, path: '/invitations' },
    { id: 'agent-actions', name: t('agentActions'), icon: Bot, path: '/agent-actions' },
    { id: 'audit-logs', name: t('auditLogs'), icon: ShieldCheck, path: '/audit-logs' },
    { id: 'users', name: t('users'), icon: Users, path: '/users' },
    { id: 'admin-settings', name: t('adminSettings'), icon: Settings, path: '/admin/settings' },
    { id: 'permissions', name: t('permissions'), icon: ShieldCheck, path: '/permissions' },
    { id: 'my-companies', name: t('myCompanies') || 'My Companies', icon: Building, path: '/my-companies' },
  ];

  // Store last active tab when user navigates
  React.useEffect(() => {
    if (location.pathname === '/') {
      localStorage.setItem('lastActiveTab', 'home');
    } else if (location.pathname.startsWith('/workspace/')) {
      // Extract workspace ID
      const parts = location.pathname.split('/');
      if (parts[2]) {
        localStorage.setItem('lastActiveTab', `workspace:${parts[2]}`);
      }
    } else if (location.pathname === '/starred') {
      localStorage.setItem('lastActiveTab', 'starred');
    } else if (location.pathname === '/shared') {
      localStorage.setItem('lastActiveTab', 'shared');
    }
    // Don't update for /document/* paths - keep the previous value
  }, [location.pathname]);

  const lastActiveTab = localStorage.getItem('lastActiveTab') || 'home';
  const isOnDocumentPage = location.pathname.startsWith('/document/');


  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <Link to="/" className="sidebar-logo">
            <img src="/images/logo.png" alt="Musahm Vault" style={{ height: '40px', width: 'auto' }} />
          </Link>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="sidebar-content">
          {/* <div className="new-document-container">
            <button className="new-document-btn" onClick={() => navigate('/document/upload')}>
              <Plus size={20} />
              <span>{t('newDocument')}</span>
            </button>
          </div> */}

          <div className="sidebar-section-card documents-card">
            <div className="section-header">
              <div className="section-title-wrapper">
                <span className="section-dot" style={{ backgroundColor: '#00295B' }}></span>
                <h3 className="section-title">{t('documentsLabel')}</h3>
              </div>
              {/* <Tooltip content={t('newDocument')} position="bottom">
                <button className="add-folder-btn" onClick={() => navigate('/document/upload')}>
                  <Plus size={16} />
                </button>
              </Tooltip> */}
            </div>
            <ul className="sidebar-menu">
              <li className={location.pathname === '/' || (isOnDocumentPage && lastActiveTab === 'home') ? 'active' : ''} onClick={() => navigate('/')}>
                <div className="workspace-item-content">
                  <FileText size={18} />
                  <span>{t('allFiles')}</span>
                </div>
              </li>
              <li className={location.pathname === '/starred' || (isOnDocumentPage && lastActiveTab === 'starred') ? 'active' : ''} onClick={() => navigate('/starred')}>
                <div className="workspace-item-content">
                  <Star size={18} />
                  <span>{t('starred')}</span>
                </div>
              </li>
              <li className={location.pathname === '/shared' || (isOnDocumentPage && lastActiveTab === 'shared') ? 'active' : ''} onClick={() => navigate('/shared')}>
                <div className="workspace-item-content">
                  <Share2 size={18} />
                  <span>{t('sharedWithMe')}</span>
                </div>
              </li>
            </ul>
          </div>



          <div className="sidebar-section-card folders-card">
            <div className="section-header">
              <div className="section-title-wrapper">
                <span className="section-dot" style={{ backgroundColor: '#10b981' }}></span>
                <h3 className="section-title">{t('foldersLabel')}</h3>
              </div>
              <Tooltip content={t('addWorkspace')} position="bottom">
                <button className="add-folder-btn" onClick={() => setIsModalOpen(true)}>
                  <div className="folder-plus-stack">
                    <Folder size={18} />
                    <Plus size={10} className="folder-plus-icon" />
                  </div>
                </button>
              </Tooltip>
            </div>
            <div className="sidebar-menu-wrapper">
              {workspaces.length === 0 ? (
                <div className="sidebar-empty-state">
                  <Folder size={32} className="sidebar-empty-icon" />
                  <span className="sidebar-empty-text">{t('noWorkspacesYet')}</span>
                  <p className="sidebar-empty-desc">{t('noWorkspacesDesc')}</p>
                </div>
              ) : (
                <ul className="sidebar-menu">
                  {workspaces.slice(0, visibleWorkspacesCount).map((item) => {
                    const Icon = item.icon;
                    const displayName = item.nameKey ? t(item.nameKey) : item.name;
                    const isActive = location.pathname.startsWith(`/workspace/${item.id}`) ||
                      (isOnDocumentPage && lastActiveTab === `workspace:${item.id}`);
                    return (
                      <li key={item.id} className={isActive ? 'active' : ''} onClick={() => navigate(`/workspace/${item.id}`)} style={{ cursor: 'pointer' }}>
                        <div className="workspace-item-content">
                          <Icon size={18} />
                          <span>{displayName}</span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            {workspaces.length > visibleWorkspacesCount ? (
              <button
                className="see-more-btn"
                onClick={() => setVisibleWorkspacesCount(prev => prev + 6)}
              >
                {t('seeMore')}
              </button>
            ) : (
              visibleWorkspacesCount > 6 && (
                <button
                  className="see-more-btn"
                  onClick={() => setVisibleWorkspacesCount(6)}
                >
                  {t('seeLess')}
                </button>
              )
            )}
          </div>



          <div className="sidebar-section-card quick-access-card">
            <div className="section-header">
              <div className="section-title-wrapper">
                <span className="section-dot" style={{ backgroundColor: '#C3924D' }}></span>
                <h3 className="section-title">{t('quickAccess')}</h3>
              </div>
            </div>
            <ul className="sidebar-menu">
              {quickAccess.filter(item => !['starred', 'shared'].includes(item.id)).map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path ||
                  (isOnDocumentPage && lastActiveTab === item.id);
                return (
                  <li
                    key={item.id}
                    className={isActive ? 'active' : ''}
                    onClick={() => {
                      if (location.pathname === item.path) {
                        navigate('/');
                      } else {
                        navigate(item.path);
                      }
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <Icon
                      size={18}
                      fill={isActive && item.id === 'starred' ? '#c3924d' : 'none'}
                    />
                    <span>{item.name}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
        <CreateWorkspaceModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </aside>
    </>
  );
};

export default Sidebar;
