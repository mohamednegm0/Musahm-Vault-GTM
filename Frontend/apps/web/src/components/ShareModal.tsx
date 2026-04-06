import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, Plus, Send, Trash2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getDocumentInvitations, shareDocument, deleteInvitation, Invitation } from '../api/invitations';
import { getApplicableWorkflow } from '../api/workflowAssignments';
import { Workflow } from '../api/workflows';
// import { useToast } from '../contexts/ToastContext'; // Use local notification instead
import { useConfirm } from '../contexts/ConfirmContext';
import DatePicker from './DatePicker';
import './ShareModal.css';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    documentName: string;
    documentId: string;
    onSuccess?: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({
    isOpen,
    onClose,
    documentName,
    documentId,
    onSuccess
}) => {
    const { t, language } = useLanguage();
    // const { success, error } = useToast();
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    };
    const { confirm } = useConfirm();
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [emails, setEmails] = useState<string[]>([]);
    const [currentEmail, setCurrentEmail] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [emailError, setEmailError] = useState('');
    const [dateError, setDateError] = useState('');
    const [isListLoading, setIsListLoading] = useState(false);
    const [applicableWorkflow, setApplicableWorkflow] = useState<Workflow | null>(null);

    useEffect(() => {
        if (isOpen && documentId) {
            fetchInvitations();
            checkApplicableWorkflow();
        } else {
            // Reset state when closed
            setEmails([]);
            setCurrentEmail('');
            setExpiryDate('');
            setInvitations([]);
            setEmailError('');
            setDateError('');
            setIsListLoading(false);
            setApplicableWorkflow(null);
        }
    }, [isOpen, documentId]);

    const checkApplicableWorkflow = async () => {
        try {
            const workflow = await getApplicableWorkflow(documentId, 'Share');
            if (workflow) {
                setApplicableWorkflow(workflow);
            }
        } catch (error) {
            console.error("Failed to check applicable workflow", error);
        }
    };

    const fetchInvitations = async () => {
        setIsListLoading(true);
        try {
            const data = await getDocumentInvitations(documentId);
            setInvitations(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to fetch invitations', err);
            // error(t('fetchInvitationsFailed') || 'Failed to fetch invitations');
        } finally {
            setIsListLoading(false);
        }
    };

    const handleAddEmail = (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        // Reset errors
        setEmailError('');
        setDateError('');

        let isValid = true;

        if (!expiryDate) {
            setDateError(t('expiryDateKeywords') || 'Expiry date is required');
            isValid = false;
        }

        if (!currentEmail) {
            setEmailError(t('emailRequired') || 'Email is required');
            isValid = false;
        } else if (!currentEmail.includes('@')) {
            setEmailError(t('invalidEmail') || 'Invalid email address');
            isValid = false;
        }

        if (!isValid) return;

        if (emails.includes(currentEmail)) {
            setEmailError(t('emailAlreadyAdded') || 'Email already added');
            return;
        }

        setEmails([...emails, currentEmail]);
        setCurrentEmail('');
    };

    const handleRemoveEmailFromList = (emailToRemove: string) => {
        setEmails(emails.filter(email => email !== emailToRemove));
    };

    const handleShare = async () => {
        if (emails.length === 0) return;

        setIsLoading(true);
        try {
            // If there is an applicable workflow, just notify for now (or block/trigger)
            // Strategy: Proceed with share, but backend might trigger workflow event.
            // Frontend just warns user: "A sharing approval workflow will be started."
            
            // For now, standard share
            const response = await shareDocument({
                documentId,
                emails,
                expiryDate: expiryDate ? new Date(expiryDate).toISOString() : undefined
            });

            if (response.isSucceeded) {
                let msg = response.successMessage || t('shareSuccess') || 'Document shared successfully';
                if (applicableWorkflow) {
                    msg += ` (${t('workflowTriggered') || 'Workflow Triggered'}: ${applicableWorkflow.name})`;
                }
                showNotification('success', msg);
                setEmails([]);
                setExpiryDate('');
                // Always refresh from API as requested
                fetchInvitations();
                if (onSuccess) onSuccess();
            } else {
                showNotification('error', response.errorMessage || t('shareFailed') || 'Failed to share document');
            }
        } catch (err) {
            console.error('Share failed', err);
            showNotification('error', t('shareFailed') || 'Failed to share document');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteInvitation = async (id: string) => {
        confirm({
            title: t('removeAccess'),
            message: t('confirmDeleteInvitation') || 'Are you sure you want to remove access for this user?',
            confirmText: t('remove') || t('delete'),
            cancelText: t('cancel'),
            type: 'danger',
            onConfirm: async () => {
                try {
                    await deleteInvitation(id);
                    showNotification('success', t('invitationDeleted') || 'Access removed successfully');
                    // Refresh list from API as requested
                    fetchInvitations();
                    if (onSuccess) onSuccess();
                } catch (err) {
                    console.error('Delete invitation failed', err);
                    showNotification('error', t('deleteInvitationFailed') || 'Failed to remove access');
                }
            }
        });
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div
            className="share-modal-overlay"
            onClick={handleOverlayClick}
        >
            <div
                className={`share-modal ${language === 'ar' ? 'rtl' : ''}`}
                role="dialog"
                aria-modal="true"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="share-header">
                    <h2 className="share-title">
                        {t('shareDocument')}
                    </h2>
                    <button onClick={onClose} className="close-button">
                        <X size={20} />
                    </button>
                </div>
                {notification && (
                    <div className={`notification-banner ${notification.type}`} style={{
                        padding: '10px 15px',
                        margin: '0 0',
                        backgroundColor: notification.type === 'success' ? '#ecfdf5' : '#fef2f2',
                        color: notification.type === 'success' ? '#065f46' : '#991b1b',
                        borderBottom: `1px solid ${notification.type === 'success' ? '#10b981' : '#ef4444'}`,
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s ease'
                    }}>
                        {notification.message}
                    </div>
                )}

                {/* Workflow Notification Banner */}
                {applicableWorkflow && (
                    <div style={{
                        padding: '10px 15px',
                        marginBottom: '10px',
                        backgroundColor: '#eff6ff', // Light Blue
                        color: '#1e40af', // Dark Blue
                        borderLeft: '4px solid #3b82f6',
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <div style={{ fontWeight: 600 }}>{t('note') || 'Note'}:</div>
                        <div>
                            {t('workflowActiveMessage') || 'Sharing this document will trigger the workflow:'} <strong>{applicableWorkflow.name}</strong>
                        </div>
                    </div>
                )}

                <div className="share-body">
                    <p style={{ margin: '0 0 15px', color: '#64748b', fontSize: '14px' }}>
                        {t('shareDescription')} <strong>{documentName}</strong>
                    </p>
                    <div className="input-section">
                        <div className="input-row" style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'flex-start' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '160px' }}>
                                <DatePicker
                                    value={expiryDate}
                                    onChange={(val) => { setExpiryDate(val); if (val) setDateError(''); }}
                                    placeholder={t('expiryDate') || 'Expiry Date'}
                                    hasError={!!dateError}
                                    minDate={new Date().toISOString().split('T')[0]}
                                />
                                {dateError && <span style={{ color: '#ef4444', fontSize: '12px' }}>{dateError}</span>}
                            </div>
                            <div style={{ flex: 1 }}>
                                <form onSubmit={handleAddEmail} className="input-group" style={{ flexDirection: 'column', gap: '4px' }}>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <input
                                            type="email"
                                            className="email-input"
                                            placeholder={t('enterEmail')}
                                            value={currentEmail}
                                            onChange={(e) => {
                                                setCurrentEmail(e.target.value);
                                                if (e.target.value) setEmailError('');
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleAddEmail();
                                                }
                                            }}
                                            style={{ borderColor: emailError ? '#ef4444' : undefined }}
                                        />
                                        <button
                                            type="button"
                                            className="add-btn"
                                            onClick={() => handleAddEmail()}
                                        >
                                            <Plus size={18} />
                                        </button>
                                    </div>
                                    {emailError && <span style={{ color: '#ef4444', fontSize: '12px' }}>{emailError}</span>}
                                </form>
                            </div>
                        </div>

                        {/* Emails to be added */}
                        {emails.length > 0 && (
                            <div className="pending-emails">
                                {emails.map(email => (
                                    <span key={email} className="email-chip">
                                        {email}
                                        <button onClick={() => handleRemoveEmailFromList(email)} className="remove-chip">
                                            <X size={12} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="invitations-list-section">
                        <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#334155', marginBottom: '10px' }}>
                            {t('peopleWithAccess')}:
                        </h3>
                        {isListLoading ? (
                            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px', color: '#64748b' }}>
                                {t('loading') || 'Loading...'}
                            </div>
                        ) : (!invitations || invitations.length === 0) ? (
                            <p style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic' }}>
                                {t('noOneHasAccess') || 'No one has access to this document yet.'}
                            </p>
                        ) : (
                            <div className="invite-list">
                                {invitations?.map((inv) => (
                                    <div key={inv.id} className="invite-item">
                                        <div className="invite-info">
                                            <span className="invite-email">{inv.email}</span>
                                            <div className="invite-details">
                                                {inv.expiresAt && (
                                                    <span className="invite-expiry" style={{ fontSize: '11px', color: '#64748b' }}>
                                                        Exp: {new Date(inv.expiresAt).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="invite-actions">
                                            <span className={`invite-status status-${inv.status?.toLowerCase()}`}>
                                                {inv.status}
                                            </span>
                                            <button
                                                onClick={() => handleDeleteInvitation(inv.id)}
                                                className="remove-btn"
                                                data-tooltip-content={t('removeAccess')}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="share-footer">
                    <button onClick={onClose} className="cancel-btn">
                        {t('cancel')}
                    </button>
                    <button
                        onClick={handleShare}
                        className="share-btn"
                        disabled={emails.length === 0 || isLoading || !expiryDate}
                    >
                        {isLoading ? (t('sharing') || 'Sharing...') : (
                            <>
                                {t('share')} <Send size={16} />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ShareModal;
