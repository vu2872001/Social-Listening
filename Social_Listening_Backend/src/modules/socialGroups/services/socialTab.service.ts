import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { ResponseMessage } from 'src/common/enum/ResponseMessage.enum';
import { PrismaService } from 'src/config/database/database.config.service';
import { SocialNetworkService } from 'src/modules/socialNetworks/services/socialNetwork.service';
import { excludeData } from 'src/utils/excludeData';

@Injectable()
export class SocialTabService {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(forwardRef(() => SocialNetworkService))
    private readonly socialNetworkService: SocialNetworkService,
  ) {}

  async getAllSocialTab(userId: string) {
    const listTab = await this.prismaService.userInTab.findMany({
      where: {
        userId: userId,
        delete: false,
        socialTab: {
          delete: false,
        },
      },
      include: {
        socialTab: {
          include: {
            SocialNetwork: true,
          },
        },
      },
    });

    return listTab.map((tab) => {
      const dataReturn = tab.socialTab;
      return excludeData(dataReturn, ['delete']);
    });
  }

  async getSocialTabById(tabId: string) {
    return await this.prismaService.socialTab.findFirst({
      where: { id: tabId },
    });
  }

  async updateWorkingStateById(tabId: string, state: boolean) {
    return await this.prismaService.socialTab.update({
      where: { id: tabId },
      data: { isWorked: state },
    });
  }

  async removeTabById(tabId: string) {
    return await this.prismaService.socialTab.update({
      where: { id: tabId },
      data: { delete: true },
    });
  }

  async getTabByNetworkId(networkId: string) {
    const socialTab = await this.prismaService.socialTab.findFirst({
      where: {
        SocialNetwork: {
          extendData: {
            contains: `"id":"${networkId}"`,
          },
        },
      },
    });

    return socialTab;
  }

  async getSocialTabInfo(tabId: string) {
    try {
      const socialTab = await this.prismaService.socialTab.findFirst({
        where: { id: tabId },
        include: { SocialNetwork: true },
      });

      return socialTab;
    } catch (error) {
      throw new Error(ResponseMessage.MESSAGE_TECHNICAL_ISSUE);
    }
  }

  async getAllTab() {
    try {
      const listTab = await this.prismaService.socialTab.findMany({});
      return listTab;
    } catch (error) {
      throw new Error(ResponseMessage.MESSAGE_TECHNICAL_ISSUE);
    }
  }
}
