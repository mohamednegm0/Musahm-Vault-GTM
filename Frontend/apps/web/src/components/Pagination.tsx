import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import './Pagination.css';

export interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems?: number;
    itemsPerPage?: number;
}

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    totalItems,
    itemsPerPage
}) => {
    const { t } = useLanguage();

    if (totalPages <= 1) return null;

    const renderPageNumbers = () => {
        const pages = [];

        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(renderPageButton(i));
            }
        } else {
            // Always show first page
            pages.push(renderPageButton(1));

            if (currentPage > 4) {
                pages.push(<span key="ellipsis-start" className="pagination-ellipsis">...</span>);
            }

            // Show pages around current page
            const start = Math.max(2, currentPage - 2);
            const end = Math.min(totalPages - 1, currentPage + 2);

            for (let i = start; i <= end; i++) {
                if (i === 1 || i === totalPages) continue;
                pages.push(renderPageButton(i));
            }

            if (currentPage < totalPages - 3) {
                pages.push(<span key="ellipsis-end" className="pagination-ellipsis">...</span>);
            }

            // Always show last page
            pages.push(renderPageButton(totalPages));
        }

        return pages;
    };

    const renderPageButton = (page: number) => (
        <button
            key={page}
            className={`pagination-number ${currentPage === page ? 'active' : ''}`}
            onClick={() => onPageChange(page)}
        >
            {page}
        </button>
    );

    return (
        <div className="pagination-container">
            {totalItems !== undefined && itemsPerPage !== undefined && (
                <div className="pagination-info">
                    {t('paginationShowing')} {(currentPage - 1) * itemsPerPage + 1} {t('paginationTo')} {Math.min(currentPage * itemsPerPage, totalItems)} {t('paginationOf')} {totalItems}
                </div>
            )}
            <div className="pagination-controls">
                <button
                    className="pagination-btn"
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}
                    data-tooltip-content={t('firstPage')}
                >
                    <ChevronsLeft size={18} />
                </button>
                <button
                    className="pagination-btn"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    data-tooltip-content={t('previousPage')}
                >
                    <ChevronLeft size={18} />
                </button>

                <div className="pagination-numbers">
                    {renderPageNumbers()}
                </div>

                <button
                    className="pagination-btn"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    data-tooltip-content={t('nextPage')}
                >
                    <ChevronRight size={18} />
                </button>
                <button
                    className="pagination-btn"
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    data-tooltip-content={t('lastPage')}
                >
                    <ChevronsRight size={18} />
                </button>
            </div>
        </div>
    );
};

export default Pagination;
