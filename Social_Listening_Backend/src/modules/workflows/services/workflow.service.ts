import { NotifyAgentMessageTypeEnum } from './../../../common/enum/notifyAgentMessageType.enum';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ResponseMessage } from 'src/common/enum/ResponseMessage.enum';
import { PrismaService } from 'src/config/database/database.config.service';
import { excludeData } from 'src/utils/excludeData';
import { WorkflowActivationDTO } from '../dtos/workflowActivation.dto';
import {
  CreateWorkflowDTO,
  CreateWorkflowEdgeDTO,
  CreateWorkflowNodeDTO,
  CreateWorkflowVariableDTO,
  WorkflowDTO,
} from '../dtos/workflow.dto';
import { WorkflowNodeService } from './workflowNode.service';
import { WorkflowEdgeService } from './workflowEdge.service';
import { WorkflowVariableService } from './workflowVariable.service';
import { WorkflowNodeType } from 'src/common/enum/workflowNode.enum';
import { Helper } from 'src/utils/hepler';
import { WorkflowDataService } from './workflowData.service';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { HotQueueService } from './hotQueue.service';
import { MessageService } from 'src/modules/message/services/message.service';
import { SocialMessageService } from 'src/modules/socialMessage/services/socialMessage.service';
import { WorkflowTypeEnum } from 'src/common/enum/workflowType.enum';
import { HotQueueMessageService } from './hotQueueMessage.service';
import { SocialSenderService } from 'src/modules/socialSender/services/socialSender.service';
import { SettingService } from 'src/modules/setting/service/setting.service';

@Injectable()
@WebSocketGateway()
export class WorkflowService {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly httpService: HttpService,
    private readonly prismaService: PrismaService,
    private readonly settingService: SettingService,
    private readonly messageService: MessageService,
    private readonly hotQueueService: HotQueueService,
    private readonly nodeService: WorkflowNodeService,
    private readonly edgeService: WorkflowEdgeService,
    private readonly dataService: WorkflowDataService,
    private readonly variableService: WorkflowVariableService,
    private readonly socialSenderService: SocialSenderService,
    private readonly socialMessageService: SocialMessageService,
    private readonly hotQueueMessageService: HotQueueMessageService,
  ) {}

  async getAllWorkflow(page) {
    try {
      const listWorkflow = await this.prismaService.workflow.findMany({
        where: page.filter,
        orderBy: page.orders,
        include: {
          socialTab: true,
        },
        skip: (page.pageNumber - 1) * page.size,
        take: page.size,
      });

      return listWorkflow.map((workflow) => {
        excludeData(workflow.socialTab, ['delete']);
        return excludeData(workflow, ['delete']);
      });
    } catch (error) {
      throw new Error(ResponseMessage.MESSAGE_TECHNICAL_ISSUE);
    }
  }

  async countWorkflow(page) {
    try {
      const countWorkflow = await this.prismaService.workflow.count({
        where: page.filter,
      });
      return countWorkflow;
    } catch (error) {
      throw new Error(ResponseMessage.MESSAGE_TECHNICAL_ISSUE);
    }
  }

  async getWorkflowById(workflowId: string) {
    try {
      const workflow = await this.prismaService.workflow.findFirst({
        where: {
          id: workflowId,
          delete: false,
        },
      });
      return workflow;
    } catch (error) {
      throw new Error(ResponseMessage.MESSAGE_TECHNICAL_ISSUE);
    }
  }

  async deactivateAllWorkflow(workflowType: string) {
    try {
      await this.prismaService.workflow.updateMany({
        where: { type: workflowType },
        data: { isActive: false },
      });
    } catch (error) {
      throw new Error(ResponseMessage.MESSAGE_TECHNICAL_ISSUE);
    }
  }

  async updateActivation(workflowId: string, data: WorkflowActivationDTO) {
    try {
      const workflow = await this.prismaService.workflow.update({
        where: { id: workflowId },
        data: { isActive: data.activate },
      });
      return excludeData(workflow, ['delete']);
    } catch (error) {
      throw new Error(ResponseMessage.MESSAGE_TECHNICAL_ISSUE);
    }
  }

  async deleteWorkflow(workflowId: string) {
    try {
      const workflow = await this.prismaService.workflow.update({
        where: { id: workflowId },
        data: { delete: true },
      });
      return excludeData(workflow, ['delete']);
    } catch (error) {
      throw new Error(ResponseMessage.MESSAGE_TECHNICAL_ISSUE);
    }
  }

  async createWorkflow(workflow: WorkflowDTO) {
    try {
      const listNode = workflow.data.nodes;
      const listEdge = workflow.data.edges;
      const listVariable = workflow.data.variables;
      const createWorkflowData: CreateWorkflowDTO = {
        name: workflow.name,
        type: workflow.type,
        tabId: workflow.tabId,
        extendData: JSON.stringify(workflow.data),
      };

      const workflowData = await this.saveWorkflowData(createWorkflowData);
      await Promise.all([
        listNode.map(async (node) => {
          const workflowNodeData: CreateWorkflowNodeDTO = {
            id: node.id,
            flowId: workflowData.id,
            type: node.type,
            position_X: node.position.x,
            position_Y: node.position.y,
            data: JSON.stringify(node.data),
          };

          await this.nodeService.saveWorkflowNode(workflowNodeData);
        }),
        listEdge.map(async (edge) => {
          const workflowEdgeData: CreateWorkflowEdgeDTO = {
            id: edge.id,
            flowId: workflowData.id,
            sourceId: edge.source,
            sourceName: edge.sourceHandle,
            targetId: edge.target,
            targetName: edge.targetHandle,
          };

          await this.edgeService.saveWorkflowEdge(workflowEdgeData);
        }),
        listVariable.map(async (variable) => {
          const workflowVariableData: CreateWorkflowVariableDTO = {
            id: variable,
            flowId: workflowData.id,
            variableName: variable,
          };
          await this.variableService.saveWorkflowVariable(workflowVariableData);
        }),
      ]);

      excludeData(workflowData, ['delete']);
      return workflowData;
    } catch (error) {
      throw new Error(ResponseMessage.MESSAGE_TECHNICAL_ISSUE);
    }
  }

  async updateWorkflow(workflowId: string, workflow: WorkflowDTO) {
    try {
      const listNode = workflow.data.nodes;
      const listEdge = workflow.data.edges;
      const listVariable = workflow.data.variables;
      const createWorkflowData: CreateWorkflowDTO = {
        id: workflowId,
        name: workflow.name,
        type: workflow.type,
        tabId: workflow.tabId,
        extendData: JSON.stringify(workflow.data),
      };

      const workflowData = await this.saveWorkflowData(createWorkflowData);

      await this.nodeService.removeAllNode(workflowId);
      await this.edgeService.removeAllEdge(workflowId);
      await this.variableService.removeAllVariable(workflowId);

      await Promise.all(
        listNode.map(async (node) => {
          const workflowNodeData: CreateWorkflowNodeDTO = {
            id: node.id,
            flowId: workflowData.id,
            type: node.type,
            position_X: node.position.x,
            position_Y: node.position.y,
            data: JSON.stringify(node.data),
          };

          await this.nodeService.saveWorkflowNode(workflowNodeData);
        }),
      );
      await Promise.all(
        listEdge.map(async (edge) => {
          const workflowEdgeData: CreateWorkflowEdgeDTO = {
            id: edge.id,
            flowId: workflowData.id,
            sourceId: edge.source,
            sourceName: edge.sourceHandle,
            targetId: edge.target,
            targetName: edge.targetHandle,
          };

          await this.edgeService.saveWorkflowEdge(workflowEdgeData);
        }),
      );

      await Promise.all(
        listVariable.map(async (variable) => {
          const existedVariable = await this.variableService.findVariable(
            workflowData.id,
            variable,
          );
          const workflowVariableData: CreateWorkflowVariableDTO = {
            id: existedVariable ? existedVariable.id : variable,
            flowId: workflowData.id,
            variableName: variable,
          };

          await this.variableService.saveWorkflowVariable(workflowVariableData);
        }),
      );

      excludeData(workflowData, ['delete']);
      return workflowData;
    } catch (error) {
      throw new Error(ResponseMessage.MESSAGE_TECHNICAL_ISSUE);
    }
  }

  async haveReceiveMessageNode(tabId: string, workflowType: string) {
    try {
      const workflowActive = await this.prismaService.workflow.findFirst({
        where: {
          tabId: tabId,
          delete: false,
          isActive: true,
          type: workflowType,
        },
      });
      if (!workflowActive) return false;

      const receiveNode = await this.nodeService.findReceiveNode(
        workflowActive.id,
      );

      return receiveNode ? true : false;
    } catch (error) {
      throw new Error(ResponseMessage.MESSAGE_TECHNICAL_ISSUE);
    }
  }

  async tryCallHook(
    tabId: string,
    type: string,
    currentNodeType: string,
    data: any,
  ) {
    try {
      const userSend =
        type === WorkflowTypeEnum.Message
          ? await this.messageService.findCommentById(data['messageId'])
          : await this.socialMessageService.findCommentById(data['messageId']);

      const willContinue = await this.hotQueueService.findUserInHotQueue(
        userSend.senderId,
        tabId,
        type,
      );
      if (willContinue) {
        return;
      }

      const workflow = await this.findWorkflowByTabId(tabId, type);
      await this.dataService.updateData(workflow.id, data['messageId'], data);
      const currentNode = await this.nodeService.findNodeByFlowId(
        workflow.id,
        currentNodeType,
      );

      switch (currentNodeType) {
        case WorkflowNodeType.ReceiveMessage:
          const nextNode = await this.edgeService.findNextWorkflowNode(
            workflow.id,
            currentNode.id,
          );

          if (nextNode) {
            await this.callService(
              workflow.id,
              data['messageId'],
              nextNode.type,
              {
                replyInfo: JSON.parse(nextNode.data),
                notifyAgentMessage: NotifyAgentMessageTypeEnum.Workflow,
              },
            );
          }
          break;
        case WorkflowNodeType.SentimentAnalysis:
          let canStopFlow = false;
          const nodeData = JSON.parse(currentNode.data);
          const range = Helper.getSentimentRange(nodeData.sentiment);
          const maxSentimentAlert = nodeData['conditionNotifyAgent'];

          if (maxSentimentAlert > 0) {
            const numberSentiment = data['sentiment'];
            if (numberSentiment >= maxSentimentAlert) {
              canStopFlow = true;
              await this.callService(
                workflow.id,
                data['messageId'],
                WorkflowNodeType.NotifyAgent,
                {
                  notifyAgentMessage: NotifyAgentMessageTypeEnum.Sentiment,
                },
                true,
              );
            }
          }

          if (!canStopFlow) {
            const sentimentType = this.getSentimentType(
              range,
              data['exactSentiment'],
            );
            const nodeName = nodeData.handle[sentimentType];

            const nextNode = await this.edgeService.findNextWorkflowNode(
              workflow.id,
              currentNode.id,
              nodeName,
            );

            if (nextNode) {
              await this.callService(
                workflow.id,
                data['messageId'],
                nextNode.type,
                {
                  replyInfo: JSON.parse(nextNode.data),
                },
                true,
              );
            }
          }

          break;
        case WorkflowNodeType.ResponseMessage:
          break;
        case WorkflowNodeType.NotifyAgent:
          await this.callService(
            workflow.id,
            data['messageId'],
            WorkflowNodeType.NotifyAgent,
            {
              notifyAgentMessage:
                data.notifyAgentMessage === NotifyAgentMessageTypeEnum.Intent
                  ? NotifyAgentMessageTypeEnum.Intent
                  : NotifyAgentMessageTypeEnum.Workflow,
            },
            true,
          );
          break;
      }
    } catch (error) {
      throw new Error(ResponseMessage.MESSAGE_TECHNICAL_ISSUE);
    }
  }

  private async findWorkflowByTabId(tabId: string, type: string) {
    try {
      const workflowActive = await this.prismaService.workflow.findFirst({
        where: { tabId: tabId, type: type, isActive: true },
      });

      return workflowActive;
    } catch (error) {
      throw new Error(ResponseMessage.MESSAGE_TECHNICAL_ISSUE);
    }
  }

  private async saveWorkflowData(workflow: CreateWorkflowDTO) {
    try {
      let newWorkflow = null;
      if (!workflow.id) {
        newWorkflow = await this.prismaService.workflow.create({
          data: workflow,
        });
      } else {
        newWorkflow = await this.prismaService.workflow.update({
          where: { id: workflow.id },
          data: workflow,
        });
      }

      return newWorkflow;
    } catch (error) {
      throw new Error(ResponseMessage.MESSAGE_TECHNICAL_ISSUE);
    }
  }

  private getSentimentType(data, sentimentValue: number) {
    let sentiment: string = null;
    Object.keys(data).forEach((key) => {
      const range = data[key];
      if (sentimentValue >= range.min && sentimentValue < range.max) {
        sentiment = key;
      }
    });

    return sentiment;
  }

  private async callService(
    flowId: string,
    messageId: string,
    nodeType: string,
    optData = null,
    callSaveData = false,
  ) {
    let senderID = null;
    const flowData = await this.dataService.getWorkflowData(flowId, messageId);
    const data = { ...JSON.parse(flowData.data), ...optData };

    const URI = await this.settingService.getSettingByKeyAndGroup(
      'DOMAIN_BOT',
      'DOMAIN',
    );

    switch (nodeType) {
      case WorkflowNodeType.ReceiveMessage:
        break;
      case WorkflowNodeType.SentimentAnalysis:
        this.httpService.post(`${URI.value}/sentiment`, data).subscribe();
        break;
      case WorkflowNodeType.ResponseMessage:
        this.httpService.post(`${URI.value}/reply-message`, data).subscribe();
        break;
      case WorkflowNodeType.NotifyAgent:
        const workflow = await this.getWorkflowById(flowId);

        if (data.messageType === 'Message') {
          const messageInfo = await this.messageService.findCommentById(
            data.messageId,
          );

          senderID = messageInfo.senderId;

          await this.hotQueueService.addToHotQueue({
            type: 'Not Supported',
            tabId: data.tabId,
            messageType: data.messageType,
            senderId: messageInfo.senderId,
            reason:
              data.notifyAgentMessage ?? NotifyAgentMessageTypeEnum.Workflow,
          });

          if (callSaveData) {
            await this.hotQueueMessageService.checkThenSaveMessage({
              tabId: data.tabId,
              message: data.message,
              messageType: 'Message',
              senderId: data.sender.id,
              recipientId: data.recipient.id,
              messageId: data.messageId,
            });
          }
        } else if (data.messageType === 'Comment') {
          const messageInfo = await this.socialMessageService.findCommentById(
            data.messageId,
          );

          senderID = messageInfo.senderId;

          await this.hotQueueService.addToHotQueue({
            type: 'Not Supported',
            tabId: data.tabId,
            messageType: data.messageType,
            senderId: messageInfo.senderId,
            reason:
              data.notifyAgentMessage ?? NotifyAgentMessageTypeEnum.Workflow,
          });

          if (callSaveData) {
            const recipientId = await this.socialSenderService.findSender(
              data.pageId,
            );

            await this.hotQueueMessageService.checkThenSaveMessage({
              tabId: data.tabId,
              message: data.message,
              messageId: data.messageId,
              messageType: data.messageType,
              senderId: messageInfo.senderId,
              recipientId: recipientId.id,
            });
          }
        }

        const sender = await this.socialSenderService.findSenderById(senderID);

        await this.notifyAgent(
          {
            messageId: data.messageId,
            tabId: data.tabId,
            messageType: data.messageType,
            notifyAgentMessage:
              data.notifyAgentMessage ?? NotifyAgentMessageTypeEnum.Workflow,
            sender: sender,
          },
          workflow.tabId,
        );

        break;
    }
  }

  private async notifyAgent(data: any, roomId: string) {
    this.server.sockets.to(roomId).emit('notifyAgent', data);
  }
}
