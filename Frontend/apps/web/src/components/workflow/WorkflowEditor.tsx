
import React, { useState, useCallback, useEffect } from 'react';
import { 
  Node, 
  Edge, 
  applyNodeChanges, 
  applyEdgeChanges, 
  addEdge, 
  Connection,
  MarkerType 
} from 'reactflow';
import { ArrowLeft, Save, FileText, Settings, X, AlertCircle, GitBranch, Plus, Briefcase, Folder, User, File as FileIcon, Tag, Trash2, Zap } from 'lucide-react';
import './WorkflowEditor.css';
import WorkflowFlowDesigner from './WorkflowFlowDesigner';
import WorkflowFormBuilder, { FormField } from './WorkflowFormBuilder';
import WorkflowTriggerBuilder from '../WorkflowTriggerBuilder';
import { Workflow, WorkflowStep, WorkflowStepType, WorkflowActionType, WorkflowTrigger, WorkflowTriggerType, ActionDefinition, getWorkflowActions, WorkflowEdgeConfig, WorkflowTransitionForms, getEvents, WorkflowEventDefinition } from '../../api/workflows';
import { getAllProfileUsers, ProfileUser } from '../../api/profiles';
import { useLanguage } from '../../contexts/LanguageContext';
import { getWorkspaces, Workspace } from '../../api/workspaces';
import ResourcePicker, { SelectedItem } from './ResourcePicker';
import { getAllRoles, RoleDto } from '../../api/roles';
import Select from 'react-select';

interface UITrigger {
  uid: string; // Unique ID for UI tracking
  type: WorkflowTriggerType;
  value: string;
  path?: string; // Display path/name
  groupId?: string; // Grouping ID
  triggerCode?: string;
}

interface WorkflowEditorProps {
  initialWorkflow?: Workflow;
  onSave: (workflow: Workflow) => Promise<void>;
  onClose: () => void;
}

export default function WorkflowEditor({ initialWorkflow, onSave, onClose }: WorkflowEditorProps) {
  const { t, language } = useLanguage();
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  
  // UI State
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [availableActions, setAvailableActions] = useState<ActionDefinition[]>([]);
  const [availableEvents, setAvailableEvents] = useState<WorkflowEventDefinition[]>([]);
  const [availableUsers, setAvailableUsers] = useState<ProfileUser[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [availableRoles, setAvailableRoles] = useState<RoleDto[]>([]);

  // Picker State
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  
  const [name, setName] = useState(initialWorkflow?.name || '');
  const [description, setDescription] = useState(initialWorkflow?.description || '');
  const [uiTriggers, setUiTriggers] = useState<UITrigger[]>(() => {
      if (!initialWorkflow?.triggers) return [];
      // Initial mapping (Assign group IDs if missing to preserve logical sets if any)
      return initialWorkflow.triggers.map(t => ({
          uid: crypto.randomUUID(),
          type: t.type,
          value: t.value || '',
          groupId: t.groupId,
          triggerCode: t.triggerCode
      }));
  });

  // ReactFlow State
  const [nodes, setNodes] = useState<Node[]>(() => {
      if (initialWorkflow) return [];
      return [
          { id: 'node-start', type: 'start', position: { x: 350, y: 50 }, data: { label: 'Start' } },
          { id: 'node-end', type: 'end', position: { x: 350, y: 350 }, data: { label: 'End' } }
      ];
  });
  const [edges, setEdges] = useState<Edge[]>([]);

  // Selection
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

  // Forms State: Map stepId -> FormFields
  const [stepForms, setStepForms] = useState<Record<string, FormField[]>>({});

  // Edge Config State: Map "SourceId|TargetId" -> WorkflowEdgeConfig
  const [edgeConfigs, setEdgeConfigs] = useState<Record<string, WorkflowEdgeConfig>>({});
  const [activeEdgeTab, setActiveEdgeTab] = useState<'during' | 'after'>('during');
  const [isFormBuilderOpen, setIsFormBuilderOpen] = useState(false);

  // Initialize from Props
  // Fetch definitions on mount
  useEffect(() => {
    const fetchActions = async () => {
        try {
            const actions = await getWorkflowActions();
            setAvailableActions(actions);
        } catch (error) {
            console.error("Failed to fetch workflow actions", error);
        }
    };
    const fetchUsers = async () => {
        try {
            const users = await getAllProfileUsers();
            // Only keep users with Vault IDs (active in Vault)
            setAvailableUsers(users.filter(u => u.vaultUserId));
        } catch (error) {
            console.error("Failed to fetch users", error);
        }
    };
    const fetchWorkspaces = async () => {
        try {
            const ws = await getWorkspaces();
            setWorkspaces(ws);
        } catch (error) {
            console.error("Failed to fetch workspaces", error);
        }
    };
    const fetchRoles = async () => {
        try {
            const roles = await getAllRoles();
            setAvailableRoles(roles);
        } catch (error) {
            console.error("Failed to fetch roles", error);
        }
    };
    const fetchEvents = async () => {
        try {
            const evts = await getEvents();
            setAvailableEvents(evts);
        } catch (error) {
            console.error("Failed to fetch events", error);
        }
    };

    fetchActions();
    fetchUsers();
    fetchWorkspaces();
    fetchEvents();
    fetchRoles();
  }, []);

  // Initialize from Props (Workflow Parsing)
  useEffect(() => {
    if (initialWorkflow) {
      // Restore Nodes & Edges from saved steps
      const loadedNodes: Node[] = [];
      const explicitEdges: Edge[] = [];
      const loadedForms: Record<string, FormField[]> = {};
      const loadedEdgeConfigs: Record<string, WorkflowEdgeConfig> = {};
      
      // Tracking connections to avoid duplicates from fallback logic
      const existingConnections = new Set<string>();

      // First Pass: Create Nodes and Collect Explicit Edges (uiMetadata)
      initialWorkflow.steps.forEach(step => {

         const position = step.uiMetadata?.position || { x: 0, y: 0 };
         
         let type = step.uiMetadata?.nodeType || 'task';
         if (!step.uiMetadata?.nodeType) {
             if (step.type === WorkflowStepType.Start) type = 'start';
             else if (step.type === WorkflowStepType.End) type = 'end';
             else if (step.type === WorkflowStepType.Logic) type = 'decision';
         }
         
         if (step.uiMetadata?.formFields) {
             loadedForms[step.stepId] = step.uiMetadata.formFields;
         }

         if (step.edgeConfigs) {
             Object.entries(step.edgeConfigs).forEach(([sourceId, config]) => {
                 loadedEdgeConfigs[`${sourceId}|${step.stepId}`] = config;
             });
         }

         loadedNodes.push({
             id: step.stepId,
             type: type,
             position,
             data: {
                 label: step.title,
                 description: step.actionConfig?.instructions,
                 assignee: step.actionConfig?.assigneeId,
                 assigneeRole: step.actionConfig?.assigneeRole,
                 assigneeRoleId: step.actionConfig?.assigneeRoleId,
                 isEditAction: step.actionConfig?.actionType === WorkflowActionType.Edit,
                 actionCode: step.actionConfig?.actionCode,
                 ...step.uiMetadata?.data 
             }
         });

         if (step.uiMetadata?.connections) {
             step.uiMetadata.connections.forEach((conn: any) => {
                 const edgeColor = conn.sourceHandle === 'yes' ? '#10b981' : (conn.sourceHandle === 'no' ? '#ef4444' : '#b1b1b7');
                 explicitEdges.push({
                     id: conn.id,
                     source: conn.source,
                     target: conn.target,
                     sourceHandle: conn.sourceHandle,
                     type: 'smoothstep',
                     markerEnd: { type: MarkerType.ArrowClosed, color: edgeColor },
                     style: { stroke: edgeColor, strokeWidth: 2 },
                     labelShowBg: true,
                     labelBgPadding: [8, 4],
                     labelBgBorderRadius: 6,
                     labelBgStyle: { fill: '#ffffff', fillOpacity: 1, stroke: '#e2e8f0', strokeWidth: 1 },
                     labelStyle: { fill: '#1e293b', fontWeight: 600, fontSize: 12 },
                     animated: true,
                     data: { isStartEdge: loadedNodes.find(n => n.id === conn.source)?.type === 'start' },
                     label: loadedNodes.find(n => n.id === conn.source)?.type === 'start' ? (t('addTrigger') || '+ Add Trigger') : undefined
                 });
                 existingConnections.add(`${conn.source}|${conn.target}`);
             });
         }
      });

      // Second Pass: Fallback Edges from dependsOn
      const finalEdges = [...explicitEdges];
      
      initialWorkflow.steps.forEach(step => {
         if (step.dependsOn) {
             step.dependsOn.forEach(depId => {
                 if (!existingConnections.has(`${depId}|${step.stepId}`)) {
                    finalEdges.push({
                         id: `e-${depId}-${step.stepId}`,
                         source: depId,
                         target: step.stepId,
                         type: 'smoothstep',
                         markerEnd: { type: MarkerType.ArrowClosed, color: '#b1b1b7' },
                         style: { stroke: '#b1b1b7', strokeWidth: 2 },
                         labelShowBg: true,
                         labelBgPadding: [8, 4],
                         labelBgBorderRadius: 6,
                         labelBgStyle: { fill: '#ffffff', fillOpacity: 1, stroke: '#e2e8f0', strokeWidth: 1 },
                         labelStyle: { fill: '#94a3b8', fontWeight: 600, fontSize: 12 },
                         data: { isStartEdge: loadedNodes.find(n => n.id === depId)?.type === 'start' },
                         label: loadedNodes.find(n => n.id === depId)?.type === 'start' ? (t('addTrigger') || '+ Add Trigger') : undefined
                     });
                     existingConnections.add(`${depId}|${step.stepId}`);
                 }
             });
         }
      });

      // Auto Layout Check - only if positions are not saved
      // Check if any node has a non-zero position (meaning positions were saved)
      const hasValidPositions = loadedNodes.some(n => n.position.x !== 0 || n.position.y !== 0);
      const needsLayout = !hasValidPositions && loadedNodes.length > 0;
      
      console.log('Loading workflow:', {
          nodeCount: loadedNodes.length,
          hasValidPositions,
          needsLayout,
          positions: loadedNodes.map(n => ({ id: n.id, pos: n.position }))
      });

      setNodes(loadedNodes);
      setEdges(finalEdges);

      // LEGACY MIGRATION: 
      // If workflow has global triggers but no edge triggers on start connection, move them to the start edge.
      if (initialWorkflow.triggers && initialWorkflow.triggers.length > 0) {
          const startStep = loadedNodes.find(n => n.type === 'start' || n.type === 'Start');
          if (startStep) {
              const startExEdge = finalEdges.find(e => e.source === startStep.id);
              if (startExEdge) {
                  const key = `${startExEdge.source}|${startExEdge.target}`;
                  if (!loadedEdgeConfigs[key]) loadedEdgeConfigs[key] = { label: '' };
                  // Only migrate if edge has NO triggers
                  if (!loadedEdgeConfigs[key].triggers || loadedEdgeConfigs[key].triggers.length === 0) {
                      loadedEdgeConfigs[key].triggers = initialWorkflow.triggers;
                  }
              }
          }
      }

      setStepForms(loadedForms);
      setEdgeConfigs(loadedEdgeConfigs);

      setName(initialWorkflow.name || '');
      setDescription(initialWorkflow.description || '');
      setUiTriggers([]); // Global triggers are removed from UI
      
      // Only apply auto layout if positions were not saved
      if (needsLayout) {
          setTimeout(() => {
              const btn = document.getElementById('btn-auto-layout');
              if(btn) btn.click();
          }, 100);
      }
    }
   }, [initialWorkflow]);

  // Update node labels when language or available actions/users change
  useEffect(() => {
      if (nodes.length > 0) {
          setNodes(nds => nds.map(node => {
              let newData = { ...node.data };
              let changed = false;

              // 1. Update Label from Action Definition
              if (node.type === 'task' && node.data.actionCode && availableActions.length > 0) {
                  const action = availableActions.find(a => a.code === node.data.actionCode);
                  if (action) {
                       const newLabel = language === 'ar' ? (action.displayNameAr || action.name) : (action.displayNameEn || action.name);
                       if (node.data.label !== newLabel) {
                           newData.label = newLabel;
                           changed = true;
                       }
                  }
              }

              // 2. Update Assignee Name from User List
              if (node.data.assignee && !node.data.assigneeName && availableUsers.length > 0) {
                  const user = availableUsers.find(u => u.vaultUserId === node.data.assignee);
                  if (user) {
                      newData.assigneeName = user.name;
                      changed = true;
                  }
              }

              return changed ? { ...node, data: newData } : node;
          }));
      }
  }, [availableActions, availableUsers, language, nodes.length]); 

  // Sync edge labels from config to ReactFlow edges
  useEffect(() => {
      setEdges(eds => eds.map(e => {
          const configKey = `${e.source}|${e.target}`;
          const config = edgeConfigs[configKey];
          const isStartEdge = e.data?.isStartEdge;

          // Start Edge Logic
          if (isStartEdge) {
              if (config && config.triggers && config.triggers.length > 0) {
                 if (config.label && config.label !== e.label) {
                     return { ...e, label: config.label, labelShowBg: true, labelBgPadding: [8, 4], labelBgBorderRadius: 6, labelBgStyle: { fill: '#ffffff', fillOpacity: 1, stroke: '#e2e8f0', strokeWidth: 1 }, labelStyle: { fill: '#1e293b', fontWeight: 600, fontSize: 12 } };
                 } 
                 // If triggers exist but label matches or is default, keep as is or update if triggers change (not handled here fully)
              } else {
                  // No triggers? Show "Add Trigger"
                  const defaultLabel = t('addTrigger') || '+ Add Trigger'; // Ensure 'addTrigger' key exists or fallback
                  if (e.label !== defaultLabel) {
                      return { 
                          ...e, 
                          label: defaultLabel, 
                          labelShowBg: true, 
                          labelBgPadding: [6, 4], 
                          labelBgBorderRadius: 6, 
                          labelBgStyle: { fill: '#fee2e2', fillOpacity: 1, stroke: '#fca5a5', strokeWidth: 1 }, // Reddish to indicate required
                          labelStyle: { fill: '#b91c1c', fontWeight: 600, fontSize: 11 } 
                        };
                  }
              }
          }

          // Normal Edge Logic (or if Start edge has triggers/label set)
          if (config && config.label !== undefined && config.label !== e.label) {
              return { 
                  ...e, 
                  label: config.label, 
                  labelShowBg: true, 
                  labelBgPadding: [8, 4], 
                  labelBgBorderRadius: 6, 
                  labelBgStyle: { fill: '#ffffff', fillOpacity: 1, stroke: '#e2e8f0', strokeWidth: 1 }, 
                  labelStyle: { fill: '#1e293b', fontWeight: 600, fontSize: 12 } 
              };
          }
           // If label is cleared/empty in config
          if (config && !config.label && e.label) {
              // Only clear if NOT start edge (start edge has default label handled above)
              if (!isStartEdge) {
                return { ...e, label: '', labelShowBg: false };
              }
          }
           // Ensure styling persists if not changed
          return { 
              ...e, 
              labelShowBg: !!e.label, 
              labelBgPadding: [8, 4], 
              labelBgBorderRadius: 6, 
              labelBgStyle: isStartEdge && !config?.triggers?.length ? { fill: '#fee2e2', fillOpacity: 1, stroke: '#fca5a5', strokeWidth: 1 } : { fill: '#ffffff', fillOpacity: 1, stroke: '#e2e8f0', strokeWidth: 1 }, 
              labelStyle: isStartEdge && !config?.triggers?.length ? { fill: '#b91c1c', fontWeight: 600, fontSize: 11 } : { fill: '#1e293b', fontWeight: 600, fontSize: 12 } 
          };
      }));
  }, [edgeConfigs, setEdges, t]);

  const applyAutoLayout = () => {
      if (nodes.length === 0) return;
      
      // Find Start node
      const startNode = nodes.find(n => n.type === 'start');
      if (!startNode) {
          // Fallback: Simple vertical stack
          setNodes(prev => prev.map((n, i) => ({
              ...n,
              position: { x: 400, y: i * 150 + 50 }
          })));
          return;
      }

      // Build adjacency list for BFS traversal
      const adjacencyList = new Map<string, string[]>();
      nodes.forEach(node => adjacencyList.set(node.id, []));
      edges.forEach(edge => {
          const neighbors = adjacencyList.get(edge.source) || [];
          neighbors.push(edge.target);
          adjacencyList.set(edge.source, neighbors);
      });

      // BFS to assign levels
      const levels = new Map<string, number>();
      const queue: string[] = [startNode.id];
      levels.set(startNode.id, 0);

      while (queue.length > 0) {
          const current = queue.shift()!;
          const currentLevel = levels.get(current)!;
          const neighbors = adjacencyList.get(current) || [];

          for (const neighbor of neighbors) {
              if (!levels.has(neighbor)) {
                  levels.set(neighbor, currentLevel + 1);
                  queue.push(neighbor);
              }
          }
      }

      // Group nodes by level
      const nodesByLevel = new Map<number, number[]>(); // Change to Map<number, Node[]> if needed but here just logic
      // Actually reusing code from previous read
      const nodesByLevelMap = new Map<number, Node[]>();
      nodes.forEach(node => {
          const level = levels.get(node.id) ?? 0;
          if (!nodesByLevelMap.has(level)) {
              nodesByLevelMap.set(level, []);
          }
          nodesByLevelMap.get(level)!.push(node);
      });

      // Position nodes
      const horizontalSpacing = 300;
      const verticalSpacing = 200;
      const startX = 100;
      const startY = 100;

      const updatedNodes = nodes.map(node => {
          const level = levels.get(node.id) ?? 0;
          const nodesInLevel = nodesByLevelMap.get(level) || [];
          const indexInLevel = nodesInLevel.indexOf(node);
          const totalInLevel = nodesInLevel.length;

          // Center nodes in each level
          const offsetX = (totalInLevel - 1) * horizontalSpacing / 2;

          return {
              ...node,
              position: {
                  x: startX + (indexInLevel * horizontalSpacing) - offsetX + (level * 50),
                  y: startY + (level * verticalSpacing)
              }
          };
      });

      setNodes(updatedNodes);
  };

  // Handlers
  const onNodesChange = useCallback((changes: any) => {
      const filteredChanges = changes.filter((change: any) => {
          if (change.type === 'remove') {
              const node = nodes.find(n => n.id === change.id);
              if (node && (node.type === 'start' || node.type === 'end')) {
                  return false;
              }
          }
          return true;
      });
      setNodes((nds) => applyNodeChanges(filteredChanges, nds));
  }, [nodes]);
  const onEdgesChange = useCallback((changes: any) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);
  const onConnect = useCallback((connection: Connection) => {
      const sourceNode = nodes.find(n => n.id === connection.source);
      const isStartEdge = sourceNode?.type === 'start';
      
      setEdges((eds) => addEdge({ 
          ...connection, 
          type: 'smoothstep', 
          markerEnd: { type: MarkerType.ArrowClosed }, 
          animated: true, 
          labelShowBg: true, 
          labelBgPadding: [8, 4],
          labelBgBorderRadius: 6,
          labelBgStyle: { fill: '#ffffff', fillOpacity: 1, stroke: '#e2e8f0', strokeWidth: 1 },
          labelStyle: { fill: '#1e293b', fontWeight: 600, fontSize: 12 },
          data: { isStartEdge },
          label: isStartEdge ? (t('addTrigger') || '+ Add Trigger') : undefined
        }, eds));
  }, [nodes]);

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
    setSelectedEdgeId(null);
  }, []);

  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    event.stopPropagation();
    setSelectedEdgeId(edge.id);
    setSelectedNodeId(null);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
  }, []);

  const updateSelectedNode = (key: string, value: any) => {
      setNodes((nds) => nds.map(n => {
          if (n.id === selectedNodeId) {
              const newData = { ...n.data, [key]: value };
              if (key === 'actionCode') {
                  const action = availableActions.find(a => a.code === value);
                  if (action) newData.label = language === 'ar' ? (action.displayNameAr || action.name) : (action.displayNameEn || action.name); 
              }
              if (key === 'assignee') {
                  const user = availableUsers.find(u => u.vaultUserId === value);
                  if (user) newData.assigneeName = user.name;
                  // Clear role when user is selected
                  if (value) {
                      newData.assigneeRole = undefined;
                      newData.assigneeRoleId = undefined;
                  }
              }
              if (key === 'assigneeRoleId' || key === 'assigneeRole') {
                  // Clear user when role is selected
                  if (value) {
                      newData.assignee = undefined;
                      newData.assigneeName = undefined;
                  }
              }
              return { ...n, data: newData };
          }
          return n;
      }));
  };

  /* OLD SINGLE SELECT - REMOVED */
  /*
  const handleScopeSelect = (type: WorkflowTriggerType, id: string, label: string) => {
      if (triggers.some(t => t.type === type && t.value === id)) return;
      setTriggers(prev => [...prev, { type, value: id }]);
  };
  */





  const getTriggerIcon = (type: WorkflowTriggerType, triggerCode?: string) => {
      if (triggerCode) return <Zap size={14} />;
      switch (type) {
          case WorkflowTriggerType.Workspace: return <Briefcase size={14} />;
          case WorkflowTriggerType.FolderEvent: return <Folder size={14} />;
          case WorkflowTriggerType.Document: return <FileText size={14} />;
          case WorkflowTriggerType.DocumentType: return <FileIcon size={14} />;
          case WorkflowTriggerType.Person: return <User size={14} />;
          default: return <Tag size={14} />;
      }
  };

  const getTriggerLabel = (t: UITrigger) => {
      if (t.triggerCode) return t.path || `Event: ${t.triggerCode}`;
      if (t.path) return t.path; // Use path if available (from picker)
      if (t.type === WorkflowTriggerType.Workspace) {
          const ws = workspaces.find(w => w.id === t.value);
          if (ws) return ws.name;
          return `Workspace: ${t.value}`;
      }
      if (t.type === WorkflowTriggerType.FolderEvent) return `Folder: ${t.value}`;
      if (t.type === WorkflowTriggerType.Document) return `Document: ${t.value}`;
      if (t.type === WorkflowTriggerType.DocumentType) return `Document Type: ${t.value}`;
      if (t.type === WorkflowTriggerType.Person) return `Person: ${t.value}`;
      return `Unknown Scope (${t.value})`;
  };



  const [loading, setLoading] = useState(false);
  
  const handleSave = async () => {
      // Validate
      if (!name.trim()) {
          setErrorMessage(t('workflowNameRequired'));
          return;
      }
      if (nodes.length === 0) {
          setErrorMessage(t('addStepsError'));
          return;
      }

      try {
          setLoading(true);
          setErrorMessage(null);
          
          const startNodes = nodes.filter(n => n.type === 'start');
          if (startNodes.length === 0) {
              setErrorMessage(t('startNodeRequired'));
              setLoading(false);
              return;
          }
          
          const endNodes = nodes.filter(n => n.type === 'end');
          if (endNodes.length === 0) {
              setErrorMessage(t('endNodeRequired'));
              setLoading(false);
              return;
          }

          // Check for disconnected components
          const visited = new Set<string>();
          const queue: string[] = [startNodes[0].id];
          visited.add(startNodes[0].id);
          
          // Build adjacency list
          const adjacencyList = new Map<string, string[]>();
          nodes.forEach(node => adjacencyList.set(node.id, []));
          edges.forEach(edge => {
              const neighbors = adjacencyList.get(edge.source) || [];
              neighbors.push(edge.target);
              adjacencyList.set(edge.source, neighbors);
          });
          
          while(queue.length > 0) {
              const curr = queue.shift()!;
              const neighbors = adjacencyList.get(curr) || [];
              for (const n of neighbors) {
                  if (!visited.has(n)) {
                      visited.add(n);
                      queue.push(n);
                  }
              }
          }
          
          // If end node is not reachable
          const endNodeId = endNodes[0].id;
          if (!visited.has(endNodeId)) {
               setErrorMessage(t('flowDisconnectedError'));
               setLoading(false);
               return;
          }
          
          // Validate that there is at least one intermediate step (not just Start -> End)
          const intermediateNodes = nodes.filter(n => n.type !== 'start' && n.type !== 'end');
          if (intermediateNodes.length === 0) {
              setErrorMessage(t('noIntermediateStepsError') || 'Workflow must have at least one step between Start and End');
              setLoading(false);
              return;
          }

          // Validate triggers (Must be on Start Edge)
          const startNodeForSave = nodes.find(n => n.type === 'start');
          let triggersToSave: WorkflowTrigger[] = [];
          let hasStartTrigger = false;
          let hasStartEdgeName = false;

           if (startNodeForSave) {
              const startEdges = edges.filter(e => e.source === startNodeForSave.id);
              for (const edge of startEdges) {
                  const configKey = `${edge.source}|${edge.target}`;
                  const config = edgeConfigs[configKey];
                  if (config && config.triggers && config.triggers.length > 0) {
                      hasStartTrigger = true;
                      triggersToSave.push(...config.triggers);
                  }
                  if (config && config.label && config.label.trim().length > 0) {
                      hasStartEdgeName = true;
                  }
              }
          }

          if (!hasStartTrigger) {
              setErrorMessage(t('startEdgeTriggerRequired') || 'A trigger is required on the connection from Start');
              setLoading(false);
              return;
          }

          if (!hasStartEdgeName) {
              setErrorMessage(t('startEdgeNameRequired') || 'A name is required for the trigger connection');
              setLoading(false);
              return;
          }

          // Validate that all Action (task) nodes have an assignee or role
          const taskNodesWithoutAssignee = nodes.filter(n => 
              n.type === 'task' && 
              !n.data.assignee && 
              !n.data.assigneeRole && 
              !n.data.assigneeRoleId
          );
          if (taskNodesWithoutAssignee.length > 0) {
              const stepNames = taskNodesWithoutAssignee.map(n => `"${n.data.label || 'Untitled'}"`).join(', ');
              setErrorMessage(
                  language === 'ar'
                      ? `الخطوات التالية تحتاج تعيين شخص أو دور: ${stepNames}`
                      : `The following steps require a person or role assignment: ${stepNames}`
              );
              setLoading(false);
              return;
          }

          const steps: WorkflowStep[] = nodes.map(node => {
              const incoming = edges.filter(e => e.target === node.id);
              const dependsOn = incoming.map(e => e.source);
              
              // Construct EdgeConfigs for this step (incoming edges)
              const stepEdgeConfigs: Record<string, WorkflowEdgeConfig> = {};
              incoming.forEach(incEdge => {
                  const configKey = `${incEdge.source}|${incEdge.target}`;
                  if (edgeConfigs[configKey]) {
                      stepEdgeConfigs[incEdge.source] = edgeConfigs[configKey];
                  }
              });

               const cleanedData = { ...node.data };
               if (cleanedData.assignee === '') delete cleanedData.assignee;
               if (cleanedData.assigneeRoleId === '') delete cleanedData.assigneeRoleId;

               let uiMetadata = {
                   position: node.position,
                   nodeType: node.type,
                   connections: edges.filter(e => e.source === node.id).map(e => ({
                       id: e.id,
                       source: e.source,
                       target: e.target,
                       sourceHandle: e.sourceHandle
                   })),
                   data: cleanedData,
                  formFields: stepForms[node.id] || []
              };

              return {
                  stepId: node.id,
                  title: node.data.label || 'Untitled Step',
                  type: mapNodeTypeToStepType(node.type || 'task'),
                  dependsOn: dependsOn,
                  edgeConfigs: stepEdgeConfigs,
                  actionConfig: {
                      actionType: node.data.isEditAction ? WorkflowActionType.Edit : (node.type === 'task' ? WorkflowActionType.Approve : WorkflowActionType.None),
                      actionCode: node.data.actionCode,
                       assigneeId: (node.data.assignee && node.data.assignee.length === 24) ? node.data.assignee : undefined,
                       assigneeRole: node.data.assigneeRole || undefined,
                       assigneeRoleId: (node.data.assigneeRoleId && node.data.assigneeRoleId.length === 24) ? node.data.assigneeRoleId : undefined,
                      instructions: node.data.description,
                      requiredFields: []
                  },
                  uiMetadataPublic: uiMetadata
              } as any;
          });

          const workflowToSave: Workflow = {
              ...initialWorkflow,
              name,
              description,
              triggers: triggersToSave,
              steps: steps,
              minConfidenceScore: 0.8,
              isActive: initialWorkflow?.isActive ?? true
          } as Workflow;

          await onSave(workflowToSave);
      } catch (err: any) {
          console.error('Save error:', err);
          setErrorMessage(err.message || String(err));
      } finally {
          setLoading(false);
      }
  };

  const mapNodeTypeToStepType = (nodeType: string): WorkflowStepType => {
      switch (nodeType) {
          case 'start': return WorkflowStepType.Start;
          case 'end': return WorkflowStepType.End;
          case 'decision': return WorkflowStepType.Logic;
          case 'task': return WorkflowStepType.Action;
          default: return WorkflowStepType.Action;
      }
  }

  const updateEdgeConfig = (edgeId: string, key: keyof WorkflowEdgeConfig, value: any) => {
      const edge = edges.find(e => e.id === edgeId);
      if (!edge) return;
      
      const configKey = `${edge.source}|${edge.target}`;
      setEdgeConfigs(prev => {
          const currentConfig = prev[configKey] || { label: '' };
          return {
              ...prev,
              [configKey]: {
                  ...currentConfig,
                  [key]: value
              }
          };
      });
  };

  const selectedEdge = edges.find(e => e.id === selectedEdgeId);
  const showEdgeProperties = selectedEdgeId && selectedEdge;
  const edgeSourceNode = selectedEdge ? nodes.find(n => n.id === selectedEdge.source) : null;
  const isStartEdge = edgeSourceNode?.type === 'start';
  const edgeConfigKey = selectedEdge ? `${selectedEdge.source}|${selectedEdge.target}` : '';
  const currentEdgeConfig = selectedEdge ? (edgeConfigs[edgeConfigKey] || { label: '' }) : { label: '' };

  const selectedNode = nodes.find(n => n.id === selectedNodeId);
  const showProperties = selectedNodeId && selectedNode;

  return (
    <div className="workflow-editor-container">
      {errorMessage && (
        <div className="error-banner">
             <AlertCircle size={16} />
             <span>{errorMessage}</span>
             <button onClick={() => setErrorMessage(null)}><X size={14}/></button>
        </div>
      )}
      
      <div className="we-header">
        <div className="we-header-left">
             <button className="btn-icon" onClick={onClose}><ArrowLeft size={20} /></button>
             <h2 className="we-title">{initialWorkflow ? t('editWorkflow') : t('createWorkflow')}</h2>
        </div>
        
        <div className="we-header-right" style={{ display: 'flex', gap: 8 }}>
             <button id="btn-auto-layout" className="btn-secondary" onClick={applyAutoLayout} style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: 6, border: '1px solid #e2e8f0', background: 'white', color: '#64748b' }}>
                <GitBranch size={16} /> {t('autoLayout')}
            </button>
             <button className="btn-primary" onClick={handleSave} disabled={loading}>
                 <Save size={16} /> {t('saveWorkflow')}
             </button>
        </div>
      </div>

      <div className="we-body" style={{position: 'relative'}}>
            <WorkflowFlowDesigner 
                nodes={nodes} edges={edges}
                onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
                onConnect={onConnect} onNodeClick={onNodeClick}
                onEdgeClick={onEdgeClick}
                onPaneClick={onPaneClick}
                setNodes={setNodes} availableActions={availableActions}
            />
            
            {/* Workflow name & description — always visible (MUS-754) */}
            <div className="we-properties" style={(showProperties || showEdgeProperties) ? { paddingBottom: 0, borderBottom: 'none' } : undefined}>
                <div className="we-sidebar-title">{t('workflowSettings')}</div>
                <div className="form-group">
                    <label>{t('workflowNamePlaceholder')}</label>
                    <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="form-group">
                     <label>{t('description')}</label>
                     <textarea className="form-textarea" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t('workflowDescriptionPlaceholder')} />
                </div>
            </div>

            {/* Properties Panel */}
            {showEdgeProperties ? (
                <div className="we-properties" style={{ paddingTop: 0 }}>
                     <div className="we-sidebar-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <span>{t('edgeProperties')}</span>
                         <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                             <button className="btn-icon" title={t('deleteConnection')} onClick={() => { if (selectedEdgeId) { setEdges(eds => eds.filter(e => e.id !== selectedEdgeId)); setSelectedEdgeId(null); } }}>
                                 <Trash2 size={16} />
                             </button>
                             <button className="btn-icon" onClick={() => setSelectedEdgeId(null)}>
                                 <X size={16} />
                             </button>
                         </div>
                    </div>

                    <div className="form-group">
                        <label>{isStartEdge ? t('connectionName') : t('label')}</label>
                        <input className="form-input" value={currentEdgeConfig.label || ''} onChange={(e) => updateEdgeConfig(selectedEdgeId!, 'label', e.target.value)} />
                    </div>

                    {isStartEdge ? (
                         <div style={{marginTop: 20}}>
                              <WorkflowTriggerBuilder 
                                  triggers={currentEdgeConfig.triggers || []}
                                  onChange={(newTriggers) => updateEdgeConfig(selectedEdgeId!, 'triggers', newTriggers)}
                                  singleSelect={true}
                              />
                         </div>
                    ) : (
                         <div style={{marginTop: 20}}>
                              
                              <div className="tab-header" style={{display: 'flex', gap: 10, borderBottom: '1px solid #e2e8f0', marginBottom: 10, paddingBottom: 5}}>
                                  <button onClick={() => setActiveEdgeTab('during')} style={{fontWeight: activeEdgeTab === 'during' ? 'bold' : 'normal', padding: '4px 8px', borderRadius: 4, background: activeEdgeTab === 'during' ? '#f1f5f9' : 'transparent', border: 'none', cursor: 'pointer'}}>{t('during') || 'During'}</button>
                                  <button onClick={() => setActiveEdgeTab('after')} style={{fontWeight: activeEdgeTab === 'after' ? 'bold' : 'normal', padding: '4px 8px', borderRadius: 4, background: activeEdgeTab === 'after' ? '#f1f5f9' : 'transparent', border: 'none', cursor: 'pointer'}}>{t('after') || 'After'}</button>
                              </div>

                              {activeEdgeTab === 'after' && (
                                <div className="form-group" style={{ marginBottom: 15 }}>
                                     <label>{t('event') || 'Event'}</label>
                                     <Select
                                         options={[
                                             { value: '', label: `-- ${t('selectEvent') || 'Select Event'} --` },
                                             ...availableEvents.map(evt => ({
                                                 value: evt.code,
                                                 label: language === 'ar' ? (evt.displayNameAr || evt.name) : (evt.displayNameEn || evt.name)
                                             }))
                                         ]}
                                         value={
                                             [
                                                 { value: '', label: `-- ${t('selectEvent') || 'Select Event'} --` },
                                                 ...availableEvents.map(evt => ({
                                                     value: evt.code,
                                                     label: language === 'ar' ? (evt.displayNameAr || evt.name) : (evt.displayNameEn || evt.name)
                                                 }))
                                             ].find(opt => opt.value === (currentEdgeConfig.eventCode || '')) || { value: '', label: `-- ${t('selectEvent') || 'Select Event'} --` }
                                         }
                                         onChange={(opt) => updateEdgeConfig(selectedEdgeId!, 'eventCode', opt?.value || '')}
                                         styles={{
                                             control: (base) => ({
                                                 ...base,
                                                 borderColor: '#cbd5e1',
                                                 borderRadius: '6px',
                                                 minHeight: '34px',
                                                 boxShadow: 'none',
                                                 fontSize: '13px',
                                                 '&:hover': { borderColor: '#94a3b8' }
                                             }),
                                             option: (base, state) => ({
                                                 ...base,
                                                 fontSize: '13px',
                                                 padding: '6px 12px',
                                                 backgroundColor: state.isSelected ? '#c3924d' : state.isFocused ? '#fdf8f3' : 'white',
                                                 color: state.isSelected ? 'white' : '#1e293b',
                                                 cursor: 'pointer'
                                             }),
                                             menu: (base) => ({ ...base, zIndex: 1000 })
                                         }}
                                         isSearchable={true}
                                         maxMenuHeight={180}
                                         menuPlacement="auto"
                                     />
                                </div>
                              )}

                              {activeEdgeTab !== 'after' && (
                                  <>
                                      <button 
                                          className="btn-primary btn-sm" 
                                          style={{width: '100%', justifyContent: 'center', marginTop: 10}}
                                          onClick={() => setIsFormBuilderOpen(true)}
                                      >
                                          <Settings size={14} /> {t('configureForms')}
                                      </button>
                                      
                                      <div style={{marginTop: 10, fontSize: 12, color: '#64748b'}}>
                                          {(currentEdgeConfig.forms?.[activeEdgeTab] || []).length} {t('fieldsConfigured')}
                                      </div>
                                  </>
                              )}
                         </div>
                    )}
                </div>
            ) : selectedNode ? (
                <div className="we-properties" style={{ paddingTop: 0 }}>
                    <div className="we-sidebar-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{t('nodeProperties')}</span>
                        <button className="btn-icon" onClick={() => setSelectedNodeId(null)}>
                            <X size={16} />
                        </button>
                    </div>  
                    
                    {selectedNode.type !== 'task' ? (
                        <div className="form-group">
                            <label>{t('labelName')}</label>
                            <input className="form-input" value={selectedNode.data.label} onChange={(e) => updateSelectedNode('label', e.target.value)} />
                        </div>
                    ) : (
                        <div className="form-group">
                            <label style={{ fontSize: '0.75rem', color: '#64748b' }}>{t('actionName')}</label>
                            <div style={{ fontWeight: 600, padding: '4px 0' }}>{selectedNode.data.label}</div>
                        </div>
                    )}

                    {selectedNode.type === 'task' && (
                        <div className="form-group">
                             <label>{t('actionType')}</label>
                             <Select
                                 options={[
                                     { value: '', label: `-- ${t('select')} ${t('actionType')} --` },
                                     ...availableActions.map(action => ({
                                         value: action.code,
                                         label: language === 'ar' ? (action.displayNameAr || action.name) : (action.displayNameEn || action.name)
                                     }))
                                 ]}
                                 value={
                                     [
                                         { value: '', label: `-- ${t('select')} ${t('actionType')} --` },
                                         ...availableActions.map(action => ({
                                             value: action.code,
                                             label: language === 'ar' ? (action.displayNameAr || action.name) : (action.displayNameEn || action.name)
                                         }))
                                     ].find(opt => opt.value === (selectedNode.data.actionCode || '')) || { value: '', label: `-- ${t('select')} ${t('actionType')} --` }
                                 }
                                 onChange={(opt) => updateSelectedNode('actionCode', opt?.value || '')}
                                 styles={{
                                     control: (base) => ({
                                         ...base,
                                         borderColor: '#cbd5e1',
                                         borderRadius: '6px',
                                         minHeight: '34px',
                                         boxShadow: 'none',
                                         fontSize: '13px',
                                         '&:hover': { borderColor: '#94a3b8' }
                                     }),
                                     option: (base, state) => ({
                                         ...base,
                                         fontSize: '13px',
                                         padding: '6px 12px',
                                         backgroundColor: state.isSelected ? '#c3924d' : state.isFocused ? '#fdf8f3' : 'white',
                                         color: state.isSelected ? 'white' : '#1e293b',
                                         cursor: 'pointer'
                                     }),
                                     menu: (base) => ({ ...base, zIndex: 1000 })
                                 }}
                                 isSearchable={true}
                                 maxMenuHeight={180}
                                 menuPlacement="auto"
                             />
                        </div>
                    )}

                    <div className="form-group">
                        <label>{t('description')} / {t('instructions')}</label>
                        <textarea className="form-textarea" rows={3} value={selectedNode.data.description || ''} onChange={(e) => updateSelectedNode('description', e.target.value)} />
                    </div>

                    {selectedNode.type === 'task' && (
                        <div style={{ marginTop: 20 }}>
                            <div className="we-sidebar-title">{t('assignment')}</div>
                            <div className="form-group">
                                <label>{t('assigneeUser')}</label>
                                <Select
                                    options={[
                                        { value: '', label: `-- ${t('select')} ${t('peopleUsers')} --` },
                                        ...availableUsers.map(user => ({
                                            value: user.vaultUserId,
                                            label: user.name
                                        }))
                                    ]}
                                    value={
                                        [
                                            { value: '', label: `-- ${t('select')} ${t('peopleUsers')} --` },
                                            ...availableUsers.map(user => ({
                                                value: user.vaultUserId,
                                                label: user.name
                                            }))
                                        ].find(opt => opt.value === (selectedNode.data.assignee || '')) || { value: '', label: `-- ${t('select')} ${t('peopleUsers')} --` }
                                    }
                                    onChange={(opt) => updateSelectedNode('assignee', opt?.value || undefined)}
                                    styles={{
                                        control: (base) => ({
                                            ...base,
                                            borderColor: '#cbd5e1',
                                            borderRadius: '6px',
                                            minHeight: '34px',
                                            boxShadow: 'none',
                                            fontSize: '13px',
                                            '&:hover': { borderColor: '#94a3b8' }
                                        }),
                                        option: (base, state) => ({
                                            ...base,
                                            fontSize: '13px',
                                            padding: '6px 12px',
                                            backgroundColor: state.isSelected ? '#c3924d' : state.isFocused ? '#fdf8f3' : 'white',
                                            color: state.isSelected ? 'white' : '#1e293b',
                                            cursor: 'pointer'
                                        }),
                                        menu: (base) => ({ ...base, zIndex: 1000 })
                                    }}
                                    isSearchable={true}
                                    maxMenuHeight={180}
                                    menuPlacement="auto"
                                />
                            </div>
                            
                            <div style={{ textAlign: 'center', fontSize: 11, color: '#94a3b8', margin: '4px 0' }}>{t('orSeparator')}</div>
                            <div className="form-group">
                                        <label>{t('assigneeRoleLabel')}</label>
                                        <Select
                                            options={[
                                                { value: '', label: `-- ${t('select')} ${t('role')} --` },
                                                { value: 'Creator', label: `👤 ${t('creator') || 'Creator (Requester)'}` },
                                                ...availableRoles.map(role => ({
                                                    value: role.id,
                                                    label: language === 'ar' ? role.nameAr : role.nameEn
                                                }))
                                            ]}
                                            value={
                                                [
                                                    { value: '', label: `-- ${t('select')} ${t('role')} --` },
                                                    { value: 'Creator', label: `👤 ${t('creator') || 'Creator (Requester)'}` },
                                                    ...availableRoles.map(role => ({
                                                        value: role.id,
                                                        label: language === 'ar' ? role.nameAr : role.nameEn
                                                    }))
                                                ].find(opt => opt.value === (selectedNode.data.assigneeRoleId || selectedNode.data.assigneeRole || '')) || { value: '', label: `-- ${t('select')} ${t('role')} --` }
                                            }
                                            onChange={(selectedOption) => {
                                                const selectedId = selectedOption?.value || undefined;
                                                if (selectedId === 'Creator' || !selectedId) {
                                                    updateSelectedNode('assigneeRole', selectedId);
                                                    updateSelectedNode('assigneeRoleId', undefined);
                                                } else {
                                                    const role = availableRoles.find(r => r.id === selectedId);
                                                    updateSelectedNode('assigneeRoleId', selectedId); // save ID
                                                    updateSelectedNode('assigneeRole', role ? (language === 'ar' ? role.nameAr : role.nameEn) : selectedId); // save name
                                                }
                                            }}
                                            styles={{
                                                control: (base) => ({
                                                    ...base,
                                                    borderColor: '#cbd5e1',
                                                    borderRadius: '6px',
                                                    minHeight: '34px',
                                                    boxShadow: 'none',
                                                    fontSize: '13px',
                                                    '&:hover': { borderColor: '#94a3b8' }
                                                }),
                                                option: (base, state) => ({
                                                    ...base,
                                                    fontSize: '13px',
                                                    padding: '6px 12px',
                                                    backgroundColor: state.isSelected ? '#c3924d' : state.isFocused ? '#fdf8f3' : 'white',
                                                    color: state.isSelected ? 'white' : '#1e293b',
                                                    cursor: 'pointer'
                                                }),
                                                menu: (base) => ({ ...base, zIndex: 1000 })
                                            }}
                                            isSearchable={true}
                                            maxMenuHeight={180}
                                            menuPlacement="auto"
                                        />
                                    </div>
                        </div>
                    )}
                </div>
            ) : null}
      </div>

      {isFormBuilderOpen && (
          <div className="form-builder-overlay">
              <div className="form-builder-modal">
                  <div className="form-builder-header">
                      <h3>{t('transitionForms')} - {activeEdgeTab === 'after' ? t('end') : t(activeEdgeTab)}</h3>
                      <button className="btn-icon" onClick={() => setIsFormBuilderOpen(false)}>
                          <X size={20} />
                      </button>
                  </div>
                  <div className="form-builder-content">
                        <WorkflowFormBuilder 
                            fields={(currentEdgeConfig.forms?.[activeEdgeTab] || []) as FormField[]}
                            onChange={(fields) => {
                                const currentForms = currentEdgeConfig.forms || { during: [], after: [] };
                                updateEdgeConfig(selectedEdgeId!, 'forms', { ...currentForms, [activeEdgeTab]: fields });
                            }}
                            selectedStepName={`${t('transitionForms')} (${activeEdgeTab === 'after' ? t('end') : t(activeEdgeTab)})`}
                        />
                  </div>
                  <div className="form-builder-footer">
                      <button className="btn-primary" onClick={() => setIsFormBuilderOpen(false)}>
                          {t('done')}
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}
