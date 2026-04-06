import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import WorkflowAssignmentModal from '../components/WorkflowAssignmentModal';
import { getWorkflows, Workflow } from '../api/workflows';

const WorkflowAssignmentsPage: React.FC = () => {
    const { workflowId } = useParams<{ workflowId: string }>();
    const [searchParams] = useSearchParams();
    const workflowName = searchParams.get('name') || '';
    const navigate = useNavigate();
    const { language } = useLanguage();

    const [resolvedName, setResolvedName] = useState(workflowName);

    useEffect(() => {
        // If name not in URL, fetch it
        if (!workflowName && workflowId) {
            getWorkflows().then(workflows => {
                const wf = workflows.find((w: Workflow) => w.id === workflowId);
                if (wf) setResolvedName(wf.name);
            }).catch(console.error);
        }
    }, [workflowId, workflowName]);

    const handleClose = () => {
        window.close(); // Close the tab if opened as a new tab
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            <WorkflowAssignmentModal
                isOpen={true}
                onClose={handleClose}
                workflowId={workflowId}
                workflowName={resolvedName}
            />
        </div>
    );
};

export default WorkflowAssignmentsPage;
