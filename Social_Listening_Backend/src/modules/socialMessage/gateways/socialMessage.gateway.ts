import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
export class SocialMessageGateway {
  @WebSocketServer()
  server: Server;

  async pushSocialLog(postId: string, roomId: string) {
    this.server.sockets.to(roomId).emit('messageCome-SocialLog', postId);
  }
}
