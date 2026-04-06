import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDocuments, Document } from '../api/documents';
import { getUserIdFromToken } from '../utils/tokenUtils';
import { useLanguage } from '../contexts/LanguageContext';
import ExplorerLayout from '../components/ExplorerLayout';
import { Share2 } from 'lucide-react';

const SharedDocuments: React.FC = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                setLoading(true);
                const userId = getUserIdFromToken();
                const allDocs = await getDocuments();

                // Documents not created by me and not owned by me
                const sharedDocs = userId
                    ? allDocs.filter(doc => {
                        const creatorId = doc.created_by || (doc as any).createdBy;
                        const ownerId = doc.owner_user_id || (doc as any).ownerUserId;
                        return creatorId !== userId && ownerId !== userId;
                    })
                    : [];

                setDocuments(sharedDocs);
            } catch (err) {
                console.error('Failed to fetch shared documents:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchDocuments();
    }, [t]);

    const breadcrumbs = [
        { label: t('home'), onClick: () => navigate('/') },
        { label: t('sharedWithMe') }
    ];

    return (
        <ExplorerLayout
            title={t('sharedWithMe')}
            documents={documents}
            isLoading={loading}
            breadcrumbs={breadcrumbs}
            showBackCallback={() => navigate('/')}
            emptyMessage={t('noSharedDocuments') || 'No shared documents found'}
            headerActions={
                <div style={{ color: 'var(--brand-gold)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Share2 size={24} />
                </div>
            }
        />
    );
};

export default SharedDocuments;
