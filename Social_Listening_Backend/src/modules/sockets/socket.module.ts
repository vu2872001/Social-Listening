import { Module } from '@nestjs/common';
import { SocketService } from './services/socket.service';
import { PrismaModule } from 'src/config/database/database.config.module';

@Module({
  imports: [PrismaModule],
  controllers: [],
  providers: [SocketService],
  exports: [SocketService],
})
export class SocketModule {}
