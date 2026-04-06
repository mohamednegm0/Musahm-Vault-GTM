import React, { useEffect, useState, useRef } from 'react';
import { WorkflowTrigger, WorkflowTriggerType, getTriggerDefinitions, WorkflowTriggerDefinition } from '../api/workflows';
import { useLanguage } from '../contexts/LanguageContext';
import { ChevronDown, Check } from 'lucide-react';

interface WorkflowTriggerBuilderProps {
    triggers: WorkflowTrigger[];
    onChange: (triggers: WorkflowTrigger[]) => void;
    singleSelect?: boolean;
}

const WorkflowTriggerBuilder: React.FC<WorkflowTriggerBuilderProps> = ({ triggers, onChange, singleSelect }) => {
    const { t, language } = useLanguage();
    const [definitions, setDefinitions] = useState<WorkflowTriggerDefinition[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        getTriggerDefinitions().then(setDefinitions);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleTrigger = (def: WorkflowTriggerDefinition) => {
        // Simple heuristic for type, though backend should ideally handle it by Code.
        // Defaulting to FolderEvent (1) as it covers most "something happened in container" cases.
        // If code mentions 'Document' or 'File' or 'Upload', maybe Document (5).
        let type = WorkflowTriggerType.FolderEvent;
        const lowerCode = def.code.toLowerCase();
        if (lowerCode.includes('document') || lowerCode.includes('file') || lowerCode.includes('upload')) {
             type = WorkflowTriggerType.Document;
        }

        const newTrigger = {
            type: type,
            triggerCode: def.code,
            value: '',
            groupId: undefined // Explicitly undefined for edge triggers
        };

        if (singleSelect) {
             const isSelected = triggers.some(t => t.triggerCode === def.code);
             if (isSelected) {
                 onChange([]);
             } else {
                 onChange([newTrigger]);
                 setIsOpen(false); 
             }
        } else {
            const exists = triggers.some(t => t.triggerCode === def.code);
            let newTriggers;
            if (exists) {
                newTriggers = triggers.filter(t => t.triggerCode !== def.code);
            } else {
                newTriggers = [...triggers, newTrigger];
            }
            onChange(newTriggers);
        }
    };

    const selectedCount = triggers.length;
    const selectedNames = triggers.map(trig => {
        const def = definitions.find(d => d.code === trig.triggerCode);
        return def ? (language === 'ar' ? (def.displayNameAr || def.name) : (def.displayNameEn || def.name)) : trig.triggerCode;
    }).join(', ');

    return (
        <div className="workflow-trigger-builder" style={{ marginBottom: '20px' }} ref={dropdownRef}>
            <h4>{t('triggers')}</h4>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '8px' }}>
                {t('triggerDescription')}
            </p>

            <div style={{ position: 'relative' }}>
                <div 
                    onClick={() => setIsOpen(!isOpen)}
                    style={{
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        padding: '8px 12px',
                        background: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '14px',
                        minHeight: '38px',
                        color: selectedCount > 0 ? '#1e293b' : '#94a3b8'
                    }}
                >
                    {selectedCount > 0 ? (
                        <span style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginRight: 8}}>
                            {selectedNames}
                        </span>
                    ) : (
                        <span>{t('selectTrigger')}</span>
                    )}
                    <ChevronDown size={16} />
                </div>

                {isOpen && (
                    <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        zIndex: 1000,
                        background: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        marginTop: '4px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        maxHeight: '200px',
                        overflowY: 'auto'
                    }}>
                        {definitions.map((def) => {
                            const isSelected = triggers.some(t => t.triggerCode === def.code);
                            return (
                                <div 
                                    key={def.code}
                                    onClick={() => toggleTrigger(def)}
                                    style={{
                                        padding: '8px 12px',
                                        fontSize: '14px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        background: isSelected ? '#f1f5f9' : 'transparent',
                                        color: isSelected ? '#0f172a' : '#64748b'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = isSelected ? '#e2e8f0' : '#f8fafc'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = isSelected ? '#f1f5f9' : 'transparent'}
                                >
                                    <div style={{
                                        width: '16px',
                                        height: '16px',
                                        border: `1px solid ${isSelected ? '#3b82f6' : '#cbd5e1'}`,
                                        borderRadius: '4px',
                                        background: isSelected ? '#3b82f6' : 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0
                                    }}>
                                        {isSelected && <Check size={12} color="white" />}
                                    </div>
                                    <span>
                                        {language === 'ar' ? (def.displayNameAr || def.name) : (def.displayNameEn || def.name)}
                                    </span>
                                </div>
                            );
                        })}
                        {definitions.length === 0 && (
                            <div style={{ padding: '8px 12px', color: '#94a3b8', fontSize: '13px', textAlign: 'center' }}>
                                {t('noTriggersAvailable')}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WorkflowTriggerBuilder;
