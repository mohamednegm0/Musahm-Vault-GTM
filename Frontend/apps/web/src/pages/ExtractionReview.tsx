import React, { useState, useEffect } from 'react';
import { ClipboardCheck, CheckCircle, XCircle, FileText, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getPendingExtractions, approveExtraction, rejectExtraction, DocumentExtraction } from '../api/documentExtractions';
import { useLanguage } from '../contexts/LanguageContext';
import DocumentsLayout from '../components/DocumentsLayout';
import Breadcrumb from '../components/Breadcrumb';
import LoadingState from '../components/LoadingState';
import DocumentClassificationModal from '../components/DocumentClassificationModal';
import '../styles/CommonList.css';

const ExtractionReview: React.FC = () => {
  const [extractions, setExtractions] = useState<DocumentExtraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExtraction, setSelectedExtraction] = useState<DocumentExtraction | null>(null);
  const [showModal, setShowModal] = useState(false);
  const { t } = useLanguage();
  const navigate = useNavigate();

  const breadcrumbs = [
    { label: t('dashboard') || 'Dashboard', onClick: () => navigate('/dashboard') },
    { label: t('extractionReviewTitle') || 'Extraction Review' }
  ];

  useEffect(() => {
    loadExtractions();
  }, []);

  const loadExtractions = async () => {
    try {
      setLoading(true);
      const data = await getPendingExtractions();
      // Safe check
      setExtractions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading extractions:', error);
      setExtractions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await approveExtraction(id);
      loadExtractions();
      setShowModal(false);
    } catch (error) {
      console.error('Error approving extraction:', error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectExtraction(id);
      loadExtractions();
      setShowModal(false);
    } catch (error) {
      console.error('Error rejecting extraction:', error);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'high';
    if (confidence >= 0.7) return 'medium';
    return 'low';
  };

  const customContent = (
    <div>
      {loading ? (
        <div style={{ padding: '60px 0' }}><LoadingState /></div>
      ) : extractions.length === 0 ? (
        <div className="empty-state">
          <p>{t('extractionEmpty') || 'No pending extractions to review'}</p>
        </div>
      ) : (
        <div className="list-grid">
          {extractions.map(extraction => (
            <div key={extraction.id} className="list-item">
              <div className="item-header">
                <h3><FileText size={16} style={{ marginBottom: '-2px', marginRight: '6px' }} /> {t('extractionDocumentId') || 'Document ID'}: {extraction.documentId}</h3>
                <span className={`confidence confidence-${getConfidenceColor(extraction.confidence)}`} style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600, background: '#f3f4f6' }}>
                  {t('extractionConfidence') || 'Confidence'}: {(extraction.confidence * 100).toFixed(0)}%
                </span>
              </div>
              <div className="item-details" style={{ margin: '12px 0', fontSize: '14px', color: 'var(--text-secondary)' }}>
                <p><strong>{t('extractionType') || 'Type'}:</strong> {extraction.documentType}</p>
                <p><strong>{t('extractionStatus') || 'Status'}:</strong> {extraction.status}</p>
              </div>

              {extraction.extractedFields && Object.keys(extraction.extractedFields).length > 0 && (
                <div className="extracted-fields" style={{ background: '#f9fafb', padding: '12px', borderRadius: '6px', margin: '12px 0' }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: 'var(--text-primary)' }}>{t('extractionFields') || 'Extracted Fields'}:</h4>
                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                    {Object.entries(extraction.extractedFields).map(([key, value]) => (
                      <li key={key}>
                        <span style={{ fontWeight: 600 }}>{key}:</span> {String(value)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="item-actions" style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid #e5e7eb', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    setSelectedExtraction(extraction);
                    setShowModal(true);
                  }}
                  className="btn-primary"
                  style={{ fontSize: '14px', padding: '6px 12px' }}
                >
                  <ClipboardCheck size={16} /> {t('reviewBtn') || 'Review'}
                </button>
                <button
                  onClick={() => handleApprove(extraction.id!)}
                  className="btn-success"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', padding: '6px 12px', background: '#10B981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  <CheckCircle size={16} /> {t('extractionQuickApprove') || 'Approve'}
                </button>
                <button
                  onClick={() => handleReject(extraction.id!)}
                  className="btn-danger"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', padding: '6px 12px', background: '#EF4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  <XCircle size={16} /> {t('extractionReject') || 'Reject'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      <DocumentsLayout
        title={t('extractionReviewTitle') || 'Extraction Review Queue'}
        subtitle={t('extractionSubtitle') || 'Review and approve AI-extracted document metadata'}
        headerIcon={ClipboardCheck}
        headerIconColor="var(--brand-gold)"
        breadcrumb={<Breadcrumb items={breadcrumbs} />}
        actions={extractions.length > 0 ? <span className="badge" style={{ background: '#c3924d', color: 'white', padding: '4px 12px', borderRadius: '12px' }}>{extractions.length} pending</span> : null}
        documents={[]}
        customContent={customContent}
        hideDocuments={true}
      />

      {/* Use Document Classification Modal */}
      {selectedExtraction && (
        <DocumentClassificationModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onApprove={(docType, fields) => {
            console.log('Approved:', docType, fields);
            handleApprove(selectedExtraction.id!);
          }}
          onReject={() => {
            handleReject(selectedExtraction.id!);
          }}
          documentName={`Document ID: ${selectedExtraction.documentId}`}
          suggestedType={selectedExtraction.documentType}
          confidence={selectedExtraction.confidence}
          extractedFields={
            selectedExtraction.extractedFields
              ? Object.entries(selectedExtraction.extractedFields).map(([name, value]) => ({
                name,
                value: String(value),
                confidence: selectedExtraction.confidence
              }))
              : []
          }
        />
      )}
    </>
  );
};

export default ExtractionReview;
