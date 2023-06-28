import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { ResponseMessage } from 'src/common/enum/ResponseMessage.enum';
import { PrismaService } from 'src/config/database/database.config.service';
import { WorkflowService } from './workflow.service';
import { SocialTabService } from 'src/modules/socialGroups/services/socialTab.service';
import { SocialMessageService } from 'src/modules/socialMessage/services/socialMessage.service';
import { SocialPostService } from 'src/modules/socialMessage/services/socialPost.service';
import { WorkflowTypeEnum } from 'src/common/enum/workflowType.enum';
import { MessageService } from 'src/modules/message/services/message.service';
import { SocialSenderService } from 'src/modules/socialSender/services/socialSender.service';

@Injectable()
export class WorkflowDataService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly tabService: SocialTabService,
    @Inject(forwardRef(() => WorkflowService))
    private readonly workflowService: WorkflowService,
    private readonly messageService: MessageService,
    private readonly socialSenderService: SocialSenderService,
    private readonly socialMessageService: SocialMessageService,
    private readonly postService: SocialPostService,
  ) {}

  async updateData(workflowId: string, messageId: string, data) {
    try {
      const workflowData = await this.getWorkflowData(workflowId, messageId);
      if (workflowData) {
        const oldWorkflowData = JSON.parse(workflowData?.data);
        const newWorkflowData = {
          ...oldWorkflowData,
          ...data,
        };

        const updatedData = await this.prismaService.workflowData.update({
          where: { id: workflowData.id },
          data: { data: JSON.stringify(newWorkflowData) },
        });

        return updatedData;
      } else if (data.messageType === WorkflowTypeEnum.Comment) {
        const message = await this.socialMessageService.findCommentById(
          messageId,
        );
        const rootMessage = await this.socialMessageService.getRootMessage(
          messageId,
        );
        const workflow = await this.workflowService.getWorkflowById(workflowId);
        const tabData = await this.tabService.getSocialTabInfo(workflow.tabId);
        const post = await this.postService.getSocialPostById(
          rootMessage.parentId,
        );
        const pageInfo = JSON.parse(tabData.SocialNetwork.extendData);
        const optionData = {
          ...data,
          flowId: workflowId,
          postId: post.postId,
          fb_message_id: message.messageId,
          pageId: pageInfo.id,
          pageName: pageInfo.name,
          avatarUrl: pageInfo.pictureUrl,
          token: pageInfo.accessToken,
        };

        const newData = await this.prismaService.workflowData.create({
          data: {
            flowId: workflowId,
            messageId: messageId,
            data: JSON.stringify(optionData),
          },
        });

        return newData;
      } else if (data.messageType === WorkflowTypeEnum.Message) {
        const workflow = await this.workflowService.getWorkflowById(workflowId);
        const tabData = await this.tabService.getSocialTabInfo(workflow.tabId);
        const pageInfo = JSON.parse(tabData.SocialNetwork.extendData);

        const message = await this.messageService.findCommentById(messageId);
        const sender = await this.socialSenderService.findSenderById(
          message.senderId,
        );
        const recipient = await this.socialSenderService.findSenderById(
          message.recipientId,
        );

        const optData = {
          ...data,
          flowId: workflowId,
          sender: sender,
          recipient: recipient,
          pageId: pageInfo.id,
          token: pageInfo.accessToken,
        };

        const newData = await this.prismaService.workflowData.create({
          data: {
            flowId: workflowId,
            messageId: messageId,
            data: JSON.stringify(optData),
          },
        });

        return newData;
      }
    } catch (error) {
      throw new Error(ResponseMessage.MESSAGE_TECHNICAL_ISSUE);
    }
  }

  async getWorkflowData(workflowId: string, messageId: string) {
    try {
      const workflowData = await this.prismaService.workflowData.findFirst({
        where: { flowId: workflowId, messageId: messageId },
      });
      return workflowData;
    } catch (error) {
      throw new Error(ResponseMessage.MESSAGE_TECHNICAL_ISSUE);
    }
  }
}
