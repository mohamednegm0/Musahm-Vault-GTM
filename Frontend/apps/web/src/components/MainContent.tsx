import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { getDocuments, Document } from '../api/documents';
import { getWorkspaces, WorkspaceChild, Workspace } from '../api/workspaces';
import { setDocumentQuickAccess } from '../services/quickAccessService';
import { useToast } from '../contexts/ToastContext';
import ExplorerLayout from './ExplorerLayout';

const MainContent: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [documents, setDocuments] = useState<Document[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [docsData, workspacesData] = await Promise.all([
          getDocuments(),
          getWorkspaces()
        ]);
        setDocuments(docsData || []);
        setWorkspaces(workspacesData || []);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [t]);

  // Map workspaces to folders with dynamic counts
  const folders: WorkspaceChild[] = workspaces.filter(ws => !ws.parentId).map(ws => ({
    id: ws.id || '',
    name: ws.name || t('untitled'),
    type: 'workspace',
    isDir: true,
    parentId: ws.parentId,
    documentCount: ws.documentCount ?? 0,
    childCount: ws.childCount ?? 0
  }));

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const toggleDocStar = async (id: string, currentState: boolean) => {
    try {
      const newState = !currentState;
      await setDocumentQuickAccess(id, newState);
      setDocuments(prev => prev.map(d => d.id === id ? { ...d, isQuickAccess: newState } : d));
      success(newState ? t('addedToFavorites') : t('removedFromFavorites'));
    } catch (err) {
      error(t('errorUpdatingFavorites'));
    }
  };

  const breadcrumbs = [
    { label: t('dashboard') || 'Dashboard', onClick: () => navigate('/dashboard') },
    { label: t('allDocuments') || 'All Documents' }
  ];

  return (
    <ExplorerLayout
      title={t('allDocuments') || 'All Documents'}
      documents={documents}
      folders={folders}
      breadcrumbs={breadcrumbs}
      isLoading={loading}
      onFolderClick={(id) => navigate(`/workspace/${id}`)}
      onNavigate={handleNavigate}
      onDocStarToggle={toggleDocStar}
      emptyMessage={t('noDocuments') || 'No documents found'}
    />
  );
};

export default MainContent;

