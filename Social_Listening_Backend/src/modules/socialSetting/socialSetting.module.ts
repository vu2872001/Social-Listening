import { PrismaModule } from 'src/config/database/database.config.module';
import { SocialSettingController } from './controllers/socialSetting.controller';
import { SocialSettingService } from './services/socialSetting.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [PrismaModule],
  controllers: [SocialSettingController],
  providers: [SocialSettingService],
  exports: [SocialSettingService],
})
export class SocialSettingModule {}
