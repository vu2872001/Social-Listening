import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/database/database.config.service';
import { SocialSenderDTO } from '../dtos/socialSender.dto';
import { ResponseMessage } from 'src/common/enum/ResponseMessage.enum';

@Injectable()
export class SocialSenderService {
  constructor(private readonly prismaService: PrismaService) {}

  async createSender(data: SocialSenderDTO) {
    try {
      const sender = await this.prismaService.socialSender.create({
        data: data,
      });

      return sender;
    } catch (error) {
      throw new Error(ResponseMessage.MESSAGE_TECHNICAL_ISSUE);
    }
  }

  async findSender(senderId: string) {
    try {
      const sender = await this.prismaService.socialSender.findFirst({
        where: { senderId: senderId },
      });

      return sender;
    } catch (error) {
      throw new Error(ResponseMessage.MESSAGE_TECHNICAL_ISSUE);
    }
  }

  async findSenderById(senderId: string) {
    try {
      const sender = await this.prismaService.socialSender.findFirst({
        where: { id: senderId },
      });

      return sender;
    } catch (error) {
      throw new Error(ResponseMessage.MESSAGE_TECHNICAL_ISSUE);
    }
  }
}
