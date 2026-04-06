
import React, { useState } from 'react';
import { X, Check, Save } from 'lucide-react';
import { WorkflowStep, WorkflowStepType, WorkflowActionType } from '../api/workflows';
import { useLanguage } from '../contexts/LanguageContext';

interface WorkflowStepBuilderProps {
    steps: WorkflowStep[];
    onChange: (steps: WorkflowStep[]) => void;
}

const WorkflowStepBuilder: React.FC<WorkflowStepBuilderProps> = ({ steps, onChange }) => {
    const { t } = useLanguage();
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    // Helper to add new step
    const addStep = () => {
        const newStep: WorkflowStep = {
            stepId: crypto.randomUUID(), // unique ID for frontend reference
            title: 'New Step',
            type: WorkflowStepType.Action,
            dependsOn: [],
            actionConfig: {
                actionType: WorkflowActionType.Approve,
                instructions: ''
            }
        };
        onChange([...steps, newStep]);
        setEditingIndex(steps.length);
    };

    const removeStep = (index: number) => {
        const newSteps = [...steps];
        newSteps.splice(index, 1);
        onChange(newSteps);
        if (editingIndex === index) setEditingIndex(null);
    };

    const updateStep = (index: number, field: keyof WorkflowStep | 'actionConfig', value: any) => {
        const newSteps = [...steps];
        if (field === 'actionConfig') {
            newSteps[index].actionConfig = { ...newSteps[index].actionConfig, ...value };
        } else {
            // @ts-ignore
            newSteps[index][field] = value;
        }
        onChange(newSteps);
    };

    // Handling dependencies (wait for previous steps)
    const toggleDependency = (stepIndex: number, depStepId: string) => {
        const newSteps = [...steps];
        const currentDeps = newSteps[stepIndex].dependsOn || [];
        if (currentDeps.includes(depStepId)) {
            newSteps[stepIndex].dependsOn = currentDeps.filter(id => id !== depStepId);
        } else {
            newSteps[stepIndex].dependsOn = [...currentDeps, depStepId];
        }
        onChange(newSteps);
    };

    return (
        <div className="workflow-step-builder">
            <h4>{t('steps')}</h4>

            <div className="steps-list">
                {steps.map((step, index) => (
                    <div key={step.stepId} className={`step-item ${editingIndex === index ? 'editing' : ''}`}>
                        {editingIndex === index ? (
                            <div className="step-editor">
                                <div className="form-group">
                                    <label>{t('stepTitle')}</label>
                                    <input
                                        value={step.title}
                                        onChange={(e) => updateStep(index, 'title', e.target.value)}
                                        className="form-input"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>{t('actionType')}</label>
                                    <select
                                        value={step.actionConfig?.actionType}
                                        onChange={(e) => updateStep(index, 'actionConfig', { actionType: parseInt(e.target.value) })}
                                        className="form-input"
                                    >
                                        <option value={WorkflowActionType.Approve}>{t('approveAction')}</option>
                                        <option value={WorkflowActionType.Fill}>{t('fillAction')}</option>
                                        <option value={WorkflowActionType.Review}>{t('reviewAction')}</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>{t('instructions')}</label>
                                    <textarea
                                        value={step.actionConfig?.instructions || ''}
                                        onChange={(e) => updateStep(index, 'actionConfig', { instructions: e.target.value })}
                                        className="form-input"
                                    />
                                </div>

                                {step.actionConfig?.actionType === WorkflowActionType.Fill && (
                                    <div className="form-group">
                                        <label>{t('requiredFields')}</label>
                                        <input
                                            value={step.actionConfig?.requiredFields?.join(', ') || ''}
                                            onChange={(e) => updateStep(index, 'actionConfig', { requiredFields: e.target.value.split(',').map(s => s.trim()) })}
                                            className="form-input"
                                            placeholder={t('requiredFieldsPlaceholder')}
                                        />
                                    </div>
                                )}

                                <div className="form-group">
                                    <label>{t('waitForDeps')}</label>
                                    <div className="deps-list">
                                        {steps.filter((s, i) => i !== index).map(otherStep => (
                                            <label key={otherStep.stepId} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={step.dependsOn?.includes(otherStep.stepId)}
                                                    onChange={() => toggleDependency(index, otherStep.stepId)}
                                                />
                                                {otherStep.title}
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <button className="btn-secondary btn-sm" onClick={() => setEditingIndex(null)}>
                                    <Check size={16} /> {t('done')}
                                </button>
                            </div>
                        ) : (
                            <div className="step-summary" onClick={() => setEditingIndex(index)}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <strong>{step.title}</strong>
                                    <X size={16} style={{ cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); removeStep(index); }} />
                                </div>
                                <div style={{ fontSize: '0.85em', color: 'gray' }}>
                                    {WorkflowActionType[step.actionConfig?.actionType || 0]}
                                    {step.dependsOn && step.dependsOn.length > 0 && ` • ${t('waitForDeps')} (${step.dependsOn.length})`}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <button className="btn-secondary dashed" onClick={addStep} style={{ width: '100%', marginTop: '10px' }}>
                + {t('addStep')}
            </button>

            <style>{`
        .step-item {
          border: 1px solid var(--border-color);
          border-radius: 8px;
          margin-bottom: 8px;
          background: var(--bg-surface);
        }
        .step-summary {
          padding: 12px;
          cursor: pointer;
        }
        .step-editor {
          padding: 12px;
          background: var(--bg-base);
          border-radius: 8px;
        }
        .deps-list {
           display: flex;
           flex-wrap: wrap;
           gap: 12px;
        }
        .dashed {
          border-style: dashed;
        }
      `}</style>
        </div>
    );
};

export default WorkflowStepBuilder;
