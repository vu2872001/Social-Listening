import {
  Body,
  Controller,
  Param,
  Post,
  Req,
  UseGuards,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { MessageService } from '../services/message.service';
import { APIKeyGuard } from 'src/modules/auth/guards/apikey.guard';
import { MessageDTO, MessageInConversationDTO } from '../dtos/message.dto';
import { SocialSenderService } from 'src/modules/socialSender/services/socialSender.service';
import { ReturnResult } from 'src/common/models/dto/returnResult';
import { SocialTabService } from 'src/modules/socialGroups/services/socialTab.service';
import { WorkingState } from 'src/common/enum/workingState.enum';
import { JWTAuthGuard } from 'src/modules/auth/guards/jwtAuth.guard';
import { RequestWithUser } from 'src/modules/auth/interface/requestWithUser.interface';
import { UserInTabService } from 'src/modules/users/services/userInTab.service';
import { PagedData } from 'src/common/models/paging/pagedData.dto';
import { MessagePage } from '../dtos/messagePage.dto';
import { AdvancedFilteringService } from 'src/config/database/advancedFiltering.service';
import { SortOrderType } from 'src/common/enum/sortOrderType.enum';
import { WorkflowTypeEnum } from 'src/common/enum/workflowType.enum';
import { WorkflowNodeType } from 'src/common/enum/workflowNode.enum';
import { WorkflowService } from 'src/modules/workflows/services/workflow.service';
import { SentimentMessageDTO } from 'src/modules/socialMessage/dtos/socialMessage.dto';
import { ConversationPage } from '../dtos/conversationPage.dto';
import { HotQueueMessageService } from 'src/modules/workflows/services/hotQueueMessage.service';

@Controller('message')
export class MessageController {
  constructor(
    private readonly messageService: MessageService,
    private readonly workflowService: WorkflowService,
    private readonly socialTabService: SocialTabService,
    private readonly socialSenderService: SocialSenderService,
    private readonly userInTabService: UserInTabService,
    @Inject(forwardRef(() => HotQueueMessageService))
    private readonly hotQueueMessageService: HotQueueMessageService,
    private readonly advancedFilteringService: AdvancedFilteringService,
  ) {}

  @Post('save')
  @UseGuards(APIKeyGuard)
  async createMessage(@Body() message: MessageDTO) {
    const result = new ReturnResult<object>();

    try {
      const tab = await this.socialTabService.getTabByNetworkId(
        message.networkId,
      );
      if (tab.isWorked === WorkingState.Pause)
        throw new Error(`SocialTab is stopping`);

      let sender = await this.socialSenderService.findSender(message.sender.id);
      if (!sender) {
        sender = await this.socialSenderService.createSender({
          type: 'Facebook',
          senderId: message.sender.id,
          fullName: message.sender.name,
          avatarUrl: message.sender.avatar,
        });
      }

      let recipient = await this.socialSenderService.findSender(
        message.recipient.id,
      );
      if (!recipient) {
        recipient = await this.socialSenderService.createSender({
          type: 'Facebook',
          senderId: message.recipient.id,
          fullName: message.recipient.name,
          avatarUrl: message.recipient.avatar,
        });
      }

      const repliedMessage = await this.messageService.findMesssageByMessageId(
        message.repliedMessageId,
      );
      if (!repliedMessage) message.repliedMessageId = null;

      const newMessage = await this.messageService.createMessage({
        message: message.message,
        senderId: sender.id,
        recipientId: recipient.id,
        tabId: tab.id,
        messageId: message.messageId,
        repliedMessageId: message.repliedMessageId,
        createdAt:
          typeof message.createdAt === 'string'
            ? new Date(message.createdAt)
            : message.createdAt,
      });

      if (message.recipient.id === message.networkId) {
        // Identify the workflow
        await this.workflowService.tryCallHook(
          tab.id,
          WorkflowTypeEnum.Message,
          WorkflowNodeType.ReceiveMessage,
          {
            tabId: tab.id,
            messageId: newMessage.id,
            message: newMessage.message,
            messageType: WorkflowTypeEnum.Message,
          },
        );
      }

      // Send data to hot-queue
      await this.hotQueueMessageService.checkThenSaveMessage({
        tabId: tab.id,
        senderId: sender.id,
        recipientId: recipient.id,
        message: newMessage.message,
        messageType: 'Message',
        messageId: message.messageId,
      });

      result.result = newMessage;
    } catch (error) {
      result.message = error.message;
    }

    return result;
  }

  @Post('/:tabId/conversations')
  @UseGuards(JWTAuthGuard)
  async getAllConversation(
    @Req() request: RequestWithUser,
    @Param() { tabId },
    @Body() page: ConversationPage,
  ) {
    const user = request.user;
    const pagedData = new PagedData<object>(page);
    const result = new ReturnResult<PagedData<object>>();

    try {
      const exist = await this.userInTabService.checkUserInTab(user.id, tabId);
      if (!exist) throw new Error(`You are not allowed to access this page`);

      const tabInfo = await this.socialTabService.getSocialTabInfo(tabId);
      const networkInfo = JSON.parse(tabInfo.SocialNetwork.extendData);
      const sender = await this.socialSenderService.findSender(networkInfo.id);

      // const data = this.advancedFilteringService.createFilter(page);
      let listConversation = [];

      if (sender){
        listConversation = await this.messageService.getAllConversation(
          tabId,
          sender.id,
          page,
        );
      }
      pagedData.data = listConversation;
      pagedData.page.totalElement = listConversation.length;
      result.result = pagedData;
    } catch (error) {
      result.message = error.message;
    }

    return result;
  }

  @Post('/:tabId/conversations/:userId')
  @UseGuards(JWTAuthGuard)
  async getMessageInConversation(
    @Req() request: RequestWithUser,
    @Param() { tabId, userId },
    @Body() page: MessagePage,
  ) {
    const user = request.user;
    const pagedData = new PagedData<MessageInConversationDTO>(page);
    const result = new ReturnResult<PagedData<MessageInConversationDTO>>();
    try {
      const exist = await this.userInTabService.checkUserInTab(user.id, tabId);
      if (!exist) throw new Error(`You are not allowed to access this page`);

      const tabInfo = await this.socialTabService.getSocialTabInfo(tabId);
      const networkInfo = JSON.parse(tabInfo.SocialNetwork.extendData);
      const sender = await this.socialSenderService.findSender(networkInfo.id);

      page.filter = [];
      page.orders = [];
      if (!page.offset) page.offset = 0;

      const data = this.advancedFilteringService.createFilter(page);
      data.orders.push({ createdAt: SortOrderType.DESC });
      data.filter.AND.push({ tabId: tabId });
      data.filter.AND.push({
        OR: [
          { senderId: sender.id, recipientId: userId },
          { senderId: userId, recipientId: sender.id },
        ],
      });

      pagedData.data = await this.messageService.getMessageInConversation(data);
      pagedData.page.totalElement = await this.messageService.countMessage(
        data,
      );

      result.result = pagedData;
    } catch (error) {
      result.message = error.message;
    }

    return result;
  }

  @Post('calculate-sentiment')
  @UseGuards(APIKeyGuard)
  async calculateSentiment(@Body() message: SentimentMessageDTO) {
    const result = new ReturnResult<object>();

    try {
      const tab = await this.socialTabService.getSocialTabById(message.tabId);
      if (tab.isWorked === WorkingState.Pause)
        throw new Error(`SocialTab is stopping`);

      const messageUpdated = await this.messageService.updateSentiment(
        message.messageId,
        message.exactSentiment,
      );

      // Identify the workflow
      await this.workflowService.tryCallHook(
        tab.id,
        WorkflowTypeEnum.Message,
        WorkflowNodeType.SentimentAnalysis,
        message,
      );

      result.result = messageUpdated;
    } catch (error) {
      result.message = error.message;
    }
    return result;
  }
}
