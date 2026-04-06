import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import WorkflowEditor from '../components/workflow/WorkflowEditor';
import { getWorkflowById, createWorkflow, updateWorkflow, Workflow } from '../api/workflows';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import Breadcrumb from '../components/Breadcrumb';

const WorkflowEditorPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { error, success } = useToast();
    const [loading, setLoading] = useState(!!id);
    const [initialWorkflow, setInitialWorkflow] = useState<Workflow | undefined>(undefined);

    useEffect(() => {
        if (id) {
            loadWorkflow(id);
        }
    }, [id]);

    const loadWorkflow = async (workflowId: string) => {
        try {
            setLoading(true);
            const data = await getWorkflowById(workflowId);

            // 🔒 Block editing active workflows
            if (data.isActive) {
                error(t('cannotEditActiveWorkflow') || 'Cannot edit an active workflow. Please deactivate it first.');
                navigate('/workflows');
                return;
            }

            setInitialWorkflow(data);
        } catch (err) {
            console.error('Failed to load workflow', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (workflow: Workflow) => {
        try {
            if (id) {
                await updateWorkflow(id, workflow);
            } else {
                await createWorkflow(workflow);
            }
            success('workflowSaved');
            setTimeout(() => {
                navigate('/workflows');
            }, 1000);
        } catch (err: any) {
            console.error('Failed to save workflow', err);
            const msg = err.response?.data?.message || err.message || t('failedToSaveWorkflow') || 'Failed to save workflow';
            error(msg);
        }
    };

    const handleClose = () => {
        navigate('/workflows');
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flex: 1, background: '#f8fafc' }}>
                <div className="loading">{t('loading') || 'Loading...'}</div>
            </div>
        );
    }

    const breadcrumbs = [
        { label: t('home'), onClick: () => navigate('/') },
        { label: t('workflowsTitle') || 'Workflows', onClick: () => navigate('/workflows') },
        { label: id ? (initialWorkflow?.name || 'Edit Workflow') : (t('newWorkflow') || 'New Workflow') }
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100%', overflow: 'hidden', padding: '0 16px' }}>
            <div style={{ padding: '10px 0' }}>
                <Breadcrumb items={breadcrumbs} />
            </div>
            <WorkflowEditor
                initialWorkflow={initialWorkflow}
                onSave={handleSave}
                onClose={handleClose}
            />
        </div>
    );
};

export default WorkflowEditorPage;
