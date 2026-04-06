import React, { useState, useEffect } from 'react';
import { Search, MessageCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { keywordSearch, semanticSearch, askVault } from '../api/search';
import { useLanguage } from '../contexts/LanguageContext';
import DocumentsLayout from '../components/DocumentsLayout';
import Breadcrumb from '../components/Breadcrumb';
import '../styles/Search.css';

interface SearchResult {
  id: string;
  title: string;
  content?: string;
  documentType?: string;
  score?: number;
  source?: string;
}

const SearchVault: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchType, setSearchType] = useState<'keyword' | 'semantic' | 'ask'>('keyword');
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  // Pre-fill from ?q= URL param (e.g. coming from Dashboard search bar)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    if (q) {
      setQuery(q);
    }
  }, [location.search]);

  const breadcrumbs = [
    { label: t('dashboard') || 'Dashboard', onClick: () => navigate('/dashboard') },
    { label: t('searchVault') || 'Search Vault' }
  ];

  const handleSearch = async () => {
    if (!query.trim()) return;

    try {
      setLoading(true);
      setResults([]);
      setAnswer('');

      if (searchType === 'keyword') {
        const response = await keywordSearch(query);
        setResults(response.results);
      } else if (searchType === 'semantic') {
        const response = await semanticSearch(query);
        setResults(response.results);
      } else if (searchType === 'ask') {
        const response = await askVault(query);
        setAnswer(response.answer);
        setResults(response.sources || []);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const filters = [
    t('keywordSearch') || 'Keyword Search',
    t('semanticSearch') || 'Semantic Search',
    t('askVault') || 'Ask Vault'
  ];

  const handleFilterChange = (filter: string) => {
    if (filter === (t('keywordSearch') || 'Keyword Search')) setSearchType('keyword');
    else if (filter === (t('semanticSearch') || 'Semantic Search')) setSearchType('semantic');
    else if (filter === (t('askVault') || 'Ask Vault')) setSearchType('ask');
  };

  const currentFilter = 
    searchType === 'keyword' ? (t('keywordSearch') || 'Keyword Search') :
    searchType === 'semantic' ? (t('semanticSearch') || 'Semantic Search') :
    (t('askVault') || 'Ask Vault');

  const customContent = (
    <div>
      <div className="search-controls" style={{ marginBottom: '2rem' }}>
        <div className="search-input-group">
          <Search size={20} />
          <input
            type="text"
            placeholder={searchType === 'ask' ? t('askQuestionPlaceholder') || 'Ask a question...' : t('searchDocumentsPlaceholder') || 'Search documents...'}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyPress}
            className="search-input"
          />
          <button onClick={handleSearch} className="btn-primary" disabled={loading}>
            {loading ? t('searching') || 'Searching...' : t('search') || 'Search'}
          </button>
        </div>
      </div>

      <div className="search-results">
        {loading && <div className="loading" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>{t('searching') || 'Searching...'}</div>}

        {answer && (
          <div className="answer-box">
            <h3>
                <MessageCircle size={20} color="var(--brand-gold)" style={{ display: 'inline', marginRight: '8px' }} />
                {t('answer') || 'Answer'}
            </h3>
            <p>{answer}</p>
            {results.length > 0 && <p className="sources-label">{t('sources') || 'Sources'} ({results.length})</p>}
          </div>
        )}

        {results.length > 0 && (
          <div className="results-container">
            {!answer && <h3>{t('results') || 'Results'} ({results.length})</h3>}
            <div className="results-list">
              {results.map(result => (
                <div key={result.id} className="result-item">
                  <div className="result-header">
                    <h4>{result.title}</h4>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                         {result.documentType && <span className="doc-type">{result.documentType}</span>}
                         {result.score && <span className="score">{t('match') || 'Match'}: {(result.score * 100).toFixed(0)}%</span>}
                    </div>
                  </div>
                  {result.content && <p className="result-content">{result.content}</p>}
                  {result.source && <span className="source">{t('source') || 'Source'}: {result.source}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && query && results.length === 0 && !answer && (
          <div className="no-results">
            <Search size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
            <p>{t('noResultsFound') || 'No results found for'} "{query}"</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <DocumentsLayout
      title={t('searchVault') || 'Search Vault'}
      subtitle={t('searchVaultDesc') || 'Find documents, extract information, and ask questions'}
      headerIcon={Search}
      headerIconColor="var(--brand-gold)"
      breadcrumb={<Breadcrumb items={breadcrumbs} />}
      showFilterBar={true}
      filters={filters}
      defaultFilter={currentFilter}
      onFilterChange={handleFilterChange}
      documents={[]}
      customContent={customContent}
      hideDocuments={true}
    />
  );
};

export default SearchVault;
