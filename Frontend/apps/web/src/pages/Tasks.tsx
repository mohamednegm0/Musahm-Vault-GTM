import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  CheckSquare,
  Clock,
  Calendar,
  User,
  X,
  Eye,
  Grid3x3,
  List as ListIcon,
  Table2
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { getTasks, getTaskById, createTask, updateTask, deleteTask, TaskEntity } from '../api/tasks';
import { getWorkflowInstanceById } from '../api/workflowInstances';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../contexts/ConfirmContext';
import LoadingState from '../components/LoadingState';
import Breadcrumb from '../components/Breadcrumb';
import TaskActionModal from '../components/TaskActionModal';
import DocumentsLayout from '../components/DocumentsLayout';
import DatePicker from '../components/DatePicker';
import Pagination from '../components/Pagination';
import Tooltip from '../components/Tooltip'; // Assuming Tooltip is a custom component
import './Tasks.css';
import '../styles/CommonList.css';
import { useWorkspace } from '../contexts/WorkspaceContext';

const Tasks = () => {
    const { t, language } = useLanguage();
    const toast = useToast();
    const { confirm } = useConfirm();
    const navigate = useNavigate();
    const { taskId } = useParams<{ taskId?: string }>();
    const { refreshWorkspaces } = useWorkspace();
    const [tasks, setTasks] = useState<TaskEntity[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
    const itemsPerPage = viewMode === 'table' ? 20 : 12;

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, viewMode]);
    
    // Edit/Create Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentTask, setCurrentTask] = useState<Partial<TaskEntity>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fetchedDocId, setFetchedDocId] = useState<string | undefined>(undefined);

    // Action Modal State
    const [actionTask, setActionTask] = useState<TaskEntity | null>(null);

    const loadTasks = async () => {
        try {
            setLoading(true);
            const data = await getTasks();
            setTasks(data);
            
            // Auto open task from URL if provided
            if (taskId) {
               // The taskId from URL might actually be a Task ID, a Workflow Instance ID, or a Document ID
               let taskFromUrl = data.find(t => 
                   t.id === taskId || 
                   t.workflowId === taskId || 
                   t.relatedEntity?.id === taskId || 
                   t.targetDocumentId === taskId ||
                   (t as any)._id === taskId
               );
               
               if (!taskFromUrl) {
                   // If not in the loaded list, try to fetch it directly
                   try {
                       taskFromUrl = await getTaskById(taskId);
                   } catch (fetchErr) {
                       console.error('Failed to fetch specific task', fetchErr);
                   }
               }

               if (taskFromUrl) {
                   setActionTask(taskFromUrl);
               } else {
                   toast.error(t('taskNotFoundOrNotAssigned') || 'Task not found or not assigned to you.');
                   navigate('/tasks', { replace: true });
               }
            }
        } catch (error) {
            console.error('Failed to load tasks', error);
            toast.error(t('failedToLoadTasks') || 'Failed to load tasks');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTasks();
    }, [taskId]);

    // Fetch document ID for "Edit" modal if missing (Old tasks support)
    useEffect(() => {
        const fetchDoc = async () => {
            if (isModalOpen && currentTask.relatedEntity?.type === 'WorkflowInstance' && currentTask.relatedEntity.id && !currentTask.targetDocumentId) {
                try {
                    const instance = await getWorkflowInstanceById(currentTask.relatedEntity.id);
                    if (instance) {
                        // Fallback to context.target_id if documentId is missing (e.g. older tasks or backend pending restart)
                        const docId = instance.documentId || instance.context?.target_id;
                        if (docId) setFetchedDocId(docId);
                    }
                } catch (e) {
                    console.error('Failed to fetch related workflow instance', e);
                }
            } else {
                setFetchedDocId(undefined);
            }
        };
        fetchDoc();
    }, [isModalOpen, currentTask.relatedEntity, currentTask.targetDocumentId]);

    const handleCreate = () => {
        setCurrentTask({ priority: 'Low', status: 'Pending' }); 
        setFetchedDocId(undefined);
        setIsModalOpen(true);
    };

    const handleEdit = (task: TaskEntity) => {
        setCurrentTask({ ...task });
        setFetchedDocId(undefined);
        setIsModalOpen(true);
    };

    const handleDelete = (task: TaskEntity) => {
        confirm({
            title: t('confirmDeleteTask'),
            message: t('confirmDeleteTaskDescription'),
            confirmText: t('delete'),
            cancelText: t('cancel'),
            type: 'danger',
            onConfirm: async () => {
                if (task.id) {
                    try {
                        await deleteTask(task.id);
                        toast.success(t('taskDeletedSuccessfully'));
                        loadTasks();
                    } catch (error) {
                        toast.error(t('failedToDeleteTask') || 'Failed to delete task');
                    }
                }
            }
        });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (currentTask.id) {
                await updateTask(currentTask.id, currentTask as TaskEntity);
                toast.success(t('taskUpdatedSuccessfully'));
            } else {
                await createTask(currentTask as TaskEntity);
                toast.success(t('taskCreatedSuccessfully'));
            }
            setIsModalOpen(false);
            loadTasks();
        } catch (error) {
            toast.error(currentTask.id ? t('failedToUpdateTask') : t('failedToCreateTask'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const cleanDescriptionText = (text?: string) => {
        if (!text) return null;
        // Strip out the "Link: http..." part completely
        // Matches "Link: " followed by any URL until the end of line or space
        let cleanedText = text.replace(/Link:\s*https?:\/\/[^\s]+/gi, '').trim();
        
        // Remove auto-generated share text details
        if (cleanedText.includes('Original Instructions:')) {
            cleanedText = cleanedText.split('Original Instructions:')[1].trim();
        } else if (cleanedText.includes('has requested to share the document')) {
            cleanedText = '';
        }
        
        if (!cleanedText) return null;
        return <>{cleanedText}</>;
    };

    const getPriorityLabel = (priority?: string | number) => {
        const p = String(priority).toLowerCase();
        if (p === '2' || p === 'high') return { label: t('highPriority'), class: 'high' };
        if (p === '1' || p === 'medium') return { label: t('mediumPriority'), class: 'medium' };
        return { label: t('lowPriority'), class: 'low' };
    };

    const getStatusLabel = (status?: string) => {
        switch (status?.toLowerCase()) {
            case 'completed': return { label: t('taskCompletedStatus'), class: 'completed' };
            case 'inprogress': return { label: t('taskInProgressStatus'), class: 'inprogress' };
            case 'rejected': return { label: t('taskRejectedStatus') || 'Rejected', class: 'rejected' };
            case 'approved': return { label: t('taskApprovedStatus') || 'Approved', class: 'approved' };
            case 'terminated': return { label: t('taskTerminatedStatus') || 'Terminated', class: 'terminated' };
            default: return { label: t('taskPendingStatus'), class: 'pending' };
        }
    };

    const filteredTasks = tasks.filter(task => 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentTasks = filteredTasks.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);

    const editModalDocId = currentTask.targetDocumentId || (currentTask.relatedEntity?.type === 'Document' || currentTask.relatedItemType === 'Document' ? currentTask.relatedEntity?.id : fetchedDocId);
    const isEditModalWorkspace = currentTask.relatedItemType === 'Workspace' || currentTask.relatedEntity?.type === 'Workspace';

    const headerActions = (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="header-search-group" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="search-bar" style={{ margin: 0, padding: '0 14px', height: '38px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.02)' }}>
                    <Search size={16} color="#94a3b8" />
                    <input 
                        type="text" 
                        placeholder={t('searchTasksPlaceholder')} 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '13.5px', width: '200px', color: '#334155', padding: 0 }}
                    />
                </div>
            </div>
            <div className="view-mode-buttons" style={{ display: 'flex', background: '#f8fafc', padding: '4px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <Tooltip content={t('gridView') || 'Grid View'} position="top">
                    <button
                        className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
                        onClick={() => setViewMode('grid')}
                        style={{ padding: '6px', borderRadius: '6px', border: 'none', background: viewMode === 'grid' ? 'white' : 'transparent', color: viewMode === 'grid' ? '#334155' : '#94a3b8', cursor: 'pointer', boxShadow: viewMode === 'grid' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
                    >
                        <Grid3x3 size={16} />
                    </button>
                </Tooltip>
                <Tooltip content={t('tableView') || 'Table View'} position="top">
                    <button
                        className={`view-mode-btn ${viewMode === 'table' ? 'active' : ''}`}
                        onClick={() => setViewMode('table')}
                        style={{ padding: '6px', borderRadius: '6px', border: 'none', background: viewMode === 'table' ? 'white' : 'transparent', color: viewMode === 'table' ? '#334155' : '#94a3b8', cursor: 'pointer', boxShadow: viewMode === 'table' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
                    >
                        <Table2 size={16} />
                    </button>
                </Tooltip>
            </div>
        </div>
    );

    const customContent = (
        <>
            {loading ? (
                <LoadingState />
            ) : filteredTasks.length === 0 ? (
                <div className="empty-state" style={{ textAlign: 'center', padding: '60px 0', color: '#64748b', border: '2px dashed #e2e8f0', borderRadius: '12px' }}>
                    <CheckSquare size={48} style={{ marginBottom: '16px', opacity: 0.2 }} />
                    <h3>{t('noTasksFound')}</h3>
                    <p>{t('noTasksDescription')}</p>
                </div>
            ) : viewMode === 'table' ? (
                <>
                <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', fontSize: '13.5px' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                <th style={{ padding: '12px 16px', textAlign: language === 'ar' ? 'right' : 'left', color: '#64748b', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{t('title') || 'Title'}</th>
                                <th style={{ padding: '12px 16px', textAlign: 'center', color: '#64748b', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{t('status') || 'Status'}</th>
                                <th style={{ padding: '12px 16px', textAlign: 'center', color: '#64748b', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{t('priority') || 'Priority'}</th>
                                <th style={{ padding: '12px 16px', textAlign: language === 'ar' ? 'right' : 'left', color: '#64748b', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{t('workflowName') || 'Workflow'}</th>
                                <th style={{ padding: '12px 16px', textAlign: language === 'ar' ? 'right' : 'left', color: '#64748b', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{t('assignedTo') || 'Assigned To'}</th>
                                <th style={{ padding: '12px 16px', textAlign: language === 'ar' ? 'right' : 'left', color: '#64748b', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{t('dueDate') || 'Due Date'}</th>
                                <th style={{ padding: '12px 16px', textAlign: 'center', color: '#64748b', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentTasks.map((task, idx) => {
                                const priority = getPriorityLabel(task.priority);
                                const status = getStatusLabel(task.status);
                                const s = task.status?.toLowerCase();
                                const isTaskProcessed = s === 'completed' || s === 'approved' || s === 'rejected' || s === 'terminated';
                                return (
                                    <tr
                                        key={task.id}
                                        style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? 'white' : '#fafbfc', cursor: 'pointer', transition: 'background 0.15s' }}
                                        onMouseEnter={e => (e.currentTarget.style.background = '#f0f9ff')}
                                        onMouseLeave={e => (e.currentTarget.style.background = idx % 2 === 0 ? 'white' : '#fafbfc')}
                                        onClick={() => setActionTask(task)}
                                    >
                                        <td style={{ padding: '12px 16px', fontWeight: 600, color: '#1e293b', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {task.title}
                                        </td>
                                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                            <span className={`task-badge badge-status-${status.class}`}>{status.label}</span>
                                        </td>
                                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                            <span className={`task-badge badge-priority-${priority.class}`}>{priority.label}</span>
                                        </td>
                                        <td style={{ padding: '12px 16px', color: '#475569', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {task.workflowName || '—'}
                                        </td>
                                        <td style={{ padding: '12px 16px', color: '#475569', whiteSpace: 'nowrap' }}>
                                            {task.assignedToName || task.assignedTo || '—'}
                                        </td>
                                        <td style={{ padding: '12px 16px', color: '#94a3b8', whiteSpace: 'nowrap', fontSize: '12.5px' }}>
                                            {task.dueDate && new Date(task.dueDate).getFullYear() > 2000 ? new Date(task.dueDate).toLocaleDateString() : '—'}
                                        </td>
                                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                                {task.targetDocumentId && (
                                                    <button className="task-action-btn" onClick={e => { e.stopPropagation(); window.open(`/document/${task.targetDocumentId}`, '_blank'); }} title={t('viewDocument') || 'View Document'}><Eye size={14} /></button>
                                                )}
                                                {!isTaskProcessed && (
                                                    <button className="task-action-btn execute" onClick={e => { e.stopPropagation(); setActionTask(task); }} title={t('processTask') || 'Process'}><CheckSquare size={14} /></button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {totalPages > 1 && (
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} totalItems={filteredTasks.length} itemsPerPage={itemsPerPage} />
                )}
                </>
            ) : (
                <>
                <div className="tasks-grid">
                    {currentTasks.map(task => {
                        const priority = getPriorityLabel(task.priority);
                        const status = getStatusLabel(task.status);
                        const s = task.status?.toLowerCase();
                        const isTaskProcessed = s === 'completed' || s === 'approved' || s === 'rejected' || s === 'terminated';
                        
                        return (
                            <div key={task.id} className={`task-card priority-${priority.class} status-${status.class}`} onClick={() => setActionTask(task)}>
                                <div className="task-card-header">
                                    <div className="task-badge-group">
                                        <span className={`task-badge badge-priority-${priority.class}`}>{priority.label}</span>
                                        <span className={`task-badge badge-status-${status.class}`}>{status.label}</span>
                                    </div>
                                    <div className="task-card-actions">
                                        {task.targetDocumentId && (
                                            <button 
                                                className="task-action-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    window.open(`/document/${task.targetDocumentId}`, '_blank');
                                                }}
                                                data-tooltip-content={t('viewDocument') || 'View Document'}
                                            >
                                                <Eye size={14} />
                                            </button>
                                        )}
                                        {!isTaskProcessed && (
                                            <button 
                                                className="task-action-btn execute"
                                                onClick={(e) => { e.stopPropagation(); setActionTask(task); }}
                                                data-tooltip-content={t('processTask') || (language === 'ar' ? 'معالجة' : 'Process')}
                                            >
                                                <CheckSquare size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="task-card-body">
                                    <h3>{task.title}</h3>
                                    {task.description && <p>{cleanDescriptionText(task.description)}</p>}
                                    
                                    {(task.relatedItemName || task.relatedEntity?.name || task.createdByName || task.relatedItemType || task.relatedEntity?.type || task.workflowName || task.triggerType) && (
                                        <div className="task-extra-details">
                                            {task.workflowName && (
                                                <div className="detail-row">
                                                    <span className="detail-label">
                                                        {t('workflowName') || (language === 'ar' ? 'اسم مسار العمل' : 'Workflow Name')}
                                                    </span>
                                                    <span className="detail-value" title={task.workflowName}>
                                                        {task.workflowName}
                                                    </span>
                                                </div>
                                            )}
                                            {task.triggerType && (
                                                <div className="detail-row">
                                                    <span className="detail-label">
                                                        {t('triggerType') || (language === 'ar' ? 'نوع المشغل' : 'Trigger Type')}
                                                    </span>
                                                    <span className="detail-value">
                                                        {task.triggerType}
                                                    </span>
                                                </div>
                                            )}
                                            {(task.relatedItemType || task.relatedEntity?.type) && (
                                                <div className="detail-row">
                                                    <span className="detail-label">
                                                        {t('type') || (language === 'ar' ? 'النوع' : 'Type')}
                                                    </span>
                                                    <span className="detail-value">
                                                        {(task.relatedItemType || task.relatedEntity?.type) === 'Workspace' ? (language === 'ar' ? 'مساحة عمل' : 'Workspace') : 
                                                         (task.relatedItemType || task.relatedEntity?.type) === 'Document' ? (language === 'ar' ? 'مستند' : 'Document') : 
                                                         (task.relatedItemType || task.relatedEntity?.type) === 'WorkflowInstance' ? t('WorkflowInstance') : 
                                                         (task.relatedItemType || task.relatedEntity?.type)}
                                                    </span>
                                                </div>
                                            )}
                                            {(task.relatedItemName || task.relatedEntity?.name) && (
                                                <div className="detail-row">
                                                    <span className="detail-label">
                                                        {t('relatedItem') || (language === 'ar' ? 'العنصر المرتبط' : 'Related Item')}
                                                    </span>
                                                    <span className="detail-value" title={task.relatedItemName || task.relatedEntity?.name}>
                                                        {task.relatedItemName || task.relatedEntity?.name}
                                                    </span>
                                                </div>
                                            )}
                                            {task.createdByName && (
                                                <div className="detail-row">
                                                    <span className="detail-label">
                                                        {t('requestedBy') || (language === 'ar' ? 'بواسطة' : 'Requested By')}
                                                    </span>
                                                    <span className="detail-value" title={task.createdByName}>
                                                        {task.createdByName}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                
                                <div className="task-card-footer">
                                    <div className="task-meta-info">
                                        <div className="meta-item">
                                            <Calendar size={14} />
                                            {task.dueDate && new Date(task.dueDate).getFullYear() > 2000 
                                                ? new Date(task.dueDate).toLocaleDateString() 
                                                : (task.createdAt && new Date(task.createdAt).getFullYear() > 2000 
                                                    ? new Date(task.createdAt).toLocaleDateString() 
                                                    : '')}
                                        </div>
                                        {(task.assignedToName || task.assignedTo) && (
                                            <div className="meta-item">
                                                <User size={14} />
                                                {task.assignedToName || task.assignedTo}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                {totalPages > 1 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        totalItems={filteredTasks.length}
                        itemsPerPage={itemsPerPage}
                    />
                )}
                </>
            )}

            {/* Create/Edit Modal - Polished Design */}
            {isModalOpen && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0, 0, 0, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000, padding: '20px', backdropFilter: 'blur(4px)'
                }}>
                    <div className="task-modal-card" style={{
                        background: 'white',
                        borderRadius: '12px',
                        width: '100%',
                        maxWidth: '600px',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        overflow: 'hidden',
                        maxHeight: '85vh',
                        fontFamily: 'inherit'
                    }}>
                        <div className="task-modal-header" style={{
                            padding: '24px',
                            borderBottom: '1px solid #f1f5f9',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: 'white'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                                    {currentTask.id ? t('editTask') : t('newTask')}
                                </h2>
                            </div>
                            <button 
                                className="close-btn" 
                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '8px', borderRadius: '50%', display: 'flex' }}
                                onClick={() => setIsModalOpen(false)}
                                onMouseOver={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#ef4444'; }}
                                onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
                            >
                                <X size={20} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                            <div className="task-modal-body" style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {editModalDocId && (
                                    <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>{isEditModalWorkspace ? (t('attachedWorkspace') || 'Attached Workspace') : (t('attachedDocument') || 'Attached Document')}</span>
                                        <button 
                                            type="button" 
                                            style={{ 
                                                padding: '6px 12px', 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                gap: '6px', 
                                                fontSize: '13px',
                                                fontWeight: '600', 
                                                borderRadius: '6px', 
                                                border: '1px solid #dbeafe', 
                                                background: '#eff6ff', 
                                                cursor: 'pointer',
                                                color: '#2563eb'
                                            }}
                                            onClick={() => window.open(isEditModalWorkspace ? `/workspace/${editModalDocId}` : `/document/${editModalDocId}`, '_blank')}
                                        >
                                            <Eye size={14} /> {isEditModalWorkspace ? (t('viewWorkspace') || 'View Workspace') : (t('view') || 'View')}
                                        </button>
                                    </div>
                                )}
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: '#334155' }}>
                                        {t('title') || 'Title'}
                                    </label>
                                    <input 
                                        type="text" 
                                        className="form-input" 
                                        value={currentTask.title || ''} 
                                        onChange={e => setCurrentTask({...currentTask, title: e.target.value})}
                                        required
                                        placeholder={t('enterTaskTitle') || 'Enter task title'}
                                        style={{ width: '100%', padding: '10px 12px', margin: 0, borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
                                        onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                        onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                                    />
                                </div>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#334155' }}>
                                        {t('description') || 'Description'}
                                    </label>
                                    <textarea 
                                        className="form-input" 
                                        value={currentTask.description || ''} 
                                        onChange={e => setCurrentTask({...currentTask, description: e.target.value})}
                                        rows={8}
                                        placeholder={t('enterTaskDescription') || 'Enter description'}
                                        style={{ width: '100%', padding: '12px 16px', margin: 0, borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', lineHeight: '1.6', resize: 'vertical', minHeight: '160px', outline: 'none', fontFamily: 'inherit', background: '#f8fafc', boxSizing: 'border-box' }}
                                        onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.background = 'white'; }}
                                        onBlur={(e) => { e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f8fafc'; }}
                                    />
                                </div>
                                <div className="form-row" style={{ display: 'flex', gap: '20px' }}>
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: '#334155' }}>
                                            {t('priority')}
                                        </label>
                                        <select 
                                            className="form-input"
                                            value={currentTask.priority || 'Low'}
                                            onChange={e => setCurrentTask({...currentTask, priority: e.target.value})}
                                            style={{ width: '100%', padding: '10px 12px', margin: 0, borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', backgroundColor: 'white', outline: 'none', boxSizing: 'border-box' }}
                                            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                            onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                                        >
                                            <option value="Low">{t('lowPriority')}</option>
                                            <option value="Medium">{t('mediumPriority')}</option>
                                            <option value="High">{t('highPriority')}</option>
                                        </select>
                                    </div>
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: '#334155' }}>
                                            {t('dueDate') || 'Due Date'}
                                        </label>
                                        <DatePicker
                                            value={currentTask.dueDate && new Date(currentTask.dueDate).getFullYear() > 2000 ? new Date(currentTask.dueDate).toISOString().split('T')[0] : ''}
                                            onChange={val => setCurrentTask({...currentTask, dueDate: val ? new Date(val) : undefined})}
                                            placeholder={t('dueDate') || 'Due Date'}
                                            minDate={new Date().toISOString().split('T')[0]}
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="task-modal-footer" style={{
                                padding: '20px 24px',
                                borderTop: '1px solid #f1f5f9',
                                background: 'white',
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: '12px'
                            }}>
                                <button 
                                    type="button" 
                                    className="btn-secondary" 
                                    onClick={() => setIsModalOpen(false)}
                                    style={{ 
                                        padding: '10px 20px', 
                                        borderRadius: '8px', 
                                        border: '1px solid #e2e8f0', 
                                        background: 'white', 
                                        color: '#64748b', 
                                        fontWeight: '600', 
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'}
                                    onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                                >
                                    {t('cancel')}
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn-primary" 
                                    style={{ 
                                        padding: '10px 24px', 
                                        borderRadius: '8px', 
                                        border: 'none', 
                                        background: isSubmitting ? '#94a3b8' : 'var(--primary-color, #2563eb)', 
                                        color: 'white', 
                                        fontWeight: '600', 
                                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                                    }}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? t('saving') : t('save')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Action Modal */}
            {actionTask && (
                <TaskActionModal 
                    task={actionTask} 
                    onClose={() => {
                        setActionTask(null);
                        if (taskId) {
                            navigate('/tasks', { replace: true });
                        }
                    }} 
                    onComplete={async () => {
                        setActionTask(null);
                        await refreshWorkspaces();
                        if (taskId) {
                            navigate('/tasks', { replace: true });
                        } else {
                            loadTasks();
                        }
                    }} 
                />
            )}
        </>
    );

    return (
        <DocumentsLayout
            title={t('tasksTitle')}
            headerIcon={CheckSquare}
            subtitle={t('manageTasks')}
            breadcrumb={<Breadcrumb items={[{ label: t('home'), onClick: () => navigate('/') }, { label: t('tasksTitle') }]} />}
            actions={headerActions}
            documents={[]}
            customContent={customContent}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
        />
    );
};

export default Tasks;
