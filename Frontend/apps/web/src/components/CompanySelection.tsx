import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { PartnerCompany } from '../services/authService';

interface CompanySelectionProps {
    companies: PartnerCompany[];
    onSelect: (companyId: number) => void | Promise<void>;
    onBack: () => void;
    isSubmitting: boolean;
}

const CompanySelection: React.FC<CompanySelectionProps> = ({
    companies,
    onSelect,
    onBack,
    isSubmitting,
}) => {
    const { t } = useLanguage();
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const filteredCompanies = companies.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.companyTypeName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);
    const currentCompanies = filteredCompanies.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="company-selection full-width">
            <div className="selection-header-row">
                <button
                    className="back-icon-btn"
                    onClick={onBack}
                    disabled={isSubmitting}
                    data-tooltip-content={t('back')}
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="selection-title-group">
                    <h1>{t('selectCompany')}</h1>
                    <p>{t('selectCompanySubtitle')}</p>
                </div>
            </div>

            <div className="selection-controls">
                <div className="search-bar">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder={t('searchCompanyPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>
            </div>

            <div className="companies-grid">
                {currentCompanies.map((company) => (
                    <div
                        key={company.id}
                        className={`company-card `}
                        onClick={() => {
                            if (!isSubmitting) {
                                onSelect(company.id);
                            }
                        }}
                    >
                        <div className="company-card-logo">
                            {company.logo ? (
                                <img
                                    src={company.logo.startsWith('data:') ? company.logo : `data:image/png;base64,${company.logo}`}
                                    alt={company.name}
                                />
                            ) : (
                                <div className="logo-placeholder">
                                    {company.name.charAt(0)}
                                </div>
                            )}
                        </div>
                        <div className="company-card-body">
                            <h3 className="company-card-name">{company.name}</h3>
                            <span className="company-card-type">{company.companyTypeName}</span>
                        </div>
                        <div className="company-card-footer">
                            <button
                                className="select-company-btn"
                                style={{ cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (t('loading') || 'Loading...') : t('select')}
                            </button>
                        </div>
                    </div>
                ))}
                {filteredCompanies.length === 0 && (
                    <div className="no-results">
                        <p>{t('noItemsFound')}</p>
                    </div>
                )}
            </div>

            {totalPages > 1 && (
                <div className="pagination">
                    <button

                        onClick={() => setCurrentPage(p => p - 1)}
                        className="pagination-btn"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <span className="pagination-info">
                        {currentPage} / {totalPages}
                    </span>
                    <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(p => p + 1)}
                        className="pagination-btn"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default CompanySelection;
