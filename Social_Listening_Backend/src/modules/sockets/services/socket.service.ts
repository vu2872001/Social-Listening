import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/database/database.config.service';
import { SocketDTO } from '../dtos/socket.dto';

@Injectable()
export class SocketService {
  constructor(private readonly prismaService: PrismaService) {}

  async connect(data: SocketDTO) {
    // const existedConnection = await this.getConnection(data.userId);
    // if (existedConnection) await this.disconnect(data.userId);

    const connection = await this.prismaService.socketConnection.create({
      data: data,
    });
    return connection;
  }

  async getConnection(userId: string) {
    const socketToken = await this.prismaService.socketConnection.findFirst({
      where: { userId: userId },
    });
    return socketToken?.socketToken;
  }

  async disconnect(userId: string) {
    const connection = await this.getConnection(userId);
    if (connection) {
      return await this.prismaService.socketConnection.delete({
        where: { userId: userId },
      });
    }
  }
}
