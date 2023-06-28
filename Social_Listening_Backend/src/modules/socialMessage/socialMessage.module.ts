import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from 'src/config/database/database.config.module';
import { SocialMessageService } from './services/socialMessage.service';
import { SocialMessageController } from './controllers/socialMessage.controller';
import { SocialGroupModule } from '../socialGroups/socialGroup.module';
import { SocialPostService } from './services/socialPost.service';
import { UserModule } from '../users/user.module';
import { SocialMessageGateway } from './gateways/socialMessage.gateway';
import { WorkflowModule } from '../workflows/workflow.module';
import { SocialSenderModule } from '../socialSender/socialSender.module';

@Module({
  imports: [
    PrismaModule,
    SocialSenderModule,
    forwardRef(() => UserModule),
    forwardRef(() => SocialGroupModule),
    forwardRef(() => WorkflowModule),
  ],
  controllers: [SocialMessageController],
  providers: [SocialMessageService, SocialPostService, SocialMessageGateway],
  exports: [SocialMessageService, SocialPostService],
})
export class SocialMessageModule {}
