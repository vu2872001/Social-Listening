import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from 'src/config/database/database.config.service';
import { AuthService } from 'src/modules/auth/services/auth.service';
import { NotificationDTO } from '../dtos/notification.dto';
import { NotificationQueueService } from 'src/modules/queue/services/notification.queue.service';
import { plainToClass } from 'class-transformer';
import { NotificationModel } from '../model/notification.model';
import { ResponseMessage } from 'src/common/enum/ResponseMessage.enum';

@Injectable()
@WebSocketGateway()
export class NotificationService {
  @WebSocketServer()
  server: Server;

  constructor(
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    @Inject(forwardRef(() => NotificationQueueService))
    private readonly notificationQueue: NotificationQueueService,

    private readonly prismaService: PrismaService,
  ) {}

  async getUserFromSocket(socket: Socket) {
    try {
      const authToken = socket.handshake.auth.token;
      // const authToken = socket.handshake.headers.authorization;
      if (!authToken) throw new Error(`Invalid credentials`);
      const userId = await this.authService.getUserFromAuthToken(authToken);

      if (!userId) {
        socket.disconnect();
        throw new Error('Invalid credentials');
      }

      return userId;
    } catch (error) {
      return error.message;
    }
  }

  async createNotification(notificationDTO: NotificationDTO, sendTo: string) {
    const notification = await this.prismaService.notification.create({
      data: { ...notificationDTO, userId: sendTo },
    });

    const notificationModel = plainToClass(NotificationModel, notification);

    await this.sendNotification(notificationModel);
    return notification;
  }

  async pushNotification(notification: NotificationModel, socketToken: string) {
    this.server.sockets.to(socketToken).emit('sendNotification', notification);
  }

  async isReceived(notificationId: number) {
    const notification = await this.prismaService.notification.findFirst({
      where: { id: notificationId },
    });
    return notification?.status;
  }

  async receiveNotification(notificationId: number) {
    await this.prismaService.notification.update({
      where: { id: notificationId },
      data: { status: 'Received' },
    });
  }

  async clickNotification(notificationId: number) {
    await this.prismaService.notification.update({
      where: { id: notificationId },
      data: { isClick: true },
    });
  }

  async getNotificationByUserId(page: any) {
    const listNotification = await this.prismaService.notification.findMany({
      where: page.filter,
      orderBy: page.orders,
      skip: (page.pageNumber - 1) * page.size + page.offset,
      take: page.size,
    });

    return listNotification;
  }

  async countNotification(userId: string) {
    return await this.prismaService.notification.count({
      where: { userId: userId },
    });
  }

  async readAllNotification(userId: string) {
    try {
      const listNotifications = await this.prismaService.notification.findMany({
        where: { userId: userId },
      });

      await this.prismaService.notification.updateMany({
        where: { id: { in: listNotifications.map((x) => x.id) } },
        data: { isClick: true },
      });

      return true;
    } catch (error) {
      throw new Error(ResponseMessage.MESSAGE_TECHNICAL_ISSUE);
    }
  }

  private async sendNotification(notification) {
    return this.notificationQueue.addNotificationToQueue(notification);
  }
}
