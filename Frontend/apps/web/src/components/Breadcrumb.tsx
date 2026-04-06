
import React from 'react';
import { ChevronRight } from 'lucide-react';
import './Breadcrumb.css';

/** One breadcrumb segment */
export interface BreadcrumbItem {
    /** Text that will be shown */
    label: string;
    /** Optional click handler – if omitted the item is not clickable */
    onClick?: () => void;
}

/** Props for the Breadcrumb component */
export interface BreadcrumbProps {
    /** Ordered list of breadcrumb items */
    items: BreadcrumbItem[];
}

import { useLanguage } from '../contexts/LanguageContext';

/**
 * Reusable Breadcrumb component.
 *
 * - Renders each `item.label` separated by `separator`.
 * - All items except the last one are rendered as `<button>` so they are clickable.
 * - The last item is rendered as plain text (`<span>`) and is not clickable.
 * - Accessible: the container uses `nav` with `aria-label="Breadcrumb"`.
 */
const Breadcrumb: React.FC<BreadcrumbProps> = ({
    items,
}) => {
    const { t } = useLanguage();

    return (
        <nav className="breadcrumb" aria-label={t('breadcrumb')}>
            <ol className="breadcrumb-list">
                {items.map((item, idx) => {
                    const isLast = idx === items.length - 1;
                    const clickable = !isLast && typeof item.onClick === 'function';

                    return (
                        <li key={idx} className="breadcrumb-item">
                            {clickable ? (
                                <button
                                    type="button"
                                    className="breadcrumb-link"
                                    onClick={item.onClick}
                                >
                                    {item.label}
                                </button>
                            ) : (
                                <span className="breadcrumb-current">{item.label}</span>
                            )}
                            {/* Render the separator only between items */}
                            {!isLast && (
                                <span className="breadcrumb-separator" aria-hidden="true">
                                    <ChevronRight size={14} />
                                </span>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};

export default Breadcrumb;
