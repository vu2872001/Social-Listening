import { Injectable } from '@nestjs/common';
import { CreateLogDTO } from 'src/common/models/dto/log.dto';
import { PrismaService } from 'src/config/database/database.config.service';

@Injectable()
export class LogService {
  constructor(private readonly prismaService: PrismaService) {}

  async createLog(createLogInfo: CreateLogDTO) {
    try {
      await this.prismaService.activityLog.create({
        data: createLogInfo,
      });
    } catch (error) {}
  }
}
