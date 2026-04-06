import { Grid3x3, Table2 } from 'lucide-react';
import './DocumentsLayout.css';
import Tooltip from './Tooltip';
import { useLanguage } from '../contexts/LanguageContext';

export interface FilterBarProps {
  filters: string[];
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  activeFilter,
  onFilterChange,
  viewMode,
  onViewModeChange,
}) => {
  const { t } = useLanguage();
  return (
    <div className="filter-bar">
      <div className="filter-tabs">
        {filters.map((filter) => (
          <button
            key={filter}
            className={`filter-tab ${filter === activeFilter ? 'active' : ''}`}
            onClick={() => onFilterChange(filter)}
          >
            {filter}
          </button>
        ))}
      </div>
      <div className="sort-section">
        <div className="view-mode-buttons">
          <Tooltip content={t('gridView')} position="top">
            <button
              className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => onViewModeChange('grid')}
            >
              <Grid3x3 size={18} />
            </button>
          </Tooltip>
          <Tooltip content={t('tableView')} position="top">
            <button
              className={`view-mode-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => onViewModeChange('table')}
            >
              <Table2 size={18} />
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
