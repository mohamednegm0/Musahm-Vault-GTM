
import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { CheckSquare, AlertCircle, PlayCircle, StopCircle, User, FileText, Edit, Briefcase } from 'lucide-react';

const handleStyle = { width: 8, height: 8, background: '#64748b' };

export const StartNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div className={`custom-node node-start ${selected ? 'selected' : ''}`}>
      <div className="node-header">
        <div className="node-icon"><PlayCircle size={18} /></div>
        <div className="node-title">{data.label || 'Start'}</div>
      </div>
      <Handle type="source" position={Position.Bottom} style={handleStyle} />
    </div>
  );
});

export const EndNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div className={`custom-node node-end ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Top} style={handleStyle} />
      <div className="node-header">
        <div className="node-icon"><StopCircle size={18} /></div>
        <div className="node-title">{data.label || 'End'}</div>
      </div>
    </div>
  );
});

export const TaskNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div className={`custom-node node-action ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Top} style={handleStyle} />
      <div className="node-header">
        <div className="node-icon">
             {data.isEditAction ? <Edit size={16}/> : <CheckSquare size={16} />}
        </div>
        <div className="node-title">{data.label}</div>
      </div>
      <div className="node-content">
        {data.description || 'No description'}
      </div>
      {(data.assignee || data.assigneeRole) && (
        <div className="node-assignee">
          <div className="avatar-circle" style={data.assigneeRole ? { backgroundColor: '#64748b' } : {}}>
            {data.assigneeRole ? <Briefcase size={10} /> : <User size={10} />}
          </div>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px' }}>
              {data.assigneeRole || data.assigneeName || data.assignee}
          </span>
        </div>
      )}
       <Handle type="source" position={Position.Bottom} style={handleStyle} />
    </div>
  );
});

export const DecisionNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div className={`diamond-shape ${selected ? 'selected' : ''}`}>
       {/* Input Handle - Top Tip (Visually Top, structurally Top-Left of rotated square) */}
       {/* Note: In rotated coordinate system (45deg CW), Top-Left corner is visually Top. */}
       <Handle 
         type="target" 
         position={Position.Top} 
         style={{ ...handleStyle, top: 0, left: 0, transform: 'translate(-50%, -50%)', background: '#64748b' }} 
       />
       
       <div className="diamond-content">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
             <div className="node-icon" style={{ background: '#fef3c7', color: '#b45309', padding: '4px', borderRadius: '4px', marginBottom: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertCircle size={16} />
             </div>
            <span>{data.label || '?'}</span>
          </div>
       </div>

       {/* Yes Handle - Right Tip (Visually Right, structurally Top-Right of rotated square) */}
       <div style={{ position: 'absolute', top: -15, right: -40, width: 60, textAlign: 'center', fontSize: 10, fontWeight: 'bold', color: '#10b981', transform: 'rotate(-45deg)', pointerEvents: 'none' }}>Yes</div>
       <Handle 
         type="source" 
         position={Position.Right} 
         id="yes"
         style={{ ...handleStyle, top: 0, right: 0, transform: 'translate(50%, -50%)', background: '#10b981' }} 
       />

       {/* No Handle - Left Tip (Visually Left, structurally Bottom-Left of rotated square) */}
       <div style={{ position: 'absolute', bottom: -15, left: -40, width: 60, textAlign: 'center', fontSize: 10, fontWeight: 'bold', color: '#ef4444', transform: 'rotate(-45deg)', pointerEvents: 'none' }}>No</div>
       <Handle 
         type="source" 
         position={Position.Left} 
         id="no"
         style={{ ...handleStyle, bottom: 0, left: 0, transform: 'translate(-50%, 50%)', background: '#ef4444' }} 
       />
    </div>
  );
});
