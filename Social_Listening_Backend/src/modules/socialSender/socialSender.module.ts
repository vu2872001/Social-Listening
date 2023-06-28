import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/config/database/database.config.module';
import { SocialSenderService } from './services/socialSender.service';

@Module({
  imports: [PrismaModule],
  controllers: [],
  providers: [SocialSenderService],
  exports: [SocialSenderService],
})
export class SocialSenderModule {}
