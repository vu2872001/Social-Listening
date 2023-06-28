import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/database/database.config.service';
import {
  CreateSocialGroupDTO,
  EditSocialGroupDTO,
} from '../dtos/socialGroup.dto';
import { SocialTabDTO } from '../dtos/socialTab.dto';
import { defaultSetting } from 'src/modules/socialSetting/enum/defaultSetting.enum';
import { SocialSettingService } from 'src/modules/socialSetting/services/socialSetting.service';
import { SocialSettingDTO } from 'src/modules/socialSetting/dtos/socialSetting.dto';

@Injectable()
export class SocialGroupService {
  listSetting;
  constructor(
    private readonly prismaService: PrismaService,
    private readonly socialSettingService: SocialSettingService,
  ) {
    this.listSetting = defaultSetting;
  }

  async createSocailGroup(data: CreateSocialGroupDTO) {
    const newSocialGroup = await this.prismaService.socialGroup.create({
      data: data,
    });
    return newSocialGroup;
  }

  async editSocialGroup(data: EditSocialGroupDTO) {
    const editedSocialGroup = await this.prismaService.socialGroup.update({
      where: { id: data.id },
      data: data,
    });
    return editedSocialGroup;
  }

  async getSocialGroupByManagerId(userId: string) {
    const socialGroup = await this.prismaService.socialGroup.findFirst({
      where: { managerId: userId },
    });
    return socialGroup;
  }

  async getSocialGroupById(socialGroupId: string) {
    const socialGroup = await this.prismaService.socialGroup.findFirst({
      where: { id: socialGroupId },
      include: {
        manager: true,
      },
    });
    return socialGroup;
  }

  async createNewTab(data: SocialTabDTO) {
    const newTab = await this.prismaService.socialTab.create({
      data: {
        group: {
          connect: { id: data.groupId },
        },
        SocialNetwork: {
          connect: { id: data.socialId },
        },
        name: data.name,
      },
    });
    this.addSettingToTab(newTab.id);
    return newTab;
  }

  async checkActivate(userId: string) {
    const userInGroup = await this.prismaService.userInGroup.findFirst({
      where: { userId: userId, delete: false },
    });
    return userInGroup && userInGroup.isActive ? true : false;
  }

  private async addSettingToTab(tabId: string) {
    await Promise.all(
      this.listSetting.map(async (setting) => {
        const createdData = new SocialSettingDTO();
        createdData.tabId = tabId;
        createdData.group = setting.group;
        createdData.key = setting.key;
        createdData.value = setting.value;
        await this.socialSettingService.createSocialSetting(createdData);
      }),
    );
  }
}
