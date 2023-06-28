export const WorkflowPerm = {
  GetAllWorkflow: {
    displayName: 'Get All Workflow',
    permission: 'table-workflow',
    screen: 'Workflows',
  },
  UpdateActivation: {
    displayName: 'Update Workflow Activation',
    permission: 'update-workflow-activation',
    screen: 'Workflows',
  },
  DeleteWorkflow: {
    displayName: 'Delete Workflow',
    permission: 'delete-workflow',
    screen: 'Workflows',
  },
  CreateWorkflow: {
    displayName: 'Create Workflow',
    permission: 'create-workflow',
    screen: 'Workflows',
  },
  UpdateWorkflow: {
    displayName: 'Update Workflow',
    permission: 'update-workflow',
    screen: 'Workflows',
  },
} as const;

export type WorkflowPerm = keyof typeof WorkflowPerm;
