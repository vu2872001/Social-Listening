import { plainToClass } from 'class-transformer';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/database/database.config.service';
import {
  ConnectSocialNetworkDTO,
  UpdateSocialNetworkDTO,
} from '../dtos/socialNetwork.dto';
import { ReturnResult } from 'src/common/models/dto/returnResult';
import { formatString } from 'src/utils/formatString';
import { ResponseMessage } from 'src/common/enum/ResponseMessage.enum';
import {
  excludeSocialNetwork,
  excludeSocialTab,
} from '../models/exclude.model';
import { excludeData } from 'src/utils/excludeData';
import { SocialNetworkModel } from '../models/socialNetwork.model';

@Injectable()
export class SocialNetworkService {
  constructor(private readonly prismaService: PrismaService) {}

  async connectSocialNetwork(data: ConnectSocialNetworkDTO) {
    const socialNetwork = await this.prismaService.socialNetwork.create({
      data: data,
    });
    const dataReturn = plainToClass(
      SocialNetworkModel,
      excludeData(socialNetwork, excludeSocialNetwork),
    );
    return dataReturn;
  }

  async updateSocialNetwork(data: UpdateSocialNetworkDTO) {
    const result = new ReturnResult<object>();
    try {
      const tab = await this.prismaService.socialTab.update({
        where: { id: data.id },
        data: { name: data.name },
      });
      result.result = excludeData(tab, excludeSocialTab);
    } catch (error) {
      console.log(error);
      result.message = formatString(ResponseMessage.MESSAGE_SAVE_ERROR, [
        'SocialNetwork',
      ]);
    }
    return result;
  }

  async getNetworkInfo(networkId: string) {
    try {
      const network = await this.prismaService.socialNetwork.findFirst({
        where: {
          extendData: {
            contains: `"id":"${networkId}"`,
          },
        },
      });

      return network;
    } catch (error) {
      throw new Error(ResponseMessage.MESSAGE_TECHNICAL_ISSUE);
    }
  }
}
