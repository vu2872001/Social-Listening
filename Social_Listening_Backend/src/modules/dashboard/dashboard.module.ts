import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/config/database/database.config.module';
import { DashboardController } from './controller/dashboard.controller';
import { DashboardService } from './service/dashboard.service';
import { SocialGroupModule } from '../socialGroups/socialGroup.module';
import { SocialSenderModule } from '../socialSender/socialSender.module';
import { UserModule } from '../users/user.module';

@Module({
  imports: [PrismaModule, SocialGroupModule, SocialSenderModule, UserModule],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashBoardModule {}
