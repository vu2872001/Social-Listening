import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from 'src/config/database/database.config.module';
import { SocialSenderModule } from '../socialSender/socialSender.module';
import { MessageService } from './services/message.service';
import { MessageController } from './controllers/message.controller';
import { SocialGroupModule } from '../socialGroups/socialGroup.module';
import { UserModule } from '../users/user.module';
import { WorkflowModule } from '../workflows/workflow.module';

@Module({
  imports: [
    PrismaModule,
    SocialSenderModule,
    forwardRef(() => SocialGroupModule),
    forwardRef(() => UserModule),
    forwardRef(() => WorkflowModule),
  ],
  controllers: [MessageController],
  providers: [MessageService],
  exports: [MessageService],
})
export class MessageModule {}
