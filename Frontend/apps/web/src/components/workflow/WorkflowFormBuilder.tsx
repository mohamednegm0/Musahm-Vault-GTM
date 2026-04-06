
import React, { useState } from 'react';
import { Type, AlignLeft, CheckSquare, List, Calendar, Trash2 } from 'lucide-react';

export interface FormField {
  id: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'date';
  label: string;
  required: boolean;
  options?: string[];
}

interface WorkflowFormBuilderProps {
  fields: FormField[];
  onChange: (fields: FormField[]) => void;
  selectedStepName?: string;
}

export default function WorkflowFormBuilder({ fields, onChange, selectedStepName }: WorkflowFormBuilderProps) {
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);

  const addField = (type: FormField['type']) => {
    const newField: FormField = {
      id: crypto.randomUUID(),
      type,
      label: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      required: false,
      options: type === 'select' ? ['Option 1', 'Option 2'] : undefined
    };
    onChange([...fields, newField]);
    setSelectedFieldId(newField.id);
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    onChange(fields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const removeField = (id: string) => {
    onChange(fields.filter(f => f.id !== id));
    if (selectedFieldId === id) setSelectedFieldId(null);
  };

  const onDragStart = (e: React.DragEvent, type: FormField['type']) => {
    e.dataTransfer.setData('form-field-type', type);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('form-field-type') as FormField['type'];
    if (type) addField(type);
  };

  const onDragOver = (e: React.DragEvent) => e.preventDefault();

  const selectedField = fields.find(f => f.id === selectedFieldId);

  return (
    <div className="fb-container">
      {/* Sidebar */}
      <div className="we-sidebar">
        <div className="we-sidebar-section">
          <div className="we-sidebar-title">Form Elements</div>
          <div className="dnd-item" draggable onDragStart={(e) => onDragStart(e, 'text')} onClick={() => addField('text')}>
            <Type size={16} /> Text Input
          </div>
          <div className="dnd-item" draggable onDragStart={(e) => onDragStart(e, 'textarea')} onClick={() => addField('textarea')}>
            <AlignLeft size={16} /> Text Area
          </div>
          <div className="dnd-item" draggable onDragStart={(e) => onDragStart(e, 'select')} onClick={() => addField('select')}>
            <List size={16} /> Dropdown / Select
          </div>
          <div className="dnd-item" draggable onDragStart={(e) => onDragStart(e, 'checkbox')} onClick={() => addField('checkbox')}>
            <CheckSquare size={16} /> Checkbox
          </div>
          <div className="dnd-item" draggable onDragStart={(e) => onDragStart(e, 'date')} onClick={() => addField('date')}>
            <Calendar size={16} /> Date Picker
          </div>

        </div>
        <div className="we-sidebar-section">
             <div className="we-sidebar-title">Help</div>
             <p style={{fontSize: '12px', color: '#64748b'}}>Drag elements to the canvas to build the form for step: <strong>{selectedStepName || 'None'}</strong></p>
        </div>
      </div>

      {/* Canvas */}
      <div className="fb-canvas" onDrop={onDrop} onDragOver={onDragOver}>
        <div className="fb-paper">
           <h2 style={{marginTop: 0, marginBottom: '20px', fontSize: '20px'}}>Form Preview: {selectedStepName}</h2>
           {fields.length === 0 && <div style={{textAlign: 'center', color: '#94a3b8', padding: '40px'}}>Drag fields here to start building the form</div>}
           
           {fields.map(field => (
             <div 
                key={field.id} 
                className={`fb-field ${selectedFieldId === field.id ? 'selected' : ''}`}
                onClick={() => setSelectedFieldId(field.id)}
             >
                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                    <label className="fb-label">
                        {field.label} {field.required && <span style={{color: 'red'}}>*</span>}
                    </label>
                    <button className="btn-icon" onClick={(e) => { e.stopPropagation(); removeField(field.id);}}>
                        <Trash2 size={14} color="#ef4444"/>
                    </button>
                </div>
                
                {field.type === 'text' && <input type="text" className="fb-input" placeholder="Text Input" disabled dir="auto" />}
                {field.type === 'textarea' && <textarea className="fb-input" style={{height: 80}} disabled dir="auto" />}
                {field.type === 'select' && (
                    <select className="fb-input" disabled>
                        {field.options?.map(opt => <option key={opt}>{opt}</option>)}
                    </select>
                )}
                {field.type === 'checkbox' && (
                    <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                        <input type="checkbox" disabled /> <span>Checkbox Label</span>
                    </div>
                )}
                {field.type === 'date' && <input type="date" className="fb-input" disabled />}

             </div>
           ))}
        </div>
      </div>

      {/* Properties Panel (Right) */}
      {selectedField && (
        <div className="we-properties">
             <div className="we-sidebar-title">Field Properties</div>
             
             <div className="form-group">
                 <label>Label</label>
                 <input 
                    className="form-input" 
                    value={selectedField.label} 
                    onChange={(e) => updateField(selectedField.id, { label: e.target.value })} 
                    dir="auto"
                 />
             </div>

             <div className="form-group">
                 <label>Type</label>
                 <select 
                     className="form-select"
                     value={selectedField.type}
                     onChange={(e) => updateField(selectedField.id, { type: e.target.value as any })}
                 >
                     <option value="text">Text Input</option>
                     <option value="textarea">Text Area</option>
                     <option value="select">Select / Dropdown</option>
                     <option value="checkbox">Checkbox</option>
                     <option value="date">Date Picker</option>

                 </select>
             </div>

             <div className="form-group">
                 <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#334155', fontWeight: 500 }}>
                     <input 
                        type="checkbox" 
                        checked={selectedField.required} 
                        onChange={(e) => updateField(selectedField.id, { required: e.target.checked })} 
                        style={{ width: '16px', height: '16px', accentColor: '#c3924d', cursor: 'pointer', margin: 0 }}
                     />
                     Required Field
                 </label>
             </div>

             {selectedField.type === 'select' && (
                 <div className="form-group">
                     <label>Options (comma separated)</label>
                     <textarea 
                        className="form-textarea"
                        value={selectedField.options?.join(', ')}
                        onChange={(e) => updateField(selectedField.id, { options: e.target.value.split(',').map(s => s.trim()) })}
                        dir="auto"
                     />
                 </div>
             )}
        </div>
      )}
    </div>
  );
}
