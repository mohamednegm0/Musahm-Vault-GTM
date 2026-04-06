import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Document, getDocuments } from '../api/documents';
import { getWorkspaces, WorkspaceChild, Workspace } from '../api/workspaces';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import { setDocumentQuickAccess } from '../services/quickAccessService';
import ExplorerLayout from '../components/ExplorerLayout';
import LoadingState from '../components/LoadingState';

const Starred: React.FC = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [documents, setDocuments] = useState<Document[]>([]);
  const [folders, setFolders] = useState<WorkspaceChild[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [allDocs, allWorkspaces] = await Promise.all([
        getDocuments(),
        getWorkspaces()
      ]);

      // Filter starred workspaces
      const starredWorkspaces = (allWorkspaces || []).filter(ws => ws.isQuickAccess);

      // Helper for recursive counts
      const getAllDescendantIds = (pId: string, allWs: Workspace[]): string[] => {
        let ids: string[] = [pId];
        const subFolders = allWs.filter(w => w.parentId === pId || (w as any).parent_id === pId);
        subFolders.forEach(sf => {
          if (sf.id) ids = [...ids, ...getAllDescendantIds(sf.id, allWs)];
        });
        return ids;
      };

      // Map to folders for ExplorerLayout
      const mappedFolders: WorkspaceChild[] = starredWorkspaces.map(ws => {
        const descendantIds = ws.id ? getAllDescendantIds(ws.id, allWorkspaces) : [];
        return {
          id: ws.id || '',
          name: ws.name || t('untitled'),
          isDir: true,
          type: 'workspace',
          documentCount: (allDocs || []).filter(doc => {
            const dWsId = doc.workspace_id || (doc as any).workspaceId;
            const dPId = doc.parent_id || (doc as any).parentId;
            return (dWsId && descendantIds.includes(dWsId)) || (dPId && descendantIds.includes(dPId));
          }).length,
          childCount: descendantIds.length - 1
        };
      });

      // Filter starred documents
      const starredDocs = (allDocs || []).filter(doc => doc.isQuickAccess);

      setFolders(mappedFolders);
      setDocuments(starredDocs);
    } catch (err) {
      console.error('Failed to fetch starred items:', err);
      error(t('errorLoadingStarred') || 'Failed to load starred items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [t]);

  const toggleDocStar = async (docId: string, currentState: boolean) => {
    try {
      const newState = !currentState;
      await setDocumentQuickAccess(docId, newState);

      // Since we are on Starred page, if it's unstarred, remove it from the list
      if (!newState) {
        setDocuments(prev => prev.filter(d => d.id !== docId));
        success(t('removedFromFavorites'));
      } else {
        // Technically this shouldn't happen on this page as everything is already starred
        success(t('addedToFavorites'));
      }
    } catch (err) {
      console.error("Failed to toggle document favorites", err);
      error(t('errorUpdatingFavorites'));
    }
  };

  const breadcrumbs = [
    { label: t('home'), onClick: () => navigate('/') },
    { label: t('starred') }
  ];

  if (loading && folders.length === 0 && documents.length === 0) {
    return <LoadingState fullPage />;
  }

  return (
    <div className={`starred-view ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      <ExplorerLayout
        title={t('starred')}
        documents={documents}
        folders={folders}
        breadcrumbs={breadcrumbs}
        isLoading={loading}
        onFolderClick={(id) => navigate(`/workspace/${id}`)}
        onDocStarToggle={toggleDocStar}
        emptyMessage={t('noDocumentsFound')}
        showBackCallback={() => navigate('/')}
      />
    </div>
  );
};

export default Starred;
