import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/database/database.config.service';
import { SocialMessageDTO } from '../dtos/socialMessage.dto';
import { excludeData } from 'src/utils/excludeData';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@Injectable()
@WebSocketGateway()
export class SocialMessageService {
  @WebSocketServer()
  server: Server;

  constructor(private prismaService: PrismaService) {}

  async saveMessage(message: SocialMessageDTO) {
    const savedMessage = await this.prismaService.socialMessage.create({
      data: message,
    });

    await this.sendMessage(message, message.tabId);

    return savedMessage;
  }

  async findCommentById(messageId: string) {
    return await this.prismaService.socialMessage.findFirst({
      where: { id: messageId },
    });
  }

  async findCommentByCommentId(messageId: string) {
    return await this.prismaService.socialMessage.findFirst({
      where: { messageId: messageId },
    });
  }

  async getRootMessage(messageId: string) {
    const message = await this.findCommentById(messageId);
    if (!message) return message;

    const root = await this.getRootMessageById(message.parentId);
    if (!root) return message;
    else return root;
  }

  private async getRootMessageById(messageId) {
    return await this.prismaService.socialMessage.findFirst({
      where: { messageId: messageId },
    });
  }

  async getCommentPage(page) {
    const listComments = await this.prismaService.socialMessage.findMany({
      where: page.filter,
      orderBy: page.orders,
      skip: (page.pageNumber - 1) * page.size,
      take: page.size,
      include: { sender: true },
    });
    return listComments.map((data) =>
      excludeData(data, ['parentId', 'senderId']),
    );
  }

  async getAllConversation(messageId: string) {
    const listComments = await this.prismaService.socialMessage.findMany({
      where: { OR: [{ messageId: messageId }, { parentId: messageId }] },
      orderBy: { createdAt: 'asc' },
      include: { sender: true },
    });
    return listComments.map((data) =>
      excludeData(data, ['parentId', 'senderId']),
    );
  }
  async countComment(page) {
    const countComments = await this.prismaService.socialMessage.count({
      where: page.filter,
    });
    return countComments;
  }

  async updateSentiment(messageId: string, sentimentValue: number) {
    const message = await this.prismaService.socialMessage.update({
      where: { id: messageId },
      data: { sentiment: sentimentValue },
    });

    return message;
  }

  private async sendMessage(data: any, roomId: string) {
    this.server.sockets.to(roomId).emit('commentCome', data);
  }
}
