import React, { useState, useEffect } from 'react';
import { 
    X, 
    ChevronRight, 
    ChevronDown, 
    Folder, 
    FileText, 
    Briefcase,
    Loader2,
    Check,
    User,
    Users,
    File as FileIcon,
    Zap
} from 'lucide-react';
import { getWorkspaces, getWorkspaceChildren, WorkspaceChild } from '../../api/workspaces';
import { getDocumentsByWorkspaceId, Document, getDocuments } from '../../api/documents';
import { WorkflowTriggerType, WorkflowTriggerDefinition, getTriggerDefinitions } from '../../api/workflows';
import { getAllDocumentTypes, DocumentTypeDto } from '../../api/documentTypes';
import { getAllProfileUsers, ProfileUser } from '../../api/profiles';
import { useLanguage } from '../../contexts/LanguageContext';

export interface SelectedItem {
    type: WorkflowTriggerType | 'role' | 'event';
    id: string;
    name: string;
    path: string;
    triggerCode?: string;
}

interface ResourcePickerProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (items: SelectedItem[]) => void;
    title?: string; // Optional: title is dynamic via props, defaults will be handled in render
    initialSelection?: SelectedItem[];
}

interface TreeNode {
    id: string;
    name: string;
    type: 'workspace' | 'folder' | 'document';
    path: string; // Breadcrumb path
    hasChildren?: boolean;
    children?: TreeNode[];
    isExpanded?: boolean;
    isLoading?: boolean;
}

type TabType = 'workspace' | 'doctype' | 'people' | 'roles' | 'events';

const DEFINED_ROLES = [
    { id: 'Manager', name: 'Manager', description: 'Department or Team Manager' },
    { id: 'Reviewer', name: 'Reviewer', description: 'Assigned Reviewer' },
    { id: 'Editor', name: 'Editor', description: 'Content Editor' },
    { id: 'Viewer', name: 'Viewer', description: 'Read-only Access' },
    { id: 'Admin', name: 'Admin', description: 'System Administrator' },
    { id: 'Legal', name: 'Legal', description: 'Legal Department' }
];

export default function ResourcePicker({ isOpen, onClose, onConfirm, title, initialSelection }: ResourcePickerProps) {
    const { t, language } = useLanguage();
    const [activeTab, setActiveTab] = useState<TabType>('workspace');
    
    // Workspace Tree State
    const [roots, setRoots] = useState<TreeNode[]>([]);
    const [loadingTree, setLoadingTree] = useState(false);
    
    // Lists State
    const [docTypes, setDocTypes] = useState<DocumentTypeDto[]>([]);
    const [users, setUsers] = useState<ProfileUser[]>([]);
    const [roles] = useState(DEFINED_ROLES);
    const [triggerDefs, setTriggerDefs] = useState<WorkflowTriggerDefinition[]>([]);
    const [loadingList, setLoadingList] = useState(false);

    const [selectedItems, setSelectedItems] = useState<Map<string, SelectedItem>>(new Map());
    
    useEffect(() => {
        if (isOpen) {
            loadRoots();
            // Initialize selection from props
            const map = new Map<string, SelectedItem>();
            if (initialSelection) {
                initialSelection.forEach(item => map.set(item.id, item));
            }
            setSelectedItems(map);
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            if (activeTab === 'doctype') loadDocTypes();
            if (activeTab === 'people') loadUsers();
            if (activeTab === 'events') loadTriggerDefs();
        }
    }, [activeTab, isOpen]);

    const loadRoots = async () => {
        try {
            setLoadingTree(true);
            const workspaces = await getWorkspaces();
            const nodes: TreeNode[] = workspaces.map(ws => ({
                id: ws.id || '',
                name: ws.name,
                type: 'workspace',
                path: ws.name,
                hasChildren: true,
                children: [],
                isExpanded: false
            }));
            setRoots(nodes);
        } catch (e) {
            console.error("Failed to load workspaces", e);
        } finally {
            setLoadingTree(false);
        }
    };

    const loadDocTypes = async () => {
        if (docTypes.length > 0) return;
        try {
            setLoadingList(true);
            const data = await getAllDocumentTypes();
            setDocTypes(data);
        } catch (e) {
            console.error("Failed to load doc types", e);
        } finally {
            setLoadingList(false);
        }
    }

    const loadUsers = async () => {
        if (users.length > 0) return;
        try {
            setLoadingList(true);
            const data = await getAllProfileUsers();
            setUsers(data);
        } catch (e) {
            console.error("Failed to load users", e);
        } finally {
            setLoadingList(false);
        }
    }

    const loadTriggerDefs = async () => {
        if (triggerDefs.length > 0) return;
        try {
            setLoadingList(true);
            const data = await getTriggerDefinitions();
            setTriggerDefs(data);
        } catch (e) {
            console.error("Failed to load trigger definitions", e);
        } finally {
            setLoadingList(false);
        }
    }

    const toggleNode = async (node: TreeNode, path: number[]) => {
        if (!node.isExpanded) {
            // Expand
            if ((!node.children || node.children.length === 0)) {
                if (node.type === 'workspace') {
                     updateNode(path, { isLoading: true });
                     try {
                         const [children, docs] = await Promise.all([
                             getWorkspaceChildren(node.id).catch(e => []),
                             getDocumentsByWorkspaceId(node.id).catch(e => [])
                         ]);

                         const allNodes: TreeNode[] = children.map(c => ({
                             id: c.id,
                             name: c.name,
                             type: c.isDir || c.type === 'Folder' || c.type === 'folder' ? 'folder' : 'document',
                             path: `${node.path} / ${c.name}`,
                             hasChildren: c.isDir || c.type === 'Folder' || c.type === 'folder',
                             children: [],
                             isExpanded: false,
                             parentId: c.parentId
                         } as any));

                         const existingIds = new Set(allNodes.map(n => n.id));
                         const docNodes: TreeNode[] = docs
                            .filter(d => !existingIds.has(d.id))
                            .map(d => ({
                                id: d.id,
                                name: d.title,
                                type: 'document',
                                path: `${node.path} / ${d.title}`,
                                hasChildren: false,
                                children: [],
                                isExpanded: false,
                                parentId: d.parent_id || (d as any).parentId
                            } as any));
                         
                         const nodeMap = new Map<string, TreeNode>();
                         [...allNodes, ...docNodes].forEach(n => nodeMap.set(n.id, n));
                         const rootChildren: TreeNode[] = [];
                         
                         [...allNodes, ...docNodes].forEach(n => {
                             const pId = (n as any).parentId;
                             if (pId && nodeMap.has(pId)) {
                                 const parent = nodeMap.get(pId)!;
                                 if (!parent.children) parent.children = [];
                                 parent.children.push(n);
                                 n.path = `${parent.path} / ${n.name}`;
                             } else {
                                 rootChildren.push(n);
                             }
                         });

                         updateNode(path, { isExpanded: true, isLoading: false, children: rootChildren });
                     } catch (err) {
                         console.error("Failed to load workspace children", err);
                         updateNode(path, { isLoading: false, isExpanded: true }); 
                     }
                } 
                else if (node.type === 'folder') {
                    updateNode(path, { isLoading: true });
                        try {
                            const children = await getWorkspaceChildren(node.id).catch(() => []);
                            // Fallback fetch logic omitted for brevity in this update, assuming main flow works
                             const uniqueChildren: TreeNode[] = children.map(c => ({
                                id: c.id,
                                name: c.name,
                                type: c.isDir || c.type === 'Folder' || c.type === 'folder' ? 'folder' : 'document',
                                path: `${node.path} / ${c.name}`,
                                hasChildren: c.isDir || c.type === 'Folder' || c.type === 'folder',
                                children: [],
                                isExpanded: false
                            } as any));

                            updateNode(path, { isExpanded: true, isLoading: false, children: uniqueChildren });
                        } catch (e) {
                             console.warn("Failed to load folder children", e);
                             updateNode(path, { isLoading: false, isExpanded: true });
                        }
                } else {
                    updateNode(path, { isExpanded: true });
                }

            } else {
                updateNode(path, { isExpanded: true });
            }
        } else {
             updateNode(path, { isExpanded: false });
        }
    };

    const updateNode = (path: number[], updates: Partial<TreeNode>) => {
        setRoots(prev => updateNodeRecursive(prev, path, updates));
    };

    const updateNodeRecursive = (nodes: TreeNode[], path: number[], updates: Partial<TreeNode>): TreeNode[] => {
        if (path.length === 0) return nodes;
        const index = path[0];
        const node = nodes[index];
        const newNode = { ...node };

        if (path.length === 1) {
            Object.assign(newNode, updates);
        } else {
            if (newNode.children) {
                newNode.children = updateNodeRecursive(newNode.children, path.slice(1), updates);
            }
        }
        
        const newNodes = [...nodes];
        newNodes[index] = newNode;
        return newNodes;
    };

    const toggleSelection = (id: string, item: SelectedItem) => {
        const newMap = new Map(selectedItems);
        if (newMap.has(id)) {
            newMap.delete(id);
        } else {
            newMap.set(id, item);
        }
        setSelectedItems(newMap);
    };

    const handleSelectAll = (items: any[], type: 'doctype' | 'people' | 'roles' | 'events') => {
        const allIds = items.map(item => {
            if (type === 'doctype') return item.id;
            if (type === 'people') return item.vaultUserId || String(item.id);
            return item.id; // roles
        });
        const allSelected = allIds.every(id => selectedItems.has(id));

        const newMap = new Map(selectedItems);
        items.forEach(item => {
            const id = type === 'doctype' ? item.id : (item.vaultUserId || String(item.id));
            if (!allSelected) {
                // Select all
                let name = '';
                if (type === 'events') {
                    name = language === 'ar' ? (item.displayNameAr || item.name) : (item.displayNameEn || item.name);
                } else if (type === 'roles') {
                    name = item.name;
                } else {
                    name = language === 'ar' ? (item.nameAr || item.nameEn) : (item.nameEn || item.nameAr);
                    if (!name && item.name) name = item.name;
                }
                
                newMap.set(id, {
                    type: type === 'doctype' ? WorkflowTriggerType.DocumentType : (type === 'roles' ? 'role' : (type === 'events' ? 'event' : WorkflowTriggerType.Person)),
                    id,
                    name,
                    path: name,
                    triggerCode: type === 'events' ? item.code : undefined
                });
            } else {
                // Deselect all
                newMap.delete(id);
            }
        });
        setSelectedItems(newMap);
    };

    const handleSelectAllWorkspaces = () => {
         const allSelected = roots.length > 0 && roots.every(node => selectedItems.has(node.id));
         const newMap = new Map(selectedItems);
         
         roots.forEach(node => {
             if (!allSelected) {
                 newMap.set(node.id, {
                     type: WorkflowTriggerType.Workspace,
                     id: node.id,
                     name: node.name,
                     path: node.name
                 });
             } else {
                 newMap.delete(node.id);
             }
         });
         setSelectedItems(newMap);
    };

    const handleConfirm = () => {
        onConfirm(Array.from(selectedItems.values()));
        onClose();
    };

    if (!isOpen) return null;

    const renderTree = (nodes: TreeNode[], path: number[] = []) => {
        const isRoot = path.length === 0;
        const allSelected = isRoot && nodes.length > 0 && nodes.every(node => selectedItems.has(node.id));

        return (
            <div style={{ marginLeft: path.length > 0 ? 12 : 0, borderLeft: path.length > 0 ? '1px solid #e2e8f0' : 'none' }}>
                {isRoot && (
                    <div 
                        style={{ 
                            display: 'flex', alignItems: 'center', padding: '8px 12px', cursor: 'pointer', 
                            borderRadius: 6, background: '#f8fafc', border: '1px solid #e2e8f0', marginBottom: 12, 
                            fontWeight: 600, color: '#475569', gap: 12
                        }}
                        onClick={handleSelectAllWorkspaces}
                    >
                         <input 
                            type="checkbox" 
                            checked={allSelected} 
                            readOnly 
                            style={{ width: 16, height: 16, cursor: 'pointer', accentColor: '#c3924d' }} 
                         />
                         <span>{allSelected ? t('deselectAll') : t('selectAll')}</span>
                    </div>
                )}
                {nodes.map((node, idx) => {
                    const currentPath = [...path, idx];
                    const Icon = node.type === 'workspace' ? Briefcase : (node.type === 'folder' ? Folder : FileText);
                    const iconColor = node.type === 'workspace' ? '#c3924d' : (node.type === 'folder' ? '#f59e0b' : '#94a3b8');
                    const isSelected = selectedItems.has(node.id);

                    return (
                        <div key={node.id}>
                            <div 
                                style={{ display: 'flex', alignItems: 'center', padding: '6px 8px', cursor: 'pointer', borderRadius: 4, background: isSelected ? '#f0f9ff' : 'transparent', gap: 8 }}
                                className="tree-node-row"
                                onClick={() => {
                                    let type = WorkflowTriggerType.Manual;
                                    if (node.type === 'workspace') type = WorkflowTriggerType.Workspace;
                                    if (node.type === 'folder') type = WorkflowTriggerType.FolderEvent;
                                    if (node.type === 'document') type = WorkflowTriggerType.Document;
                                    toggleSelection(node.id, { type, id: node.id, name: node.name, path: node.path });
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <input type="checkbox" checked={isSelected} readOnly style={{ width: 16, height: 16, cursor: 'pointer', accentColor: '#c3924d' }} />
                                </div>
                                <div 
                                    style={{ width: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', visibility: node.type === 'document' ? 'hidden' : 'visible' }}
                                    onClick={(e) => { e.stopPropagation(); toggleNode(node, currentPath); }}
                                >
                                    {node.isLoading ? <Loader2 size={12} className="spin" /> : (node.isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}
                                </div>
                                <Icon size={16} color={iconColor} fill={node.type !== 'document' ? iconColor : 'none'} style={{ marginRight: 8, opacity: node.type==='document' ? 0.8 : 1 }} />
                                <span style={{ fontSize: 13, flex: 1, userSelect: 'none', color: '#1e293b' }}>{node.name}</span>
                            </div>
                            {node.isExpanded && node.children && (
                                <div>
                                    {renderTree(node.children, currentPath)}
                                    {node.children.length === 0 && !node.isLoading && <div style={{ fontSize: 11, color: '#94a3b8', paddingLeft: 34, paddingBottom: 4 }}>{t('empty')}</div>}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderList = (items: any[], type: 'doctype' | 'people' | 'roles' | 'events') => {
        const allIds = items.map(item => {
            if (type === 'doctype') return item.id;
            if (type === 'people') return item.vaultUserId || String(item.id);
            return item.id;
        });
        const allSelected = items.length > 0 && allIds.every(id => selectedItems.has(id));

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {/* Select All Header */}
                <div 
                    style={{ 
                        display: 'flex', alignItems: 'center', padding: '8px 12px', cursor: 'pointer', 
                        borderRadius: 6, background: '#f8fafc', border: '1px solid #e2e8f0', marginBottom: 8, 
                        fontWeight: 600, color: '#475569', gap: 12
                    }}
                    onClick={() => handleSelectAll(items, type)}
                >
                     <input 
                        type="checkbox" 
                        checked={allSelected} 
                        readOnly 
                        style={{ width: 16, height: 16, accentColor: '#c3924d' }} 
                     />
                     <span>{allSelected ? t('deselectAll') : t('selectAll')}</span>
                </div>

                {items.map(item => {
                    let id = item.id;
                    if (type === 'people') id = item.vaultUserId || String(item.id);
                    
                    let name = '';
                    if (type === 'events') {
                        name = language === 'ar' ? (item.displayNameAr || item.name) : (item.displayNameEn || item.name);
                    } else if (type === 'roles') {
                        name = item.name;
                    } else {
                        // doctype and people use nameAr / nameEn
                        name = language === 'ar' ? (item.nameAr || item.nameEn) : (item.nameEn || item.nameAr);
                    }
                    
                    const isSelected = selectedItems.has(id);
                    const Icon = type === 'doctype' ? FileIcon : (type === 'roles' ? Briefcase : (type === 'events' ? Zap : User));
                    
                    return (
                        <div 
                            key={id}
                            style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', cursor: 'pointer', borderRadius: 6, background: isSelected ? '#f0f9ff' : 'white', border: '1px solid #f1f5f9', gap: 12 }}
                            onClick={() => {
                                toggleSelection(id, { 
                                    type: type === 'doctype' ? WorkflowTriggerType.DocumentType : (type === 'roles' ? 'role' : (type === 'events' ? 'event' : WorkflowTriggerType.Person)), 
                                    id, 
                                    name, 
                                    path: name,
                                    triggerCode: type === 'events' ? item.code : undefined
                                });
                            }}
                        >
                            <input type="checkbox" checked={isSelected} readOnly style={{ width: 16, height: 16, accentColor: '#c3924d' }} />
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {type === 'doctype' && item.icon ? <span style={{fontSize: 16}}>{item.icon}</span> : <Icon size={16} color="#64748b" />}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: 14, fontWeight: 500, color: '#1e293b' }}>{name}</span>
                                {type === 'doctype' && item.description && <span style={{ fontSize: 12, color: '#64748b' }}>{item.description}</span>}
                                {type === 'people' && <span style={{ fontSize: 12, color: '#64748b' }}>{item.email || item.type}</span>}
                                {type === 'roles' && <span style={{ fontSize: 12, color: '#64748b' }}>{item.description}</span>}
                            </div>
                        </div>
                    )
                })}
            </div>
        )
    }

    // Logic for exclusive tabs:
    // If Workspace or Folder selected -> Keep all tabs (User request: "seeb kol el tabs")
    // If ONLY Files selected (no workspace/folder) -> Hide "Document Types" tab (User request: "sheel el tab bta3et el anwa3")
    
    const selectedValues = Array.from(selectedItems.values());
    const hasWorkspace = selectedValues.some(i => i.type === WorkflowTriggerType.Workspace);
    const hasFolder = selectedValues.some(i => i.type === WorkflowTriggerType.FolderEvent);
    const hasDocument = selectedValues.some(i => i.type === WorkflowTriggerType.Document);
    
    const isFilesOnly = hasDocument && !hasWorkspace && !hasFolder;

    return (
        <div className="modal-overlay" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1000}}>
            <div className="modal" style={{ width: 800, maxWidth: '95vw', height: '85vh', display: 'flex', flexDirection: 'column', padding: 0 }}>
                {/* Header */}
                <div className="modal-header" style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{title || t('selectTriggersScope')}</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', width: '100%', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', padding: '0 24px' }}>
                    <TabButton active={activeTab === 'workspace'} onClick={() => setActiveTab('workspace')} icon={Briefcase} label={t('workspacesFiles')} />
                    
                    {!isFilesOnly && (
                         <TabButton active={activeTab === 'doctype'} onClick={() => setActiveTab('doctype')} icon={FileText} label={t('documentTypes')} />
                    )}
                    
                    <TabButton active={activeTab === 'people'} onClick={() => setActiveTab('people')} icon={Users} label={t('users')} />
                    <TabButton active={activeTab === 'roles'} onClick={() => setActiveTab('roles')} icon={Briefcase} label={t('roles')} />
                    <TabButton active={activeTab === 'events'} onClick={() => setActiveTab('events')} icon={Zap} label={t('triggers')} />
                </div>
                
                {/* Content */}
                <div style={{ flex: 1, overflowY: 'auto', padding: 24, background: 'white' }}>
                    {activeTab === 'workspace' && (
                        loadingTree && roots.length === 0 ? <Loading /> : renderTree(roots)
                    )}
                    
                    {activeTab === 'doctype' && (
                        loadingList && docTypes.length === 0 ? <Loading /> : renderList(docTypes, 'doctype')
                    )}

                    {activeTab === 'people' && (
                        loadingList && users.length === 0 ? <Loading /> : renderList(users, 'people')
                    )}

                     {activeTab === 'roles' && (
                         renderList(roles, 'roles')
                    )}

                    {activeTab === 'events' && (
                         loadingList && triggerDefs.length === 0 ? <Loading /> : renderList(triggerDefs, 'events')
                    )}
                </div>

                {/* Footer */}
                <div className="modal-footer" style={{ padding: '16px 20px', borderTop: '1px solid #e2e8f0', justifyContent: 'space-between', display: 'flex', background: 'white' }}>
                    <span style={{ fontSize: 13, color: '#64748b' }}>{t('selectedItemsCount').replace('{count}', String(selectedItems.size))}</span>
                    <div style={{ display: 'flex', gap: 8 }}>
                         <button className="btn-secondary" onClick={onClose}>{t('cancel')}</button>
                         <button className="btn-primary" onClick={handleConfirm} disabled={selectedItems.size === 0}>
                             {t('addSelected')}
                         </button>
                    </div>
                </div>
            </div>
            <style>{`
                .tree-node-row:hover { background-color: #f1f5f9; }
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}

const TabButton = ({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) => (
    <button 
        onClick={onClick}
        style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '16px',
            flex: 1,
            background: 'none', border: 'none',
            borderBottom: active ? '2px solid #c3924d' : '2px solid transparent',
            color: active ? '#c3924d' : '#64748b',
            fontWeight: active ? 600 : 400,
            cursor: 'pointer', fontSize: 13,
            transition: 'all 0.2s'
        }}
    >
        <Icon size={16} /> {label}
    </button>
);

const Loading = () => (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
        <Loader2 className="spin" color="#c3924d" />
    </div>
);
