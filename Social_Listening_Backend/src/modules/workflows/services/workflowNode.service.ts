import { Injectable } from '@nestjs/common';
import { ResponseMessage } from 'src/common/enum/ResponseMessage.enum';
import { PrismaService } from 'src/config/database/database.config.service';
import { CreateWorkflowNodeDTO } from '../dtos/workflow.dto';

@Injectable()
export class WorkflowNodeService {
  constructor(private readonly prismaService: PrismaService) {}

  async saveWorkflowNode(workflowNode: CreateWorkflowNodeDTO) {
    try {
      const newWorkflowNode = await this.prismaService.workflowNode.upsert({
        where: { id: workflowNode.id },
        create: workflowNode,
        update: workflowNode,
      });

      return newWorkflowNode;
    } catch (error) {
      throw new Error(ResponseMessage.MESSAGE_TECHNICAL_ISSUE);
    }
  }

  async removeAllNode(workflowId: string) {
    try {
      await this.prismaService.workflowNode.deleteMany({
        where: { flowId: workflowId },
      });
    } catch (error) {
      throw new Error(ResponseMessage.MESSAGE_TECHNICAL_ISSUE);
    }
  }

  async findReceiveNode(workflowId: string) {
    try {
      const node = await this.prismaService.workflowNode.findFirst({
        where: { flowId: workflowId, type: 'Receive' },
      });

      return node;
    } catch (error) {
      throw new Error(ResponseMessage.MESSAGE_TECHNICAL_ISSUE);
    }
  }

  async findNodeByFlowId(flowId: string, currentNodeType: string) {
    try {
      const workflowActive = await this.prismaService.workflowNode.findFirst({
        where: { flowId: flowId, type: currentNodeType },
      });

      return workflowActive;
    } catch (error) {
      throw new Error(ResponseMessage.MESSAGE_TECHNICAL_ISSUE);
    }
  }

  async findNodeById(flowId: string, currentNodeId: string) {
    try {
      const workflowActive = await this.prismaService.workflowNode.findFirst({
        where: { flowId: flowId, id: currentNodeId },
      });

      return workflowActive;
    } catch (error) {
      throw new Error(ResponseMessage.MESSAGE_TECHNICAL_ISSUE);
    }
  }
}
