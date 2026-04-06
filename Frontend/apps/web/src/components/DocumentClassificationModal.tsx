import React, { useState } from 'react';
import { FileText, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import './DocumentClassificationModal.css';

interface ExtractedField {
  name: string;
  value: string;
  confidence: number;
}

interface DocumentClassificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: (documentType: string, fields: ExtractedField[]) => void;
  onReject: () => void;
  documentName: string;
  suggestedType: string;
  confidence: number;
  extractedFields: ExtractedField[];
}

const DocumentClassificationModal: React.FC<DocumentClassificationModalProps> = ({
  isOpen,
  onClose,
  onApprove,
  onReject,
  documentName,
  suggestedType,
  confidence,
  extractedFields: initialFields
}) => {
  const { t } = useLanguage();
  const [documentType, setDocumentType] = useState(suggestedType);
  const [fields, setFields] = useState<ExtractedField[]>(initialFields);

  if (!isOpen) return null;

  const handleFieldChange = (index: number, value: string) => {
    const updatedFields = [...fields];
    updatedFields[index].value = value;
    setFields(updatedFields);
  };

  const handleApprove = () => {
    onApprove(documentType, fields);
  };

  const getConfidenceColor = (conf: number) => {
    if (conf >= 0.8) return '#10B981'; // Green
    if (conf >= 0.5) return '#F59E0B'; // Orange
    return '#EF4444'; // Red
  };

  const getConfidenceLabel = (conf: number) => {
    if (conf >= 0.8) return t('highConfidence');
    if (conf >= 0.5) return t('mediumConfidence');
    return t('lowConfidence');
  };

  const documentTypes = [
    'NDA',
    'Commercial Contract',
    'Board MoM',
    'Resolution',
    'Policy / SOP',
    'License / Permit',
    'Financial Report',
    'Agreement',
    'Invoice',
    'Other'
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="classification-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FileText size={24} color="var(--primary)" />
            <h2>{t('reviewDocumentClassification')}</h2>
          </div>
        </div>

        <div className="modal-body">
          {/* Document Info */}
          <div className="info-section">
            <div className="info-row">
              <strong>{t('documentName')}:</strong>
              <span>{documentName}</span>
            </div>
          </div>

          {/* Confidence Banner */}
          <div 
            className="confidence-banner"
            style={{ 
              background: `${getConfidenceColor(confidence)}20`,
              border: `1px solid ${getConfidenceColor(confidence)}`,
              color: getConfidenceColor(confidence)
            }}
          >
            <Info size={20} />
            <div>
              <strong>{getConfidenceLabel(confidence)}</strong>
              <p style={{ margin: '4px 0 0', fontSize: '14px' }}>
                {confidence < 0.8 
                  ? t('reviewRequiredMessage')
                  : t('highConfidenceMessage')
                }
              </p>
            </div>
          </div>

          {/* Document Type Selection */}
          <div className="form-group">
            <label>
              {t('documentType')}
              <span style={{ marginLeft: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                ({t('confidence')}: {Math.round(confidence * 100)}%)
              </span>
            </label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="form-select"
            >
              {documentTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Extracted Fields */}
          <div className="form-group">
            <label>{t('extractedFields')}</label>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              {t('reviewFieldsMessage')}
            </p>
            
            <div className="fields-list">
              {fields.map((field, index) => (
                <div key={index} className="field-item">
                  <div className="field-header">
                    <label>{field.name}</label>
                    <span 
                      className="confidence-badge"
                      style={{ 
                        background: `${getConfidenceColor(field.confidence)}20`,
                        color: getConfidenceColor(field.confidence)
                      }}
                    >
                      {Math.round(field.confidence * 100)}%
                    </span>
                  </div>
                  <input
                    type="text"
                    value={field.value}
                    onChange={(e) => handleFieldChange(index, e.target.value)}
                    className="form-input"
                    placeholder={t('enterValue')}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Warning for Low Confidence */}
          {confidence < 0.5 && (
            <div className="warning-banner">
              <AlertCircle size={20} />
              <div>
                <strong>{t('lowConfidenceWarning')}</strong>
                <p style={{ margin: '4px 0 0', fontSize: '14px' }}>
                  {t('lowConfidenceWarningMessage')}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={onReject} className="btn-secondary">
            {t('reject')}
          </button>
          <button onClick={handleApprove} className="btn-primary">
            <CheckCircle size={18} />
            {t('approveAndSave')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentClassificationModal;
