import React from 'react';
import DocumentCard, { Document } from './DocumentCard';
import EmptyState from './EmptyState';
import Pagination from './Pagination';
import { useLanguage } from '../contexts/LanguageContext';
import { FileText } from 'lucide-react';
import './DocumentsLayout.css';

export interface DocumentsGridProps {
  documents: Document[];
  viewMode: 'grid' | 'table';
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  onEdit?: (document: Document) => void;
}

const DocumentsGrid: React.FC<DocumentsGridProps> = ({
  documents,
  viewMode,
  emptyMessage,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  onEdit,
}) => {
  const { t } = useLanguage();
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = viewMode === 'grid' ? 12 : 10;

  React.useEffect(() => {
    setCurrentPage(1);
  }, [documents]);

  if (documents.length === 0) {
    return (
      <EmptyState
        title={emptyTitle || t('noDocumentsFound')}
        description={emptyDescription || emptyMessage || ''}
        icon={emptyIcon || <FileText size={48} style={{ opacity: 0.2 }} />}
      />
    );
  }

  const totalPages = Math.ceil(documents.length / itemsPerPage);
  const paginatedDocuments = documents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      <div className={`documents-grid ${viewMode === 'table' ? 'table-view' : 'grid-view'}`}>
        {paginatedDocuments.map((doc) => (
          <DocumentCard key={doc.id} document={doc} onEdit={onEdit} />
        ))}
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={documents.length}
        itemsPerPage={itemsPerPage}
      />
    </>
  );
};

export default DocumentsGrid;
