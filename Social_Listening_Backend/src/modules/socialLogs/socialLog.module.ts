import { PrismaModule } from 'src/config/database/database.config.module';
import { SocketModule } from '../sockets/socket.module';
import { Module, forwardRef } from '@nestjs/common';
import { SocialLogService } from './services/socialLog.service';
import { SocialLogController } from './controllers/socialLog.controller';
import { SocialGroupModule } from '../socialGroups/socialGroup.module';

@Module({
  imports: [SocketModule, PrismaModule, forwardRef(() => SocialGroupModule)],
  controllers: [SocialLogController],
  providers: [SocialLogService],
  exports: [SocialLogService],
})
export class SocialLogModule {}
