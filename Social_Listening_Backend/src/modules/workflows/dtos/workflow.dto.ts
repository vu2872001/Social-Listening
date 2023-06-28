export class WorkflowDTO {
  name: string;
  tabId: string;
  type: string;
  data: WorkflowData;
}

export class WorkflowData {
  nodes: WorkflowBlock[];
  edges: WorkflowEdge[];
  variables: string[];
}

export class WorkflowBlock {
  id: string;
  type: string;
  position: WorkflowPosition;
  data: object;
}

export class WorkflowEdge {
  id: string;
  source: string;
  sourceHandle: string;
  target: string;
  targetHandle: string;
}

export class WorkflowPosition {
  x: number;
  y: number;
}

export class CreateWorkflowDTO {
  id?: string;
  name: string;
  tabId: string;
  type: string;
  extendData?: string;
}

export class CreateWorkflowNodeDTO {
  id: string;
  flowId: string;
  type: string;
  position_X: number;
  position_Y: number;
  data: string;
}

export class CreateWorkflowEdgeDTO {
  id: string;
  flowId: string;
  sourceId: string;
  sourceName: string;
  targetId: string;
  targetName: string;
}

export class CreateWorkflowVariableDTO {
  id?: string;
  flowId: string;
  variableName: string;
  variableValue?: string;
  variableDataType?: string;
}
