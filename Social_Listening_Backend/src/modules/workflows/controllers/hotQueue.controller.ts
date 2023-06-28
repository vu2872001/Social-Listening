import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { HotQueueService } from '../services/hotQueue.service';
import { ReturnResult } from 'src/common/models/dto/returnResult';
import { JWTAuthGuard } from 'src/modules/auth/guards/jwtAuth.guard';
import { FindSenderHotQueueDTO } from '../dtos/hotQueue.dto';
import { HotQueueMessageService } from '../services/hotQueueMessage.service';
import { RequestWithUser } from 'src/modules/auth/interface/requestWithUser.interface';
import { UserInTabService } from 'src/modules/users/services/userInTab.service';

@Controller('hotqueue')
export class HotQueueController {
  constructor(
    private readonly hotQueueService: HotQueueService,
    private readonly userInTabService: UserInTabService,
    private readonly hotQueueMessageService: HotQueueMessageService,
  ) {}

  @Post('sender/find')
  @UseGuards(JWTAuthGuard)
  async getHotQueueInfo(@Body() data: FindSenderHotQueueDTO) {
    const result = new ReturnResult<object>();
    try {
      const hotQueue = await this.hotQueueService.findUserInHotQueue(
        data.senderId,
        data.tabId,
        data.messageType,
      );
      if (!hotQueue) {
        throw new Error(`Sender is not supported or is not in hot-queue`);
      }
      result.result = hotQueue;
    } catch (error) {
      result.message = error.message;
    }
    return result;
  }

  @Post('conversation')
  @UseGuards(JWTAuthGuard)
  async getAllConversation(@Req() request: RequestWithUser) {
    const result = new ReturnResult<object[]>();
    try {
      const user = request.user;
      const listTabs = await this.userInTabService.getAllTabWithUser(user.id);
      const listConversation =
        await this.hotQueueMessageService.getConversation(listTabs);
      result.result = listConversation;
    } catch (error) {
      result.message = error.message;
    }
    return result;
  }
}
