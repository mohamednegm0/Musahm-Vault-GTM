import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';
import './SearchableSelect.css';
import { useLanguage } from '../contexts/LanguageContext';

interface Option {
    id: string | number;
    name: string;
}

interface SearchableSelectProps {
    options: Option[];
    value: string | number;
    onChange: (value: string) => void;
    placeholder: string;
    error?: boolean;
    disabled?: boolean;
    className?: string;
    name?: string;
    onBlur?: () => void;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
    options,
    value,
    onChange,
    placeholder,
    error,
    disabled,
    className,
    name,
    onBlur
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const { language } = useLanguage();

    const selectedOption = options.find(opt => String(opt.id) === String(value));

    const filteredOptions = options.filter(opt =>
        opt.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                if (isOpen) {
                    setIsOpen(false);
                    onBlur?.();
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onBlur]);

    const handleToggle = () => {
        if (!disabled) {
            setIsOpen(!isOpen);
            if (!isOpen) setSearchTerm('');
        }
    };

    const handleSelect = (optionId: string | number) => {
        onChange(optionId.toString());
        setIsOpen(false);
        onBlur?.();
    };

    return (
        <div
            ref={containerRef}
            className={`searchable-select-container ${isOpen ? 'is-open' : ''} ${error ? 'has-error' : ''} ${disabled ? 'is-disabled' : ''} ${className || ''}`}
            dir={language === 'ar' ? 'rtl' : 'ltr'}
        >
            <div
                className="select-trigger"
                onClick={handleToggle}
            >
                <div className={`select-value ${!selectedOption ? 'placeholder' : ''}`}>
                    {selectedOption ? selectedOption.name : placeholder}
                </div>
                <ChevronDown size={18} className={`chevron-icon ${isOpen ? 'rotate' : ''}`} />
            </div>

            {isOpen && (
                <div className="select-dropdown">
                    <div className="search-wrapper">

                        <input
                            type="text"
                            className="search-input search-input2"
                            placeholder={language === 'ar' ? 'بحث...' : 'Search...'}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                    <div className="options-list">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option, index) => (
                                <div
                                    key={`${option.id}-${index}`}
                                    className={`option-item ${String(option.id) === String(value) ? 'selected' : ''}`}
                                    onClick={() => handleSelect(option.id)}
                                >
                                    <span className="option-label" title={option.name}>
                                        {option.name}
                                    </span>
                                    {String(option.id) === String(value) && <Check size={16} className="check-icon" />}
                                </div>
                            ))
                        ) : (
                            <div className="no-options">
                                {language === 'ar' ? 'لا توجد نتائج' : 'No results found'}
                            </div>
                        )}
                    </div>
                </div>
            )}
            <input type="hidden" name={name} value={value} />
        </div>
    );
};

export default SearchableSelect;
