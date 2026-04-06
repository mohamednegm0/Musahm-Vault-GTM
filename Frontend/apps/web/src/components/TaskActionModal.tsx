
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { X, Check, Eye } from 'lucide-react';
import { completeTask, TaskEntity } from '../api/tasks';
import { getWorkflowInstanceById } from '../api/workflowInstances';
import { useToast } from '../contexts/ToastContext';

interface TaskActionModalProps {
    task: TaskEntity;
    onClose: () => void;
    onComplete: () => void;
}

const TaskActionModal: React.FC<TaskActionModalProps> = ({ task, onClose, onComplete }) => {
    const { t, language } = useLanguage();
    const { error: toastError } = useToast();
    const [loading, setLoading] = useState(false);
    const [fetchedDocumentId, setFetchedDocumentId] = useState<string | undefined>(undefined);
    // For "Fill" actions
    const [formData, setFormData] = useState<Record<string, string>>({});
    // For "Approve/Reject" comment
    const [comment, setComment] = useState('');

    const cleanDescriptionText = (text?: string) => {
        if (!text) return null;
        // Strip out the "Link: http..." part completely
        // Matches "Link: " followed by any URL until the end of line or space
        const cleanedText = text.replace(/Link:\s*https?:\/\/[^\s]+/gi, '').trim();
        return <>{cleanedText}</>;
    };

    const status = task.status?.toLowerCase();
    const isTaskProcessed = status === 'completed' || status === 'approved' || status === 'rejected' || status === 'terminated';

    const actionType = task.actionConfig?.actionType || 0;

    useEffect(() => {
        const fetchDoc = async () => {
             // If no targetDocumentId, try to fetch from Workflow Instance related entity
            if (!task.targetDocumentId && task.relatedEntity?.type === 'WorkflowInstance' && task.relatedEntity.id) {
                try {
                    const instance = await getWorkflowInstanceById(task.relatedEntity.id);
                    const fetchedId = instance.documentId || instance.context?.target_id;
                    if (fetchedId) {
                        setFetchedDocumentId(fetchedId);
                    }
                } catch (e) {
                    console.error('Failed to fetch related workflow instance', e);
                }
            }
        };
        fetchDoc();
    }, [task]);

    const docId = task.targetDocumentId || (task.relatedEntity?.type === 'Document' || task.relatedItemType === 'Document' ? task.relatedEntity?.id : fetchedDocumentId);
    const isWorkspace = task.relatedItemType === 'Workspace' || task.relatedEntity?.type === 'Workspace';

    const handleSubmit = async (outcome: string) => {
        if (!task.id) return;
        try {
            setLoading(true);

            // Validate "Fill" required fields
            if (actionType === 2 && task.actionConfig?.requiredFields) {
                const missing = task.actionConfig.requiredFields.filter(f => !formData[f]);
                if (missing.length > 0) {
                    toastError(`${t('fillRequiredFields')}: ${missing.join(', ')}`);
                    setLoading(false);
                    return;
                }
            }

            await completeTask(task.id, outcome, {
                comment,
                ...formData
            });

            onComplete();
            onClose();
        } catch (error) {
            console.error('Error completing task:', error);
            toastError(t('error') || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2>{task.title}</h2>
                {task.description && (
                    <p className="task-description" style={{ whiteSpace: 'pre-wrap', marginBottom: '15px' }}>
                        {cleanDescriptionText(task.description)}
                    </p>
                )}
                {task.actionConfig?.instructions && task.actionConfig.instructions !== task.description && (
                    <p className="task-instructions" style={{ whiteSpace: 'pre-wrap' }}>
                        {cleanDescriptionText(task.actionConfig.instructions)}
                    </p>
                )}

                {docId && (
                    <div style={{ marginBottom: '15px' }}>
                        <button 
                            className="btn-secondary" 
                            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                            onClick={() => window.open(isWorkspace ? `/workspace/${docId}` : `/document/${docId}`, '_blank')}
                        >
                            <Eye size={16} /> 
                            {isWorkspace ? (t('viewWorkspace') || 'View Workspace') : (t('viewDocument') || 'View Document')}
                        </button>
                    </div>
                )}

                {/* Approve/Reject UI */}
                {actionType === 1 && (
                    <div className="action-section">
                        <textarea
                            placeholder={t('addComment')}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="form-input"
                            rows={3}
                        />
                    </div>
                )}

                {/* Fill Data UI */}
                {actionType === 2 && (
                    <div className="action-section">
                        {task.actionConfig?.requiredFields?.map(field => (
                            <div key={field} className="form-group">
                                <label>{field} *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData[field] || ''}
                                    onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                                />
                            </div>
                        ))}
                    </div>
                )}

                {/* Review UI */}
                {actionType === 4 && (
                    <div className="action-section">
                        <p>{t('taskInstructions')}</p>
                        <textarea
                            placeholder={t('reviewNotes')}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="form-input"
                            rows={3}
                        />
                    </div>
                )}

                <div className="modal-buttons" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button onClick={onClose} className="btn-secondary">
                        {t('close') || t('cancel')}
                    </button>
                    
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {isTaskProcessed ? (
                            <span style={{ 
                                padding: '8px 16px', 
                                background: '#f1f5f9', 
                                borderRadius: '6px', 
                                color: '#64748b', 
                                fontSize: '14px', 
                                fontWeight: '600' 
                            }}>
                                {t('taskAlreadyProcessed') || (language === 'ar' ? 'تمت معالجة هذه المهمة بالفعل' : 'Task already processed')}
                            </span>
                        ) : (
                            <>
                                {actionType === 1 && (
                                    <>
                                        <button disabled={loading} onClick={() => handleSubmit('Rejected')} className="btn-danger">
                                            <X size={16} /> {t('reject')}
                                        </button>
                                        <button disabled={loading} onClick={() => handleSubmit('Approved')} className="btn-success">
                                            <Check size={16} /> {t('approve')}
                                        </button>
                                    </>
                                )}

                                {actionType === 2 && (
                                    <button disabled={loading} onClick={() => handleSubmit('Completed')} className="btn-primary">
                                        <Check size={16} /> {t('submitData')}
                                    </button>
                                )}

                                {actionType === 4 && (
                                    <button disabled={loading} onClick={() => handleSubmit('Reviewed')} className="btn-primary">
                                        <Eye size={16} /> {t('markAsReviewed')}
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
            <style>{`
         .task-instructions {
            background: var(--bg-surface);
            padding: 10px;
            border-radius: 4px;
            border-left: 3px solid var(--primary-color);
            margin-bottom: 15px;
         }
         .btn-success {
            background-color: #28a745;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 6px;
         }
       `}</style>
        </div>
    );
};

export default TaskActionModal;
