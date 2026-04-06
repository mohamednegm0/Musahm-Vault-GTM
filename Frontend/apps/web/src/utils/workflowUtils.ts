/**
 * Utility functions for workflow status normalization and mapping
 */

/**
 * Normalizes workflow instance status from various backend representations (numeric or string)
 * to a standard lowercase string.
 * Backend WorkflowStatus enum: Draft=0, Active=1, Suspended=2, Completed=3, Terminated=4
 */
export const normalizeWorkflowStatus = (status: any): string => {
  // Handle numeric values (both number type and string that looks like a number)
  const num = Number(status);
  if (!isNaN(num) && status !== '' && status !== null && status !== undefined) {
    switch (num) {
      case 0: return 'draft';
      case 1: return 'active';
      case 2: return 'suspended';
      case 3: return 'completed';
      case 4: return 'terminated';
      default: break;
    }
  }
  const s = String(status || '').toLowerCase().trim();
  if (s === 'inprogress' || s === 'running') return 'active';
  if (s === 'active') return 'active';
  if (s === 'completed') return 'completed';
  if (s === 'failed' || s === 'terminated') return 'terminated';
  if (s === 'suspended' || s === 'paused') return 'suspended';
  if (s === 'draft') return 'draft';
  return s;
};

/**
 * Normalizes workflow step status from various backend representations.
 * Backend StepStatus: Pending=0, Ready=1, InProgress=2, Completed=3, Rejected=4, Skipped=5
 */
export const normalizeStepStatus = (status: any): string => {
  // Handle numeric values (both number type and string that looks like a number)
  const num = Number(status);
  if (!isNaN(num) && status !== '' && status !== null && status !== undefined) {
    switch (num) {
      case 0: return 'pending';
      case 1: return 'ready';
      case 2: return 'active'; // Maps to active for UI consistency
      case 3: return 'completed';
      case 4: return 'failed'; // Rejected/Failed
      case 5: return 'skipped';
      default: break;
    }
  }
  const s = String(status || '').toLowerCase().trim();
  if (s === 'inprogress') return 'active';
  if (s === 'rejected') return 'failed';
  return s;
};

/**
 * Sorts workflow steps: Start nodes first, End nodes last,
 * middle steps sorted by their startedAt timestamp (pending steps after active ones).
 */
export const sortWorkflowSteps = (steps: any[]): any[] => {
  if (!Array.isArray(steps)) return [];

  const getStepOrder = (step: any): number => {
    const title = String(step.title || step.name || '').toLowerCase().trim();
    const type = String(step.type || step.nodeType || '').toLowerCase().trim();
    if (title === 'start' || type === 'start') return 0;
    if (title === 'end' || type === 'end') return 2;
    return 1; // middle steps
  };

  return [...steps].sort((a, b) => {
    const orderA = getStepOrder(a);
    const orderB = getStepOrder(b);
    if (orderA !== orderB) return orderA - orderB;
    // Within the same group, sort by startedAt (pending goes last)
    const dateA = a.startedAt ? new Date(a.startedAt).getTime() : Number.MAX_VALUE;
    const dateB = b.startedAt ? new Date(b.startedAt).getTime() : Number.MAX_VALUE;
    return dateA - dateB;
  });
};
