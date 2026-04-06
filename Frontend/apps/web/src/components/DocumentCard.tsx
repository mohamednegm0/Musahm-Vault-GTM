import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Folder, Star, Copy, Scissors, Share2, Clipboard, Eye, Trash2, Edit, Info, Clock, Users, GitBranch } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import DropdownMenu, { MenuItem } from './DropdownMenu';
import ShareModal from './ShareModal';
import WorkflowAssignmentModal from './WorkflowAssignmentModal';
import './DocumentCard.css';
import { deleteDocument, getDocumentPreview } from '../api/documents';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../contexts/ConfirmContext';
import Tooltip from './Tooltip';

export interface Document {
  id: string;
  name: string;
  category: string;
  status: 'Approved' | 'Pending Signature' | 'Signed' | 'In Review' | 'Expired' | 'Draft';
  date: string;
  isStarred?: boolean;
  isFolder?: boolean;
  legal_hold?: boolean;
}

interface DocumentCardProps {
  document: Document;
  onEdit?: (document: Document) => void;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ document, onEdit }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { success, error } = useToast();
  const { confirm } = useConfirm();
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const clickCountRef = useRef<number>(0);

  const menuClickedRef = useRef<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = React.useState(false);
  const [isWorkflowModalOpen, setIsWorkflowModalOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const DOUBLE_CLICK_DELAY = 300; // ms

  const getStatusClass = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'Approved': 'status-approved',
      'Pending Signature': 'status-pending',
      'Signed': 'status-signed',
      'In Review': 'status-review',
      'Expired': 'status-expired',
      'Draft': 'status-draft'
    };
    // Fallback for case-insensitive matching if needed
    if (!statusMap[status]) {
      const lowerStatus = status.toLowerCase();
      if (lowerStatus === 'approved') return 'status-approved';
      if (lowerStatus === 'pending signature') return 'status-pending';
      if (lowerStatus === 'signed') return 'status-signed';
      if (lowerStatus === 'in review') return 'status-review';
      if (lowerStatus === 'expired') return 'status-expired';
      if (lowerStatus === 'draft') return 'status-draft';
    }
    return statusMap[status] || '';
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'Approved': t('approved'),
      'Pending Signature': t('pendingSignature'),
      'Signed': t('signed'),
      'In Review': t('inReview'),
      'Expired': t('expired'),
      'Draft': t('draft')
    };
    // Try exact match, then loose match, then return status
    if (statusMap[status]) return statusMap[status];

    const lowerStatus = status.toLowerCase();
    if (lowerStatus === 'approved') return t('approved');
    if (lowerStatus === 'pending signature') return t('pendingSignature');
    if (lowerStatus === 'signed') return t('signed');
    if (lowerStatus === 'in review') return t('inReview');
    if (lowerStatus === 'expired') return t('expired');
    if (lowerStatus === 'draft') return t('draft');

    return status;
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if menu was clicked
    if (menuClickedRef.current) {
      menuClickedRef.current = false;
      return;
    }

    clickCountRef.current += 1;

    if (clickCountRef.current === 1) {
      // First click - wait to see if there's a second click
      clickTimeoutRef.current = setTimeout(() => {
        clickCountRef.current = 0;
        // Single click - do nothing (intentionally - only double click navigates)
      }, DOUBLE_CLICK_DELAY);
    } else if (clickCountRef.current === 2) {
      // Double click detected - navigate to details
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = null;
      }
      clickCountRef.current = 0;
      navigate(`/document/${document.id}`, {
        state: { document }
      });
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    // Clear single click timeout on double click
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
    }
    clickCountRef.current = 0;

    // Navigate immediately on double click
    if (!menuClickedRef.current) {
      navigate(`/document/${document.id}`, {
        state: { document }
      });
    }
    menuClickedRef.current = false;
  };

  const handleMenuAction = (action: string) => {
    menuClickedRef.current = true;

    switch (action) {
      case 'copy':
        // Copy document data to clipboard
        navigator.clipboard.writeText(JSON.stringify(document, null, 2));
        console.log('Copied document:', document.name);
        break;
      case 'cut':
        // Cut action (similar to copy but marks for deletion)
        navigator.clipboard.writeText(JSON.stringify(document, null, 2));
        console.log('Cut document:', document.name);
        break;
      case 'paste':
        // Paste action (could paste from clipboard)
        navigator.clipboard.readText().then(text => {
          console.log('Pasting:', text);
        });
        break;
      case 'share':
        // Share action - Open share modal
        setIsShareModalOpen(true);
        break;
      case 'details':
        navigate(`/document/${document.id}`, { state: { document } });
        break;
      case 'preview':
        // Call preview API
        getDocumentPreview(document.id).then(blob => {
          if (blob && blob.size > 0) {
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank');
            // Note: In a production app, we should revoke the URL eventually, 
            // but for a "open in new tab" action, it's tricky to know when. 
            // Often relied on garbage collection or simple timeout, but keeping it simple for now.
            setTimeout(() => window.URL.revokeObjectURL(url), 1000);
          } else {
            error(t('previewFailed'));
          }
        }).catch(err => {
          console.error('Preview failed', err);
          error(t('previewFailed'));
        });
        break;
      case 'delete':
        confirm({
          title: t('delete'),
          message: t('confirmDelete'),
          type: 'danger',
          confirmText: t('delete'),
          cancelText: t('cancel'),
          onConfirm: () => {
            setIsDeleting(true);
            deleteDocument(document.id).then((response: any) => {
              setIsDeleting(false);
              
              if (response && response.apiStatusCode === 460) {
                success(
                  t('documentDeletePendingWorkflow') ||
                  'تم إرسال طلب حذف المستند — في انتظار موافقة مسار العمل'
                );
                return;
              }

              if (response && response.apiStatusCode && response.apiStatusCode !== 200) {
                error(response.errorMessage || t('deleteError'));
                return;
              }

              success(t('deleteSuccess'));
              window.location.reload();
            }).catch(err => {
              console.error('Delete failed', err);
              setIsDeleting(false);
              error(t('deleteFailed'));
            });
          }
        });
        break;
      case 'update':
        if (onEdit) {
          onEdit(document);
        } else {
          navigate(`/document/${document.id}/edit`, { state: { document } });
        }
        break;
      case 'versions':
        navigate(`/document/${document.id}/versions`, { state: { document } });
        break;
      case 'permissions':
        navigate(`/document/${document.id}/permissions`, { state: { document } });
        break;
      case 'workflow':
        setIsWorkflowModalOpen(true);
        break;
      default:
        break;
    }
  };

  const menuItems: MenuItem[] = [
    // {
    //   id: 'details',
    //   label: t('details') || 'Details',
    //   icon: <Info size={16} />,
    //   onClick: () => handleMenuAction('details'),
    // },
    {
      id: 'versions',
      label: t('versionHistory'),
      icon: <Clock size={16} />,
      onClick: () => handleMenuAction('versions'),
    },
    {
      id: 'permissions',
      label: t('permissions'),
      icon: <Users size={16} />,
      onClick: () => handleMenuAction('permissions'),
    },
    {
      id: 'workflow',
      label: t('workflows') || 'Workflows',
      icon: <GitBranch size={16} />,
      onClick: () => handleMenuAction('workflow'),
    },
    {
      id: 'preview',
      label: t('preview'),
      icon: <Eye size={16} />,
      onClick: () => handleMenuAction('preview'),
    },
  ];

  // Add Update and Delete if not checking out (legal hold check)
  // Logic: Show Update/Delete if legal_hold is FALSE (or undefined/null which implies false usually, but strict check is safer)
  // The user said: "DELETE will show if legal_hold = false"
  if (!document.legal_hold) {
    menuItems.push({
      id: 'update',
      label: t('update'),
      icon: <Edit size={16} />,
      onClick: () => handleMenuAction('update'),
    });
    menuItems.push({
      id: 'delete',
      label: t('delete'),
      icon: <Trash2 size={16} className="text-red-500" />,
      onClick: () => handleMenuAction('delete'),
      className: 'text-red-500' // Assuming Dropdown supports className for item
    });
  }

  // Original items (optional, user didn't ask to remove them but "update to include" might mean replace or append.
  // I'll append the original copy/share actions as they are useful
  menuItems.push(
    {
      id: 'share',
      label: t('share'),
      icon: <Share2 size={16} />,
      onClick: () => handleMenuAction('share'),
    }
  );

  return (
    <div
      className="document-card"
      onDoubleClick={handleDoubleClick}
      onClick={handleCardClick}
    >
      <div className="card-header">
        <div className="card-icon">
          {document.isFolder ? (
            <Folder size={20} className="folder-icon" />
          ) : (
            <FileText size={20} className="file-icon" />
          )}
        </div>
        <div className="card-header-actions">
          <DropdownMenu
            items={menuItems}
            position="bottom-left"
            tooltip={t('moreActions')}
          />
          {document.isStarred && (
            <Tooltip content={t('starred')} position="bottom">
              <Star size={16} className="star-icon" fill="#f59e0b" color="#f59e0b" />
            </Tooltip>
          )}
        </div>
      </div>

      <div className="card-content">
        <h3 className="card-title">{document.name}</h3>
        <p className="card-category">{document.category}</p>
      </div>

      <div className="card-footer">
        <span className={`status-badge ${getStatusClass(document.status)}`}>
          {getStatusText(document.status)}
        </span>
        {document.date && (
          <span className="card-date">
            <span className="date-icon">📅</span>
            {document.date}
          </span>
        )}
      </div>

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        documentName={document.name}
        documentId={document.id}
      />
      <WorkflowAssignmentModal
        isOpen={isWorkflowModalOpen}
        onClose={() => setIsWorkflowModalOpen(false)}
        targetId={document.id}
        targetType={document.isFolder ? 'Folder' : 'Document'}
        targetName={document.name}
      />
    </div>
  );
};

export default DocumentCard;
