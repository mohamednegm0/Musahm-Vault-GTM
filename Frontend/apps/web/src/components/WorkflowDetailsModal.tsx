import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { X, FileText, Folder, Activity, CheckCircle, ExternalLink } from 'lucide-react';
import { getInstancesByWorkflow } from '../api/workflowInstances';
import { getAssignmentsByWorkflow } from '../api/workflowAssignments';
import Tooltip from './Tooltip';

interface WorkflowDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    workflowId: string;
    workflowName: string;
    type: 'running' | 'completed' | 'docs' | 'folders';
}

const WorkflowDetailsModal: React.FC<WorkflowDetailsModalProps> = ({ isOpen, onClose, workflowId, workflowName, type }) => {
    const { t, language } = useLanguage();
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && workflowId) {
            fetchData();
        }
    }, [isOpen, workflowId, type]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (type === 'running' || type === 'completed') {
                const instances = await getInstancesByWorkflow(workflowId);
                // Filter locally by status
                // Backend Status: 1=Draft, 2=Active, 3=Completed, 4=Failed, 5=Terminated
                // Or string based? WorkflowInstance interface says 'status' is string or enum. 
                // Let's check api/workflowInstances.ts interface. It says status: 'Draft' | 'InProgress' | 'Completed' | 'Failed'.
                // In Backend WorkflowStatus enum: Draft=1, Active=2, Completed=3, Failed=4, Terminated=5.
                // The API returns the entity, which usually serializes enums as integers unless configured otherwise.
                // However, previous code used string comparison. Let's assume the API returns what the frontend expects or we handle both.
                
                // Backend WorkflowStatus enum: Draft=0, Active=1, Suspended=2, Completed=3, Terminated=4
                // Status can be string "1" or int 1 or string "Active"
                
                const filtered = instances.filter((i: any) => {
                     let status = i.status;
                     
                     // Helper: normalize to int if possible, or lowercase string
                     let statusInt = -1;
                     if (typeof status === 'number') statusInt = status;
                     else if (typeof status === 'string' && !isNaN(Number(status))) statusInt = Number(status);
                     
                     if (type === 'running') {
                         // Active(1)
                         if (statusInt === 1) return true;
                         if (typeof status === 'string' && (status.toLowerCase() === 'active' || status.toLowerCase() === 'inprogress')) return true;
                         return false;
                     } else {
                         // Completed(3)
                         if (statusInt === 3) return true;
                         if (typeof status === 'string' && status.toLowerCase() === 'completed') return true;
                         return false;
                     }
                });
                setItems(filtered);
            } else if (type === 'docs' || type === 'folders') {
                const assignments = await getAssignmentsByWorkflow(workflowId);
                // Filter by target type
                // targetType for docs might be 'Document' or 'DocumentType' (if assigned to a type)
                // Note: WorkflowAssignmentDto uses snake_case JSON properties!
                
                const filtered = assignments.filter((a: any) => {
                    // Try both camelCase and snake_case
                    const tType = a.target_type || a.targetType; 
                    const assignType = tType?.toLowerCase();
                    
                    if (type === 'docs') {
                        return assignType === 'document' || assignType === 'documenttype';
                    } else { // folders
                         return assignType === 'folder' || assignType === 'workspace';
                    }
                });
                setItems(filtered);
            }
        } catch (error) {
            console.error('Error fetching details:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const getTitle = () => {
        switch (type) {
            case 'running': return `${t('Running')} - ${workflowName}`;
            case 'completed': return `${t('Completed')} - ${workflowName}`;
            case 'docs': return `${t('Docs')} - ${workflowName}`;
            case 'folders': return `${t('Folders')} - ${workflowName}`;
            default: return workflowName;
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'running': return <Activity size={20} color="#3b82f6" />;
            case 'completed': return <CheckCircle size={20} color="#10b981" />;
            case 'docs': return <FileText size={20} color="#f59e0b" />;
            case 'folders': return <Folder size={20} color="#8b5cf6" />;
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" style={{ maxWidth: '600px', width: '100%' }} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {getIcon()}
                        <h3>{getTitle()}</h3>
                    </div>
                    <button onClick={onClose} className="close-btn">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="modal-body">
                    {loading ? (
                        <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
                    ) : (
                        <div className="items-list">
                            {items.length === 0 ? (
                                <p style={{ color: '#666', fontStyle: 'italic' }}>{t('noItemsFound') || 'No items found'}</p>
                            ) : (
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    {items.map((item, index) => (
                                        <li key={index} style={{ padding: '12px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                {type === 'running' || type === 'completed' ? (
                                                    // Workflow Instance
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <div>
                                                               <div style={{ fontWeight: 500 }}>
                                                                   {item.workflowName || item.workflow_name} 
                                                                   {(item.targetTitle || item.target_title) && (
                                                                       <span style={{ fontWeight: 'normal', fontSize: '0.9em', color: '#555' }}>
                                                                        {' - '}{item.targetTitle || item.target_title}
                                                                       </span>
                                                                   )}
                                                               </div> 
                                                           <div style={{ fontSize: '12px', color: '#666' }}>
                                                               {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''} 
                                                               {item.currentStep ? ` - Step: ${item.currentStep}` : ''}
                                                           </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    // Assignment
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                            <div style={{ color: '#666' }}>
                                                                {(item.target_type?.toLowerCase() === 'document' || item.targetType?.toLowerCase() === 'document') ? <FileText size={18} /> : <Folder size={18} />}
                                                            </div>
                                                            <div>
                                                                    <div style={{ fontWeight: 500 }}>
                                                                        {(item.target_type?.toLowerCase() === 'document' || item.targetType?.toLowerCase() === 'document') ? (
                                                                            <a 
                                                                                href={`/document/${item.target_id || item.targetId}`} 
                                                                                target="_blank" 
                                                                                rel="noopener noreferrer"
                                                                                style={{ color: '#2563eb', textDecoration: 'none', cursor: 'pointer' }}
                                                                                onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
                                                                                onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
                                                                            >
                                                                                {item.target_name || item.targetName || item.target_id || 'Unknown Target'}
                                                                            </a>
                                                                        ) : (
                                                                            <span>{item.target_name || item.targetName || item.target_id || 'Unknown Target'}</span>
                                                                        )}
                                                                    </div>
                                                                <div style={{ fontSize: '12px', color: '#999' }}>
                                                                    {item.target_type || item.targetType}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Action Button */}
                                            {(type === 'running' || type === 'completed') && (
                                                    <button 
                                                        className="btn-icon" 
                                                        onClick={() => {
                                                            if (type === 'completed') {
                                                                window.open(`/workflow-instances?id=${item.id || item._id}`, '_blank');
                                                            } else {
                                                                window.open(`/tasks/${item.id || item._id}`, '_blank');
                                                            }
                                                        }}
                                                        data-tooltip-content={type === 'completed' ? (t('viewDetails') || 'View Details') : (t('openInNewTab') || 'Open')} 
                                                    >
                                                        <ExternalLink size={16} />
                                                    </button>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                </div>
            </div>
             <style>{`
                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    padding-bottom: 10px;
                    border-bottom: 1px solid #eee;
                }
                .items-list {
                    max-height: 400px;
                    overflow-y: auto;
                }
                .btn-icon {
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: #666;
                    padding: 5px;
                    border-radius: 4px;
                }
                .btn-icon:hover {
                    background: #f0f0f0;
                    color: #333;
                }
            `}</style>
        </div>
    );
};

export default WorkflowDetailsModal;
