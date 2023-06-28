import { Module } from '@nestjs/common';
import { PrismaService } from './database.config.service';
import { AdvancedFilteringService } from './advancedFiltering.service';

@Module({
  providers: [PrismaService, AdvancedFilteringService],
  exports: [PrismaService, AdvancedFilteringService],
})
export class PrismaModule {}
