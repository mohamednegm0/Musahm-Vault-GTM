
import React, { useRef, useCallback } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Connection,
  Edge,
  Node,
  MarkerType,
  Panel,
  useReactFlow,
  NodeTypes
} from 'reactflow';
import 'reactflow/dist/style.css';
import { StartNode, EndNode, TaskNode, DecisionNode } from './CustomNodes';
import { PlayCircle, StopCircle, CheckSquare, AlertCircle, Edit, Activity } from 'lucide-react';
import { startTransition } from 'react';
import { ActionDefinition } from '../../api/workflows';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';

const nodeTypes: NodeTypes = {
  start: StartNode,
  end: EndNode,
  task: TaskNode,
  decision: DecisionNode,
};

interface WorkflowFlowDesignerProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: any;
  onEdgesChange: any;
  onConnect: (connection: Connection) => void;
  onNodeClick: (event: React.MouseEvent, node: Node) => void;
  onEdgeClick?: (event: React.MouseEvent, edge: Edge) => void;
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  availableActions?: ActionDefinition[];
  onPaneClick?: (event: React.MouseEvent) => void;
}

const Sidebar = ({ availableActions = [], nodes = [] }: { availableActions?: ActionDefinition[], nodes?: Node[] }) => {
  const { t, language } = useLanguage();
  const onDragStart = (event: React.DragEvent, nodeType: string, options?: { isEdit?: boolean, actionCode?: string, label?: string }) => {
    event.dataTransfer.setData('application/reactflow/type', nodeType);
    if(options?.isEdit) event.dataTransfer.setData('application/reactflow/edit', 'true');
    if(options?.actionCode) event.dataTransfer.setData('application/reactflow/actionCode', options.actionCode);
    if(options?.label) event.dataTransfer.setData('application/reactflow/label', options.label);
    event.dataTransfer.effectAllowed = 'move';
  };

  const hasStartNode = nodes.some(node => node.type === 'start');
  const hasEndNode = nodes.some(node => node.type === 'end');

  return (
    <div className="we-sidebar">
      <div className="we-sidebar-section">
        <div className="we-sidebar-title">{t('flowShapes')}</div>
        
        {availableActions.length > 0 ? (
            availableActions.map(action => (
                <div key={action.id} className="dnd-item" onDragStart={(event) => onDragStart(event, 'task', { actionCode: action.code, label: language === 'ar' ? (action.displayNameAr || action.name) : (action.displayNameEn || action.name) })} draggable>
                    <CheckSquare size={16} /> {language === 'ar' ? (action.displayNameAr || action.name) : (action.displayNameEn || action.name)}
                </div>
            ))
        ) : (
             <div className="dnd-item" onDragStart={(event) => onDragStart(event, 'task')} draggable>
                <CheckSquare size={16} /> {t('actionType')} / {t('tasks')}
            </div>
        )}

        <div className="dnd-item" onDragStart={(event) => onDragStart(event, 'decision')} draggable>
          <AlertCircle size={16} /> {t('decision')}
        </div>
      </div>
       <div className="we-sidebar-section">
        <div className="we-sidebar-title">{t('instructionsTitle')}</div>
        <div style={{fontSize: '12px', color: '#64748b', lineHeight: '1.5'}}>
            {t('dragShapesInstruction')}
        </div>
      </div>
    </div>
  );
};

const FlowCanvas = ({ nodes, edges, onNodesChange, onEdgesChange, onConnect, onNodeClick, onEdgeClick, onPaneClick, setNodes, availableActions }: WorkflowFlowDesignerProps) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition, fitView } = useReactFlow();
  const { error: toastError } = useToast();
  const { t } = useLanguage();

  // Apply fitView when nodes are loaded or changed
  React.useEffect(() => {
    if (nodes.length > 0) {
      // Immediate attempt via RAF
      window.requestAnimationFrame(() => {
          fitView({ padding: 0.2, duration: 200 });
      });

      // Backup attempt to ensure layout is settled (e.g. sidebar rendering)
      const timer = setTimeout(() => {
        fitView({ 
          padding: 0.2, 
          duration: 400,
          minZoom: 0.5,
          maxZoom: 1.5
        });
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [nodes.length, fitView]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow/type');
      const isEdit = event.dataTransfer.getData('application/reactflow/edit') === 'true';
      const actionCode = event.dataTransfer.getData('application/reactflow/actionCode');
      const label = event.dataTransfer.getData('application/reactflow/label');

      if (typeof type === 'undefined' || !type) {
        return;
      }

      // Prevent adding more than one Start node
      if (type === 'start' && nodes.some(node => node.type === 'start')) {
        toastError(t('onlyOneStartNodeAllowed') || 'Only one Start node is allowed per workflow.');
        return;
      }

      // Prevent adding more than one End node
      if (type === 'end' && nodes.some(node => node.type === 'end')) {
        toastError(t('onlyOneEndNodeAllowed') || 'Only one End node is allowed per workflow.');
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node = {
        id: crypto.randomUUID(),
        type,
        position,
        data: { 
            label: label || (isEdit ? 'Edit Document' : `${type.charAt(0).toUpperCase() + type.slice(1)}`), 
            isEditAction: isEdit,
            actionCode: actionCode || undefined
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, setNodes, nodes]
  );

  return (
    <div className="we-body" ref={reactFlowWrapper}>
      <Sidebar availableActions={availableActions} nodes={nodes} />
      <div className="flow-canvas">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          onPaneClick={onPaneClick}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{
            padding: 0.2,
            minZoom: 0.5,
            maxZoom: 1.5
          }}
          deleteKeyCode={['Backspace', 'Delete']}
          defaultEdgeOptions={{
            type: 'smoothstep',
            animated: true,
            markerEnd: { type: MarkerType.ArrowClosed }
          }}
        >
          <Controls />
          <Background color="#aaa" gap={16} />
        </ReactFlow>
      </div>
    </div>
  );
};

export default function WorkflowFlowDesigner(props: WorkflowFlowDesignerProps) {
  return (
    <ReactFlowProvider>
        <FlowCanvas {...props} />
    </ReactFlowProvider>
  );
}
