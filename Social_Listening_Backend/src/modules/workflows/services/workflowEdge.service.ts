import { Injectable } from '@nestjs/common';
import { ResponseMessage } from 'src/common/enum/ResponseMessage.enum';
import { PrismaService } from 'src/config/database/database.config.service';
import { CreateWorkflowEdgeDTO } from '../dtos/workflow.dto';
import { WorkflowNodeService } from './workflowNode.service';

@Injectable()
export class WorkflowEdgeService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly workflowNodeService: WorkflowNodeService,
  ) {}

  async saveWorkflowEdge(workflowEdge: CreateWorkflowEdgeDTO) {
    try {
      const newWorkflowEdge = await this.prismaService.workflowEdge.upsert({
        where: { id: workflowEdge.id },
        create: workflowEdge,
        update: workflowEdge,
      });

      return newWorkflowEdge;
    } catch (error) {
      throw new Error(ResponseMessage.MESSAGE_TECHNICAL_ISSUE);
    }
  }

  async removeAllEdge(workflowId: string) {
    try {
      await this.prismaService.workflowEdge.deleteMany({
        where: { flowId: workflowId },
      });
    } catch (error) {
      throw new Error(ResponseMessage.MESSAGE_TECHNICAL_ISSUE);
    }
  }

  async findNextWorkflowNode(
    workflowId: string,
    workflowNodeId: string,
    workflowNodeName: string = null,
  ) {
    try {
      let edge = null;

      if (!workflowNodeName) {
        edge = await this.prismaService.workflowEdge.findFirst({
          where: {
            flowId: workflowId,
            sourceId: workflowNodeId,
          },
        });
      } else {
        edge = await this.prismaService.workflowEdge.findFirst({
          where: {
            flowId: workflowId,
            sourceId: workflowNodeId,
            sourceName: workflowNodeName,
          },
        });
      }

      if (!edge) return null;
      else {
        const nextNode = await this.workflowNodeService.findNodeById(
          workflowId,
          edge.targetId,
        );

        return nextNode;
      }
    } catch (error) {
      throw new Error(ResponseMessage.MESSAGE_TECHNICAL_ISSUE);
    }
  }
}
