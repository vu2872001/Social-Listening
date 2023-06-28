import { Module } from '@nestjs/common';
import { PrismaModule } from '../../config/database/database.config.module';
import { LogService } from './services/log.service';

@Module({
  imports: [PrismaModule],
  providers: [LogService],
  exports: [LogService],
})
export class LogModule {}
