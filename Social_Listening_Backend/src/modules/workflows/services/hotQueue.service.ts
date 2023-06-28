import { PrismaService } from 'src/config/database/database.config.service';
import { HotQueueDTO } from '../dtos/hotQueue.dto';
import { ResponseMessage } from 'src/common/enum/ResponseMessage.enum';
import { Injectable } from '@nestjs/common';
import { WorkflowGateway } from '../gateways/workflow.gateway';

@Injectable()
export class HotQueueService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly workflowGateway: WorkflowGateway,
  ) {}

  async findUserInHotQueue(
    senderId: string,
    tabId: string,
    messageType: string,
  ) {
    try {
      const user = await this.prismaService.userInHotQueue.findFirst({
        where: {
          senderId: senderId,
          tabId: tabId,
          messageType: messageType,
          delete: false,
        },
      });
      return user;
    } catch (error) {
      throw new Error(ResponseMessage.MESSAGE_TECHNICAL_ISSUE);
    }
  }

  async addToHotQueue(data: HotQueueDTO) {
    try {
      const createdData = await this.prismaService.userInHotQueue.create({
        data: data,
      });
      return createdData;
    } catch (error) {
      console.log(error);
      throw new Error(ResponseMessage.MESSAGE_TECHNICAL_ISSUE);
    }
  }

  async startHotQueue(data: HotQueueDTO) {
    try {
      const hotQueueData = await this.prismaService.userInHotQueue.findFirst({
        where: {
          delete: false,
          tabId: data.tabId,
          senderId: data.senderId,
          messageType: data.messageType,
        },
      });

      const createdData = await this.prismaService.userInHotQueue.update({
        where: { id: hotQueueData.id },
        data: { userId: data.userId, type: data.type },
      });

      this.workflowGateway.messageSupport(data.senderId, data.tabId);

      return createdData;
    } catch (error) {
      console.log(error);
      throw new Error(ResponseMessage.MESSAGE_TECHNICAL_ISSUE);
    }
  }

  async stopHotQueue(data: HotQueueDTO) {
    try {
      const user = await this.findUserInHotQueue(
        data.senderId,
        data.tabId,
        data.messageType,
      );
      if (!user) throw new Error();

      const deletedData = await this.prismaService.userInHotQueue.update({
        where: { id: user.id },
        data: { delete: true },
      });

      await this.prismaService.hotQueueMessage.updateMany({
        where: {
          OR: [
            {
              senderId: user.senderId,
            },
            {
              recipientId: user.senderId,
            },
          ],
          messageType: data.messageType,
          tabId: data.tabId,
          delete: false
        },
        data: { delete: true },
      });

      return deletedData;
    } catch (error) {
      throw new Error(ResponseMessage.MESSAGE_TECHNICAL_ISSUE);
    }
  }
}
