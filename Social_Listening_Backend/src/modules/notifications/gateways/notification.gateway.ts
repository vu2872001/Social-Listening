import { Logger } from '@nestjs/common';
import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NotificationService } from '../services/notification.service';
import { SocketService } from 'src/modules/sockets/services/socket.service';
import { SocialTabService } from 'src/modules/socialGroups/services/socialTab.service';

@WebSocketGateway()
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(NotificationGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly connectStore: SocketService,
    private readonly socialTabService: SocialTabService,
    private readonly notificationService: NotificationService,
  ) {}

  async handleConnection(socket: Socket) {
    const userId = await this.notificationService.getUserFromSocket(socket);
    if (userId === 'Invalid credentials') socket.disconnect();
    else {
      const socketToken = socket.id;

      const listTabs = await this.socialTabService.getAllSocialTab(userId);
      listTabs.map((tab) => {
        socket.join(tab.id);
        this.logger.log(`User with id: ${userId} join room with id: ${tab.id}`);
      });

      await this.connectStore.connect({
        userId: userId,
        socketToken: socketToken,
      });
      this.logger.log(`User with id: ${userId} connect to Socket`);
    }
  }

  async handleDisconnect(socket: Socket) {
    const userId = await this.notificationService.getUserFromSocket(socket);
    if (userId === 'Invalid credentials') socket.disconnect();
    else {
      await this.connectStore.disconnect(userId);
    }
    this.logger.log(`User with id: ${userId} disconnect Socket`);
  }

  @SubscribeMessage('receiveNotification')
  async receiveNotification(@MessageBody() notificationId: string) {
    if (!isNaN(Number(notificationId))) {
      const id = Number.parseInt(notificationId);
      await this.notificationService.receiveNotification(id);
    }
  }

  @SubscribeMessage('clickNotification')
  async clickNotification(@MessageBody() notificationId: string) {
    if (!isNaN(Number(notificationId))) {
      const id = Number.parseInt(notificationId);
      await this.notificationService.clickNotification(id);
    }
  }
}
