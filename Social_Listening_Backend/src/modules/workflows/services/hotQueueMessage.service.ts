import { Injectable } from '@nestjs/common';
import { ResponseMessage } from 'src/common/enum/ResponseMessage.enum';
import { PrismaService } from 'src/config/database/database.config.service';
import {
  HotQueueConversationGrouping,
  HotQueueMessageDTO,
} from '../dtos/hotQueueMessage.dto';
import { SocialTabService } from 'src/modules/socialGroups/services/socialTab.service';
import { SocialSenderService } from 'src/modules/socialSender/services/socialSender.service';
import { HotQueueService } from './hotQueue.service';
import { SortOrderType } from 'src/common/enum/sortOrderType.enum';

@Injectable()
export class HotQueueMessageService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly hotQueueService: HotQueueService,
    private readonly socialTabService: SocialTabService,
    private readonly socialSenderService: SocialSenderService,
  ) {}

  async checkThenSaveMessage(data: HotQueueMessageDTO) {
    try {
      const tabInfo = await this.socialTabService.getSocialTabInfo(data.tabId);
      const networkInfo = JSON.parse(tabInfo.SocialNetwork.extendData);
      const sender = await this.socialSenderService.findSender(networkInfo.id);

      const senderCheck =
        sender.id === data.senderId ? data.recipientId : data.senderId;
      const inHotQueue = await this.hotQueueService.findUserInHotQueue(
        senderCheck,
        data.tabId,
        data.messageType,
      );

      if (inHotQueue) {
        await this.saveHotQueueMessage(data);
      }
    } catch (error) {
      throw new Error(ResponseMessage.MESSAGE_TECHNICAL_ISSUE);
    }
  }

  async getConversation(listTabs: string[]) {
    try {
      const result = [];
      const listConversation: HotQueueConversationGrouping[] = [];

      const listNetwork = await Promise.all(
        listTabs.map(async (tabId) => {
          const tabInfo = await this.socialTabService.getSocialTabInfo(tabId);
          const networkInfo = JSON.parse(tabInfo.SocialNetwork.extendData);
          return networkInfo.id;
        }),
      );

      const listMessage = await this.prismaService.hotQueueMessage.findMany({
        where: {
          tabId: { in: listTabs },
          delete: false,
          tab: { delete: false },
        },
        include: { sender: true, recipient: true },
        orderBy: { dateCreated: SortOrderType.DESC },
      });

      await Promise.all(
        listMessage.map(async (conversation) => {
          if (!listNetwork.includes(conversation.sender.senderId)) {
            const userSend = !listNetwork.includes(conversation.sender.senderId)
              ? conversation.senderId
              : conversation.recipientId;

            const dataGrouping: HotQueueConversationGrouping = {
              senderId: userSend,
              messageType: conversation.messageType,
              messageId: null,
            };

            const checked = !listConversation.find(
              (x) => JSON.stringify(x) === JSON.stringify(dataGrouping),
            );

            if (checked) {
              listConversation.push(dataGrouping);
              const data = {
                sender: checked ? conversation.sender : conversation.recipient,
                from: conversation.senderId,
                message: conversation.message,
                type: conversation.messageType,
                lastSent: conversation.dateCreated,
                messageId: conversation.messageId,
                tabId: conversation.tabId,
              };

              const supportStatus =
                await this.hotQueueService.findUserInHotQueue(
                  data.sender.id,
                  data.tabId,
                  data.type,
                );

              result.push({
                ...data,
                userSupportId: supportStatus.userId,
                status: supportStatus.type,
                reason: supportStatus.reason,
              });
            }
          }
        }),
      );

      return result;
    } catch (error) {
      throw new Error(ResponseMessage.MESSAGE_TECHNICAL_ISSUE);
    }
  }

  private async saveHotQueueMessage(data: HotQueueMessageDTO) {
    try {
      const dataCreated = await this.prismaService.hotQueueMessage.create({
        data: data,
      });
      return dataCreated;
    } catch (error) {
      throw new Error(ResponseMessage.MESSAGE_TECHNICAL_ISSUE);
    }
  }
}
