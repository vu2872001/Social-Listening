import { Module } from '@nestjs/common';
import { PrismaModule } from './../../config/database/database.config.module';
import { SettingService } from './service/setting.service';
import { SettingController } from './controller/setting.controller';

@Module({
  imports: [PrismaModule],
  controllers: [SettingController],
  providers: [SettingService],
  exports: [SettingService],
})
export class SettingModule {}
