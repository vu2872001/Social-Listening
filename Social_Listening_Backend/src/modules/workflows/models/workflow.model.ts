export class WorkflowModel {
  name: string;
  extendData?: string;
  isActive: boolean;
  socialTab: {
    name: string;
    groupId: string;
    isWorked: boolean;
    extendData?: string;
  };
}
