import React, { useState, ReactNode } from 'react';
import FilterBar, { FilterBarProps } from './FilterBar';
import PageHeader, { PageHeaderProps } from './PageHeader';
import DocumentsGrid, { DocumentsGridProps } from './DocumentsGrid';
import DocumentCard, { Document } from './DocumentCard';
import EmptyState from './EmptyState';
import { FileText } from 'lucide-react';
import './DocumentsLayout.css';
import { useLanguage } from '../contexts/LanguageContext';

export interface DocumentsLayoutProps {
  // Header props
  title?: string;
  headerIcon?: PageHeaderProps['icon'];
  headerIconColor?: string;
  subtitle?: ReactNode;
  breadcrumb?: ReactNode;
  actions?: ReactNode;
  sectionTitle?: string; // Custom section title instead of "All Documents"

  // Filter bar props
  filters?: FilterBarProps['filters'];
  defaultFilter?: string;
  onFilterChange?: (filter: string) => void;

  // Documents grid props
  documents: DocumentsGridProps['documents'];
  emptyMessage?: string;
  emptyIcon?: ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;

  // Layout options
  showFilterBar?: boolean;
  showHeader?: boolean;
  customHeader?: ReactNode;
  customContent?: ReactNode;

  // Status filter mapping (for filtering documents by status)
  statusMapping?: { [key: string]: string };

  // Additional sections (for home view)
  additionalSections?: Array<{
    title: string;
    documents: DocumentsGridProps['documents'];
    className?: string;
  }>;

  // Alert banner (for home view)
  alertBanner?: ReactNode;

  // Top content (e.g. folders table)
  topContent?: ReactNode;

  // Edit action
  // Edit action
  onEdit?: (document: Document) => void;
  // Hide documents grid and header
  hideDocuments?: boolean;
  
  // External control over view mode (for custom content rendering)
  viewMode?: 'grid' | 'table';
  onViewModeChange?: (mode: 'grid' | 'table') => void;
}

const DocumentsLayout: React.FC<DocumentsLayoutProps> = ({
  title,
  headerIcon: HeaderIcon,
  headerIconColor,
  subtitle,
  breadcrumb,
  actions,
  filters = [],
  defaultFilter,
  onFilterChange,
  documents,
  emptyMessage,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  showFilterBar = true,
  showHeader = true,
  customHeader,
  customContent,
  topContent,
  statusMapping = {},
  additionalSections = [],
  alertBanner,
  onEdit,
  hideDocuments = false,
  sectionTitle,
  viewMode: controlledViewMode,
  onViewModeChange: controlledOnViewModeChange,
}) => {
  const [internalViewMode, setInternalViewMode] = useState<'grid' | 'table'>('grid');
  const viewMode = controlledViewMode !== undefined ? controlledViewMode : internalViewMode;
  
  const handleViewModeChange = (mode: 'grid' | 'table') => {
      setInternalViewMode(mode);
      if (controlledOnViewModeChange) {
          controlledOnViewModeChange(mode);
      }
  };

  const [activeFilter, setActiveFilter] = useState<string>(defaultFilter || (filters.length > 0 ? filters[0] : ''));
  const { t } = useLanguage();

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    if (onFilterChange) {
      onFilterChange(filter);
    }
  };

  // Filter documents based on active filter
  const filterDocuments = (docs: typeof documents) => {
    if (!activeFilter || activeFilter === filters[0] || !statusMapping[activeFilter]) {
      return docs;
    }
    const statusToFilter = statusMapping[activeFilter];
    return docs.filter(doc => doc.status === statusToFilter);
  };

  const filteredDocuments = filterDocuments(documents);
  const filteredAdditionalSections = additionalSections.map(section => ({
    ...section,
    documents: filterDocuments(section.documents),
  }));

  return (
    <div className="documents-layout">
      {/* 1. Breadcrumb Row (At Top of Page) */}
      {breadcrumb && <div className="breadcrumb-wrapper">{breadcrumb}</div>}

      {/* 2. Header Row (Standardized with Actions) */}
      {showHeader && (
        <div className="layout-header">
          <div className="header-left">
            {HeaderIcon && (
              <div className="header-icon-wrapper" style={{ color: headerIconColor || 'var(--brand-gold)' }}>
                <HeaderIcon size={32} />
              </div>
            )}
            <div className="header-title-section">
              <h1>{title}</h1>
              {subtitle && <p className="header-subtitle">{subtitle}</p>}
            </div>
          </div>
          {actions && <div className="header-actions">{actions}</div>}
        </div>
      )}

      {/* 3. Main Content Container (Contained Look) */}
      <div className="page-container">
        {/* Custom Header in Card if provided */}
        {customHeader}

        {/* Filter Bar Inside Card */}
        {showFilterBar && (filters.length > 0 || controlledOnViewModeChange !== undefined) && (
          <FilterBar
            filters={filters}
            activeFilter={activeFilter}
            onFilterChange={handleFilterChange}
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
          />
        )}

        {/* Alert Banner */}
        {alertBanner}

        {/* Top Content (e.g. Folders) */}
        {topContent}

        {customContent ? (
          customContent
        ) : (
          !hideDocuments && (
            <>
              <h5>{sectionTitle || t('allDocuments')} ({filteredDocuments.length}) </h5>
              {additionalSections.length > 0 ? (
                // Multiple sections (home view)
                <div className="sections-wrapper">
                  {filteredAdditionalSections.map((section, index) => (
                    <section key={index} className={`documents-section ${section.className || ''}`}>
                      <h2 className="section-title">{section.title}</h2>
                      <div className={`documents-grid ${viewMode === 'table' ? 'table-view' : 'grid-view'} ${section.className || ''}`}>
                        {section.documents.length > 0 ? (
                          section.documents.map((doc) => (
                            <DocumentCard key={doc.id} document={doc} onEdit={onEdit} />
                          ))
                        ) : (
                          <EmptyState
                            title={t('noDocumentsFound')}
                            icon={<FileText size={40} style={{ opacity: 0.2 }} />}
                          />
                        )}
                      </div>
                    </section>
                  ))}
                </div>
              ) : (
                // Single documents grid
                <section className="documents-section">
                  <DocumentsGrid
                    documents={filteredDocuments}
                    viewMode={viewMode}
                    emptyMessage={emptyMessage}
                    emptyIcon={emptyIcon}
                    emptyTitle={emptyTitle}
                    emptyDescription={emptyDescription}
                    onEdit={onEdit}
                  />
                </section>
              )}
            </>
          )
        )}
      </div>
    </div>
  );
};

export default DocumentsLayout;
