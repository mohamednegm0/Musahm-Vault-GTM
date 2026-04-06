
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, Plus, Trash2, Edit2, Shield, FileText, Users, AlertCircle, Check, ToggleLeft, ToggleRight, Loader, Power } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../contexts/ConfirmContext';
import { 
    WorkflowAssignment, 
    createAssignment, 
    getAssignmentsByTarget,
    getAssignmentsByWorkflow,
    updateAssignment
} from '../api/workflowAssignments';
import { 
    getWorkflows, 
    Workflow,
    getTriggerDefinitions,
    WorkflowTriggerDefinition
} from '../api/workflows';
import { getAllDocumentTypes, DocumentTypeDto, createDocumentType } from '../api/documentTypes';
import { getAllRoles, RoleDto } from '../api/roles';
import { getAllProfileUsers, ProfileUser } from '../api/profiles';
import apiClient from '../api/apiClient'; // For direct delete/update if helpers missing

import './WorkflowAssignmentModal.css';

interface WorkflowAssignmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    targetId?: string;
    targetType?: 'Workspace' | 'Folder' | 'Document';
    targetName?: string;
    // When workflowId is provided, the modal filters by workflow instead of target
    workflowId?: string;
    workflowName?: string;
}

const WorkflowAssignmentModal: React.FC<WorkflowAssignmentModalProps> = ({
    isOpen,
    onClose,
    targetId,
    targetType,
    targetName,
    workflowId,
    workflowName
}) => {
    const isWorkflowMode = !!workflowId;
    const effectiveTargetType: 'Workspace' | 'Folder' | 'Document' = targetType || 'Document';

    const { t, language } = useLanguage();
    const { success, error } = useToast();
    const { confirm } = useConfirm();

    const [view, setView] = useState<'list' | 'form'>('list');
    const [assignments, setAssignments] = useState<WorkflowAssignment[]>([]);
    const [loading, setLoading] = useState(false);
    
    // Form Data
    const [editingId, setEditingId] = useState<string | null>(null);
    const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>('');
    const [selectedDocTypes, setSelectedDocTypes] = useState<string[]>([]);
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const [selectedExceptions, setSelectedExceptions] = useState<string[]>([]); // User IDs
    const [selectedTriggerCodes, setSelectedTriggerCodes] = useState<string[]>([]);

    // Reference Data
    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const [docTypes, setDocTypes] = useState<DocumentTypeDto[]>([]);
    const [roles, setRoles] = useState<RoleDto[]>([]);
    const [users, setUsers] = useState<ProfileUser[]>([]);
    const [triggerDefinitions, setTriggerDefinitions] = useState<WorkflowTriggerDefinition[]>([]);

    const [activeTab, setActiveTab] = useState<'general' | 'doctypes' | 'roles' | 'exceptions' | 'triggers'>('general');

    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

    // Doc Type Creation
    const [isCreatingDocType, setIsCreatingDocType] = useState(false);
    const [newDocType, setNewDocType] = useState<{nameEn: string, nameAr: string}>({ nameEn: '', nameAr: '' });
    const [docTypeErrors, setDocTypeErrors] = useState<{nameEn?: string, nameAr?: string}>({});

    const toggleGroup = (id: string) => setExpandedGroups(prev => ({...prev, [id]: !prev[id]}));

    useEffect(() => {
        if (isOpen) {
            fetchData();
            setView('list');
            resetForm();
        }
    }, [isOpen, targetId, workflowId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const assignmentsFetch = isWorkflowMode
                ? getAssignmentsByWorkflow(workflowId!)
                : getAssignmentsByTarget(targetId!);

            const [
                fetchedAssignments,
                fetchedWorkflows,
                fetchedDocTypes,
                fetchedRoles,
                fetchedUsers,
                fetchedTriggers
            ] = await Promise.all([
                assignmentsFetch,
                getWorkflows(),
                getAllDocumentTypes(),
                getAllRoles(),
                getAllProfileUsers(),
                getTriggerDefinitions()
            ]);

            setAssignments(fetchedAssignments);
            setWorkflows(fetchedWorkflows);
            setDocTypes(fetchedDocTypes);
            setRoles(fetchedRoles);
            setUsers(fetchedUsers);
            setTriggerDefinitions(fetchedTriggers);
        } catch (err) {
            console.error(err);
            error(t('errorLoadingData') || (language === 'ar' ? 'خطأ في تحميل البيانات' : 'Error loading data'));
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setSelectedWorkflowId('');
        setSelectedDocTypes([]);
        setSelectedRoles([]);
        setSelectedExceptions([]);
        setSelectedTriggerCodes([]);
        setActiveTab('general');
    };

    const handleAddNew = () => {
        resetForm();
        setView('form');
    };

    const handleEdit = (assignment: WorkflowAssignment) => {
        setEditingId(assignment.id);
        setSelectedWorkflowId(assignment.workflow_id);
        setSelectedDocTypes(assignment.document_type_ids || []);
        setSelectedRoles(assignment.role_ids || []);
        setSelectedExceptions(assignment.exception_user_ids || []);
        setSelectedTriggerCodes(assignment.trigger_codes || []);
        setView('form');
    };

    const getErrorMessage = (err: any) => {
        if (err?.response?.data) {
            const data = err.response.data;
            if (typeof data === 'string') return data;
            if (data.message) return data.message;
            if (data.title) return data.title;
            if (data.errors) {
                return Object.values(data.errors).flat().join(', ');
            }
        }
        return err?.message || t('errorOccurred') || (language === 'ar' ? 'حدث خطأ' : 'An error occurred');
    };

    const extractLocalizedMessage = (message: string | undefined): string => {
        if (!message) return '';
        
        // Check if message contains both languages (separated by " / ")
        if (message.includes(' / ')) {
            const parts = message.split(' / ');
            if (parts.length === 2) {
                // First part is English, second is Arabic
                return language === 'ar' ? parts[1].trim() : parts[0].trim();
            }
        }
        
        return message;
    };

    const handleDelete = async (id: string) => {
        confirm({
            title: t('deleteAssignment') || (language === 'ar' ? 'حذف التعيين' : 'Delete Assignment'),
            message: t('confirmDeleteAssignment') || (language === 'ar' ? 'هل أنت متأكد أنك تريد حذف تعيين سير العمل هذا؟' : 'Are you sure you want to delete this workflow assignment?'),
            type: 'danger',
            onConfirm: async () => {
                try {
                    await apiClient.delete(`/api/WorkflowAssignments/${id}`);
                    success(t('assignmentDeleted') || (language === 'ar' ? 'تم حذف التعيين' : 'Assignment deleted'));
                    fetchData();
                } catch (err) {
                    error(getErrorMessage(err));
                }
            }
        });
    };

    const isAssignmentActive = (assignment: any) => {
        if (assignment.isActive !== undefined) return assignment.isActive;
        if (assignment.is_active !== undefined) return assignment.is_active;
        if (assignment.IsActive !== undefined) return assignment.IsActive; // In case it's PascalCase
        return true;
    };

    const handleToggleActive = async (assignment: WorkflowAssignment) => {
        try {
            const currentState = isAssignmentActive(assignment);
            const payload = {
                workflow_id: assignment.workflow_id,
                target_id: assignment.target_id,
                target_type: assignment.target_type,
                document_type_ids: assignment.document_type_ids,
                role_ids: assignment.role_ids,
                exception_user_ids: assignment.exception_user_ids,
                isActive: !currentState,
                is_active: !currentState // Send snake_case explicitly just in case
            };
            
            const result = await updateAssignment(assignment.id, payload);
            if (result.success) {
                success(t('assignmentUpdated') || (language === 'ar' ? 'تم تحديث التعيين بنجاح' : 'Assignment updated successfully'));
                fetchData();
            } else {
                const localizedMessage = extractLocalizedMessage(result.message);
                error(localizedMessage || (language === 'ar' ? 'لا يمكن تحديث التعيين' : 'Cannot update assignment'));
            }
        } catch (err: any) {
            console.error(err);
            error(getErrorMessage(err));
        }
    };

    const handleCreateDocType = async () => {
        const errors: {nameEn?: string, nameAr?: string} = {};
        
        // Validate English Name
        if (!newDocType.nameEn) {
            const msg = t('wf_required');
            errors.nameEn = (msg && msg !== 'wf_required') ? msg : (language === 'ar' ? 'مطلوب' : 'Required');
        } else if (!/^[A-Za-z0-9\s\-_]+$/.test(newDocType.nameEn)) {
            const msg = t('wf_invalidEnName');
            errors.nameEn = (msg && msg !== 'wf_invalidEnName') ? msg : (language === 'ar' ? 'الاسم الانجليزي يجب أن يحتوي على حروف انجليزية فقط' : 'English name must contain only English characters');
        } else if (docTypes.some(d => d.nameEn?.toLowerCase() === newDocType.nameEn.toLowerCase())) {
            const msg = t('wf_duplicateNameEn');
            errors.nameEn = (msg && msg !== 'wf_duplicateNameEn') ? msg : (language === 'ar' ? 'الاسم الانجليزي موجود بالفعل' : 'English name already exists');
        }

        // Validate Arabic Name
        if (!newDocType.nameAr) {
            const msg = t('wf_required');
            errors.nameAr = (msg && msg !== 'wf_required') ? msg : (language === 'ar' ? 'مطلوب' : 'Required');
        } else if (!/^[\u0600-\u06FF0-9\s\-_]+$/.test(newDocType.nameAr)) {
            const msg = t('wf_invalidArName');
            errors.nameAr = (msg && msg !== 'wf_invalidArName') ? msg : (language === 'ar' ? 'الاسم العربي يجب أن يحتوي على حروف عربية فقط' : 'Arabic name must contain only Arabic characters');
        } else if (docTypes.some(d => d.nameAr === newDocType.nameAr)) {
            const msg = t('wf_duplicateNameAr');
            errors.nameAr = (msg && msg !== 'wf_duplicateNameAr') ? msg : (language === 'ar' ? 'الاسم العربي موجود بالفعل' : 'Arabic name already exists');
        }

        if (Object.keys(errors).length > 0) {
            setDocTypeErrors(errors);
            return;
        }

        setDocTypeErrors({});

        try {
            const created = await createDocumentType({
                nameEn: newDocType.nameEn,
                nameAr: newDocType.nameAr,
                code: newDocType.nameEn.toLowerCase().replace(/[^a-z0-9]/g, '_')
            });
            
            setDocTypes([...docTypes, created]);
            setSelectedDocTypes([...selectedDocTypes, created.id]);
            setIsCreatingDocType(false);
            setNewDocType({ nameEn: '', nameAr: '' });
            success(t('wf_docTypeCreated') || (language === 'ar' ? 'تم إنشاء نوع الوثيقة بنجاح' : 'Document Type Created Successfully'));
        } catch (err: any) {
            console.error(err);
            error(t('wf_errorCreating') || (language === 'ar' ? 'حدث خطأ أثناء الإنشاء' : 'Error creating document type'));
        }
    };

    const handleSave = async () => {
        if (!selectedWorkflowId) {
            error(t('workflowRequired') || 'Workflow is required');
            return;
        }

        if (['Workspace', 'Folder'].includes(effectiveTargetType) && selectedDocTypes.length === 0) {
            error(t('docTypeRequired') || 'At least one document type is required');
            return;
        }

        if (selectedRoles.length === 0) {
            error(t('roleRequired') || 'At least one role is required');
            return;
        }

        // Check if workflow is already assigned
        const existingAssignment = assignments.find(a => a.workflow_id === selectedWorkflowId);
        if (existingAssignment) {
            // If editing, make sure it's not the same assignment
            if (!editingId || existingAssignment.id !== editingId) {
                error(t('workflowAlreadyAssigned') || (language === 'ar' ? 'تم تعيين سير العمل هذا بالفعل. يرجى تعديله.' : 'Workflow is already assigned. Please edit the existing assignment.'));
                return;
            }
        }

        try {
            const payload = {
                workflow_id: selectedWorkflowId,
                target_id: targetId!,
                target_type: effectiveTargetType,
                document_type_ids: effectiveTargetType === 'Document' ? [] : selectedDocTypes,
                role_ids: selectedRoles,
                exception_user_ids: selectedExceptions,
                isActive: editingId ? isAssignmentActive(assignments.find(a => a.id === editingId)) : true,
                is_active: editingId ? isAssignmentActive(assignments.find(a => a.id === editingId)) : true
            };

            if (editingId) {
                // Update
                const result = await updateAssignment(editingId, payload);
                
                if (result.success) {
                    success('assignmentUpdated');
                    fetchData();
                    setView('list');
                } else {
                     // Extract the appropriate language part from the message
                     const localizedMessage = extractLocalizedMessage(result.message);
                     error(localizedMessage || (language === 'ar' ? 'لا يمكن تحديث التعيين' : 'Cannot update assignment'));
                }
            } else {
                // Create
                const result = await createAssignment(payload);
                
                if (result.success) {
                    success('assignmentCreated');
                    fetchData();
                    setView('list');
                } else {
                    // Extract the appropriate language part from the message
                    const localizedMessage = extractLocalizedMessage(result.message);
                    error(localizedMessage || (language === 'ar' ? 'لا يمكن إضافة التعيين' : 'Cannot add assignment'));
                    // Don't refresh or close - let user see the message and try again
                }
            }
        } catch (err: any) {
            console.error(err);
            error(getErrorMessage(err));
        }
    };

    const toggleSelection = (list: string[], item: string, setList: (l: string[]) => void) => {
        if (list.includes(item)) {
            setList(list.filter(i => i !== item));
        } else {
            setList([...list, item]);
        }
    };

    if (!isOpen) return null;

    const getTriggerLabel = (tr: any) => {
        if (tr.triggerCode) {
            const def = triggerDefinitions.find(d => d.code === tr.triggerCode);
            if (def) return (language === 'ar' ? def.displayNameAr : def.displayNameEn) || def.name;
            return tr.triggerCode;
        }
        
        // Fallback for types without code
        switch (tr.type) {
            case 0: return t('manual') || (language === 'ar' ? 'يدوي' : 'Manual');
            case 1: return t('folderEvent') || (language === 'ar' ? 'حدث مجلد' : 'Folder Event');
            case 2: return t('fileFormat') || (language === 'ar' ? 'تنسيق ملف' : 'File Format');
            case 3: return t('person') || (language === 'ar' ? 'شخص' : 'Person');
            case 4: return t('workspace') || (language === 'ar' ? 'مساحة عمل' : 'Workspace');
            case 5: return t('document') || (language === 'ar' ? 'وثيقة' : 'Document');
            case 6: return t('documentType') || (language === 'ar' ? 'نوع وثيقة' : 'Document Type');
            default: return `Type ${tr.type}`;
        }
    };

    // Helper to render truncated lists of tags
    const RenderTags = ({ items, limit = 3, renderLabel, emptyLabel, tagClass }: { items: any[], limit?: number, renderLabel: (item: any) => string, emptyLabel: string, tagClass: string }) => {
        if (!items || items.length === 0) {
            return <span className="meta-tag all-tag">{emptyLabel}</span>;
        }

        const visibleItems = items.slice(0, limit);
        const remainingCount = items.length - limit;
        const remainingItemsLabel = remainingCount > 0 ? items.slice(limit).map(renderLabel).join(', ') : '';

        return (
            <>
                {visibleItems.map((item, idx) => (
                    <span key={idx} className={`meta-tag ${tagClass}`}>
                        {renderLabel(item)}
                    </span>
                ))}
                {remainingCount > 0 && (
                    <span className={`meta-tag more-tag`} data-tooltip-content={remainingItemsLabel}>
                        +{remainingCount} {t('more') || (language === 'ar' ? 'أكثر' : 'more')}
                    </span>
                )}
            </>
        );
    };

    const renderList = () => {
        const hasActiveWorkflows = workflows.some(w => w.isActive);
        return (
            <div className="assignments-list">
                {!isWorkflowMode && !hasActiveWorkflows && (
                    <div style={{ marginBottom: '16px', padding: '12px', background: '#fffbeb', color: '#b45309', borderRadius: '6px', border: '1px solid #fde68a', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                        <AlertCircle size={18} />
                        {language === 'ar' ? 'لا توجد مسارات عمل مفعلة. لا يمكنك إضافة تعيين جديد.' : 'There are no active workflows. You cannot add a new assignment.'}
                    </div>
                )}
                {!isWorkflowMode && (
                    <div className="actions-row">
                        <button 
                            className="btn-primary" 
                            onClick={handleAddNew}
                            disabled={!hasActiveWorkflows || loading}
                            style={(!hasActiveWorkflows || loading) ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                        >
                            <Plus size={18} />
                            <span>{t('addAssignment') || (language === 'ar' ? 'إضافة تعيين' : 'Add Assignment')}</span>
                        </button>
                    </div>
                )}

                {loading ? (
                    <div className="empty-state" style={{ padding: '40px', textAlign: 'center' }}>
                        <Loader size={32} color="#3b82f6" className="spinner-animation" style={{ animation: 'spin 1s linear infinite', margin: '0 auto' }} />
                        <p style={{ marginTop: '16px', color: '#64748b' }}>{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
                    </div>
                ) : assignments.length === 0 ? (
                    <div className="empty-state">
                        <Shield size={48} color="#cbd5e1" strokeWidth={1.5} style={{ marginBottom: '16px' }} />
                        <h3 style={{ fontSize: '1.1rem', color: '#1e293b', marginBottom: '8px' }}>
                            {t('noAssignmentsFound') || (language === 'ar' ? 'لا يوجد تعيينات سير عمل' : 'No workflow assignments found')}
                        </h3>
                        <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '300px', margin: '0 auto' }}>
                            {t('noAssignmentsDesc') || (language === 'ar' ? 'تسمح لك التعيينات بتشغيل سير العمل تلقائيًا عند تحميل المستندات إلى هذا الموقع.' : 'Assignments allow you to automatically trigger workflows when documents are uploaded to this location.')}
                        </p>
                    </div>
                ) : (
                    <table className="assignments-table">
                        <thead>
                            <tr>
                                <th style={{width: ['Workspace', 'Folder'].includes(effectiveTargetType) ? '20%' : '30%'}}>
                                    {t('workflow') || (language === 'ar' ? 'سير العمل' : 'Workflow')}
                                </th>
                                <th style={{width: ['Workspace', 'Folder'].includes(effectiveTargetType) ? '20%' : '25%'}}>
                                    {t('wf_triggers') || (language === 'ar' ? 'المحفزات' : 'Triggers')}
                                </th>
                                {['Workspace', 'Folder'].includes(effectiveTargetType) && (
                                    <th style={{width: '20%'}}>
                                        {t('documentTypes') || (language === 'ar' ? 'أنواع الوثائق' : 'Document Types')}
                                    </th>
                                )}
                                <th style={{width: ['Workspace', 'Folder'].includes(effectiveTargetType) ? '25%' : '30%'}}>
                                    {t('roles') || (language === 'ar' ? 'الأدوار' : 'Roles')}
                                </th>
                                <th style={{width: '15%'}}>
                                    {t('actions') || (language === 'ar' ? 'الإجراءات' : 'Actions')}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {assignments.map(a => {
                                const wf = workflows.find(w => w.id === a.workflow_id);
                                const currentActive = isAssignmentActive(a);
                                return (
                                    <tr key={a.id} style={{ opacity: (!wf || !wf.isActive) ? 0.6 : (currentActive === false ? 0.75 : 1) }}>
                                        <td>
                                            <div style={{fontWeight: 600, color: wf ? '#1e293b' : '#ef4444'}}>
                                                {wf?.name || (t('deletedWorkflow') || (language === 'ar' ? 'سير عمل محذوف' : 'Deleted Workflow'))}
                                            </div>
                                        </td>
                                        <td>
                                            <RenderTags 
                                                items={wf?.triggers || []} 
                                                renderLabel={getTriggerLabel} 
                                                emptyLabel={t('noTriggers') || (language === 'ar' ? 'لا توجد محفزات' : 'No Triggers')} 
                                                tagClass="trigger-tag"
                                                limit={2}
                                            />
                                        </td>
                                        {['Workspace', 'Folder'].includes(effectiveTargetType) && (
                                            <td>
                                                <RenderTags 
                                                    items={a.document_type_ids || []}
                                                    renderLabel={(dtId) => {
                                                        const dt = docTypes.find(d => d.id === dtId);
                                                        return dt ? ((language === 'ar' ? dt.nameAr : dt.nameEn) || dt.nameEn || dt.nameAr) : dtId;
                                                    }}
                                                    emptyLabel={t('allDocTypes') || (language === 'ar' ? 'كل الوثائق' : 'All Documents')}
                                                    tagClass="doc-tag"
                                                    limit={3}
                                                />
                                            </td>
                                        )}
                                        <td>
                                            {(a.role_ids && a.role_ids.length > 0) ? (
                                                <RenderTags 
                                                    items={a.role_ids}
                                                    renderLabel={(rId) => {
                                                        const r = roles.find(role => role.id === rId);
                                                        return r ? ((language === 'ar' ? r.nameAr : r.nameEn) || r.nameEn || r.nameAr) : rId;
                                                    }}
                                                    emptyLabel={t('allRoles') || (language === 'ar' ? 'كل الأدوار' : 'All Roles')}
                                                    tagClass="role-tag"
                                                    limit={2}
                                                />
                                            ) : (
                                                <span className="meta-text-muted" style={{fontSize: '0.85rem'}}>
                                                    {t('allRoles') || (language === 'ar' ? 'كل الأدوار' : 'All Roles')}
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="actions" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                {/* Toggle & Edit - only in target mode (toggle is always disabled in workflow mode since workflow isn't active yet) */}
                                                {!isWorkflowMode && (
                                                    <>
                                                        <button 
                                                            className={`btn-icon-sm ${(!wf || !wf.isActive) ? 'inactive-toggle' : (currentActive ? 'active-toggle' : 'inactive-toggle')}`}
                                                            onClick={(e) => { e.stopPropagation(); if (wf && wf.isActive) handleToggleActive(a); }} 
                                                            disabled={!wf || !wf.isActive}
                                                            style={{ 
                                                                color: (!wf || !wf.isActive) ? '#cbd5e1' : (currentActive ? '#10b981' : '#94a3b8'),
                                                                cursor: (!wf || !wf.isActive) ? 'not-allowed' : 'pointer',
                                                                opacity: (!wf || !wf.isActive) ? 0.6 : 1
                                                            }}
                                                            data-tooltip-content={(!wf || !wf.isActive) ? (language === 'ar' ? 'سير العمل نفسه غير مفعل' : 'Workflow itself is inactive') : (currentActive ? (language === 'ar' ? 'تعطيل التعيين' : 'Deactivate Assignment') : (language === 'ar' ? 'تفعيل التعيين' : 'Activate Assignment'))}
                                                        >
                                                            <Power size={18} />
                                                        </button>
                                                        <button 
                                                            className="btn-icon-sm" 
                                                            onClick={(e) => { e.stopPropagation(); if (wf && wf.isActive) handleEdit(a); }} 
                                                            disabled={!wf || !wf.isActive}
                                                            style={{ 
                                                                color: '#64748b',
                                                                cursor: (!wf || !wf.isActive) ? 'not-allowed' : 'pointer',
                                                                opacity: (!wf || !wf.isActive) ? 0.5 : 1
                                                            }}
                                                            data-tooltip-content={(!wf || !wf.isActive) ? (language === 'ar' ? 'لا يمكن التعديل لأن سير العمل متوقف' : 'Cannot edit because workflow is inactive') : (t('edit') || (language === 'ar' ? 'تعديل' : 'Edit'))}
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                    </>
                                                )}
                                                {/* Delete - always visible for cleanup */}
                                                <button 
                                                    className="btn-icon-sm delete" 
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(a.id); }} 
                                                    style={{ color: '#ef4444' }}
                                                    data-tooltip-content={t('delete') || (language === 'ar' ? 'حذف' : 'Delete')}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        );
    };

    const assignedWorkflowIds = assignments
        .filter(a => (!editingId || a.id !== editingId) && a.workflow_id)
        .map(a => a.workflow_id as string);

    // When editing: also include the workflow currently on this assignment (so it shows in dropdown)
    const availableWorkflows = workflows.filter(w => {
        if (!w.id || !w.isActive) return false;

        // Prevent assigning "Update" triggers to Documents on the UI
        if (effectiveTargetType === 'Document' && w.triggers?.some(t => t.triggerCode?.toLowerCase() === 'update')) {
            return false;
        }

        return (!assignedWorkflowIds.includes(w.id) || (editingId && w.id === selectedWorkflowId));
    });

    const renderForm = () => {
        if (availableWorkflows.length === 0 && !editingId) {
             return (
                 <div className="assignment-form" style={{
                     padding: '40px 20px', 
                     textAlign: 'center', 
                     display: 'flex', 
                     flexDirection: 'column', 
                     alignItems: 'center', 
                     gap: '16px',
                     background: '#f8fafc',
                     borderRadius: '8px',
                     border: '1px solid #e2e8f0',
                     margin: '20px'
                 }}>
                     <div style={{color: '#94a3b8'}}>
                        <Check size={48} />
                     </div>
                     <h3 style={{margin: 0, fontSize: '1.1rem', color: '#334155'}}>
                        {t('wf_allAssigned') || (language === 'ar' ? 'تم تعيين جميع مسارات العمل المتاحة' : 'All available workflows have been assigned')}
                     </h3>
                     <p style={{margin: 0, color: '#64748b', fontSize: '0.9rem'}}>
                        {t('wf_noMore') || (language === 'ar' ? 'لا توجد مسارات عمل إضافية لتعيينها لهذا الموقع.' : 'There are no more workflows to assign to this location.')}
                     </p>
                 </div>
             );
        }

        return (
        <div className="assignment-form">
            <div className="tabs-header">
                <button 
                    className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`}
                    onClick={() => setActiveTab('general')}
                >
                    {t('workflow') || (language === 'ar' ? 'سير العمل' : 'Workflow')}
                </button>
                {['Workspace', 'Folder'].includes(effectiveTargetType) && (
                    <button 
                        className={`tab-btn ${activeTab === 'doctypes' ? 'active' : ''}`}
                        onClick={() => setActiveTab('doctypes')}
                    >
                        {t('documentTypes') || (language === 'ar' ? 'أنواع الوثائق' : 'Document Types')}
                    </button>
                )}
                <button 
                    className={`tab-btn ${activeTab === 'roles' ? 'active' : ''}`}
                    onClick={() => setActiveTab('roles')}
                >
                    {t('roles') || (language === 'ar' ? 'الأدوار' : 'Roles')}
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'exceptions' ? 'active' : ''}`}
                    onClick={() => setActiveTab('exceptions')}
                >
                    {t('exceptions') || (language === 'ar' ? 'استثناءات' : 'Exceptions')}
                </button>
            </div>

            <div className="tab-content">
                {activeTab === 'general' && (
                    <div className="form-group">
                        <label className="form-label">{t('selectWorkflow') || (language === 'ar' ? 'اختر سير العمل' : 'Select Workflow')} *</label>
                        <select 
                            className="form-select"
                            value={selectedWorkflowId}
                            onChange={e => setSelectedWorkflowId(e.target.value)}
                        >
                            <option value="">{t('select') || (language === 'ar' ? 'اختر...' : 'Select...')}</option>
                            {availableWorkflows.map(w => (
                                <option key={w.id} value={w.id}>{w.name}</option>
                            ))}
                        </select>
                        <p className="help-text" style={{marginTop: '8px', fontSize: '0.85rem', color: '#64748b'}}>
                            {t('workflowSelectHelp') || (language === 'ar' ? 'سيتم تطبيق سير العمل هذا على الوثائق في هذا الموقع.' : 'This workflow will be applied to documents in this location.')}
                        </p>
                    </div>
                )}

                {['Workspace', 'Folder'].includes(effectiveTargetType) && activeTab === 'doctypes' && (
                    <div className="form-group">
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
                            <label className="form-label" style={{marginBottom: 0}}>
                                {t('applyToDocTypes') || (language === 'ar' ? 'تطبيق على أنواع الوثائق' : 'Apply to Document Types')}
                            </label>
                            
                            {!isCreatingDocType && (
                                <button 
                                    className="add-new-doctype-btn"
                                    onClick={() => setIsCreatingDocType(true)}
                                >
                                    <Plus size={16} />
                                    {t('wf_addNew') || (language === 'ar' ? 'إضافة جديد' : 'Add New')}
                                </button>
                            )}
                        </div>

                        {isCreatingDocType && (
                            <div className="new-doctype-form" style={{
                                padding: '16px',
                                background: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                marginBottom: '16px'
                            }}>
                                <h4 style={{margin: '0 0 12px 0', fontSize: '0.9rem', color: '#334155'}}>{t('wf_createNewDocType') || (language === 'ar' ? 'إنشاء نوع وثيقة جديد' : 'Create New Document Type')}</h4>
                                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px'}}>
                                    <div>
                                        <label style={{display: 'block', fontSize: '0.8rem', marginBottom: '6px', color: '#64748b'}}>English Name</label>
                                        <input 
                                            type="text" 
                                            className="form-input" 
                                            value={newDocType.nameEn}
                                            onChange={e => {
                                                setNewDocType({...newDocType, nameEn: e.target.value});
                                                if (docTypeErrors.nameEn) setDocTypeErrors({...docTypeErrors, nameEn: undefined});
                                            }}
                                            placeholder="e.g. Invoice"
                                            style={docTypeErrors.nameEn ? {borderColor: '#ef4444'} : {}}
                                        />
                                        {docTypeErrors.nameEn && <span style={{color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', display: 'block'}}>{docTypeErrors.nameEn}</span>}
                                    </div>
                                    <div>
                                        <label style={{display: 'block', fontSize: '0.8rem', marginBottom: '6px', color: '#64748b'}}>
                                            {language === 'ar' ? 'الاسم بالعربية' : 'Arabic Name'}
                                        </label>
                                        <input 
                                            type="text" 
                                            className="form-input" 
                                            value={newDocType.nameAr}
                                            style={{direction: 'rtl', ...(docTypeErrors.nameAr ? {borderColor: '#ef4444'} : {})}}
                                            onChange={e => {
                                                setNewDocType({...newDocType, nameAr: e.target.value});
                                                if (docTypeErrors.nameAr) setDocTypeErrors({...docTypeErrors, nameAr: undefined});
                                            }}
                                            placeholder={language === 'ar' ? "مثال: فاتورة" : "e.g. Fatora"}
                                        />
                                        {docTypeErrors.nameAr && <span style={{color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', display: 'block'}}>{docTypeErrors.nameAr}</span>}
                                    </div>
                                </div>
                                <div style={{display: 'flex', justifyContent: 'flex-end', gap: '8px'}}>
                                    <button 
                                        className="btn-secondary btn-sm"
                                        style={{padding: '6px 12px', fontSize: '0.85rem'}}
                                        onClick={() => {
                                            setIsCreatingDocType(false);
                                            setNewDocType({nameEn: '', nameAr: ''});
                                        }}
                                    >
                                        {t('cancel') || (language === 'ar' ? 'إلغاء' : 'Cancel')}
                                    </button>
                                    <button 
                                        className="btn-primary btn-sm"
                                        style={{padding: '6px 12px', fontSize: '0.85rem'}}
                                        onClick={handleCreateDocType}
                                        disabled={!newDocType.nameEn || !newDocType.nameAr}
                                    >
                                        {t('create') || (language === 'ar' ? 'إنشاء' : 'Create')}
                                    </button>
                                </div>
                            </div>
                        )}

                        <label className="checkbox-item" style={{fontWeight: 'bold', marginBottom: '8px', paddingBottom: '8px'}}>
                            <input 
                                type="checkbox"
                                checked={selectedDocTypes.length > 0 && selectedDocTypes.length === docTypes.length}
                                ref={input => {
                                    if (input) {
                                        input.indeterminate = selectedDocTypes.length > 0 && selectedDocTypes.length < docTypes.length;
                                    }
                                }}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setSelectedDocTypes(docTypes.map(dt => dt.id));
                                    } else {
                                        setSelectedDocTypes([]);
                                    }
                                }}
                            />
                            <span>{t('selectAll') || (language === 'ar' ? 'تحديد الكل' : 'Select All')}</span>
                        </label>

                        <div className="checkbox-list">
                            {docTypes.map(dt => {
                                const displayName = (language === 'ar' ? dt.nameAr : dt.nameEn) || dt.nameEn || dt.nameAr || dt.code;
                                if (!displayName) return null;
                                
                                return (
                                    <label key={dt.id} className="checkbox-item">
                                        <input 
                                            type="checkbox" 
                                            checked={selectedDocTypes.includes(dt.id)} 
                                            onChange={() => toggleSelection(selectedDocTypes, dt.id, setSelectedDocTypes)}
                                        />
                                        <span>{displayName}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                )}

                {activeTab === 'roles' && (
                    <div className="form-group">
                        <label className="form-label">{t('applyToRoles') || (language === 'ar' ? 'تطبيق على الأدوار' : 'Apply to Roles')}</label>
                        <p className="help-text" style={{marginBottom: '10px', fontSize: '0.85rem', color: '#64748b'}}>
                            {t('leaveEmptyForAllRoles') || (language === 'ar' ? 'اتركه فارغًا للتطبيق على جميع الأدوار التي تسبب إجراءات.' : 'Leave empty to apply to all roles causing actions.')}
                        </p>
                        <div className="checkbox-list">
                            {roles.map(r => {
                                const displayName = (language === 'ar' ? r.nameAr : r.nameEn) || r.nameEn || r.nameAr || r.code;
                                if (!displayName) return null;
                                
                                return (
                                    <label key={r.id} className="checkbox-item">
                                        <input 
                                            type="checkbox" 
                                            checked={selectedRoles.includes(r.id)} 
                                            onChange={() => toggleSelection(selectedRoles, r.id, setSelectedRoles)}
                                        />
                                        <span>{displayName}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                )}

                {activeTab === 'exceptions' && (
                    <div className="form-group">
                        <label className="form-label">{t('excludeUsers') || (language === 'ar' ? 'استبعاد المستخدمين' : 'Exclude Users')}</label>
                        <p className="help-text" style={{marginBottom: '10px', fontSize: '0.85rem', color: '#64748b'}}>
                            {t('selectUsersToExclude') || (language === 'ar' ? 'اختر المستخدمين الذين يجب استبعادهم من تعيين سير العمل هذا.' : 'Select users who should be excluded from this workflow assignment.')}
                        </p>
                        <input 
                            type="text" 
                            placeholder={t('searchUsers') || (language === 'ar' ? 'البحث عن مستخدمين...' : 'Search users...')}
                            className="form-input"
                            style={{marginBottom: '10px'}}
                            onChange={(e) => {
                                // Filter logic could be implemented here if the list is long
                            }}
                        />
                        <div className="checkbox-list">
                            {users.map(u => {
                                const displayName = (language === 'ar' ? u.nameAr : u.nameEn) || u.nameEn || u.nameAr || u.name;
                                if (!displayName) return null;

                                return (
                                    <label key={u.id} className="checkbox-item">
                                        <input 
                                            type="checkbox" 
                                            checked={selectedExceptions.includes(String(u.id))} 
                                            onChange={() => toggleSelection(selectedExceptions, String(u.id), setSelectedExceptions)}
                                        />
                                        <span>{displayName}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
    };

    return ReactDOM.createPortal(
        <div className="workflow-assignment-modal-overlay" onClick={onClose}>
            <div className={`workflow-assignment-modal ${language === 'ar' ? 'rtl' : ''}`} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>
                        {view === 'list' 
                            ? isWorkflowMode
                                ? `${language === 'ar' ? 'تعيينات' : 'Assignments'}: ${workflowName || ''}`
                                : (t('workflowAssignments') || (language === 'ar' ? 'تعيينات سير العمل' : 'Workflow Assignments'))
                            : (editingId ? (t('editAssignment') || (language === 'ar' ? 'تعديل التعيين' : 'Edit Assignment')) : (t('newAssignment') || (language === 'ar' ? 'تعيين جديد' : 'New Assignment')))
                        }
                    </h2>
                    <button className="modal-close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>
                
                <div className="modal-body">
                    {loading ? (
                        <div className="loading-state">{t('loading') || (language === 'ar' ? 'جاري التحميل...' : 'Loading...')}</div>
                    ) : (
                        view === 'list' ? renderList() : renderForm()
                    )}
                </div>

                {view === 'form' && (
                    <div className="modal-footer">
                        <button className="btn-secondary" onClick={() => setView('list')}>
                            {t('cancel') || (language === 'ar' ? 'إلغاء' : 'Cancel')}
                        </button>
                        {(availableWorkflows.length > 0 || editingId) && (
                            <button className="btn-primary" onClick={handleSave}>
                                {t('save') || (language === 'ar' ? 'حفظ' : 'Save')}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
};

export default WorkflowAssignmentModal;
