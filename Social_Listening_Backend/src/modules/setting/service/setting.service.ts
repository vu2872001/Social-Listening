import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/database/database.config.service';
import { CreateSettingDTO } from '../dto/createSetting.dto';
import { UpdateSettingDTO } from '../dto/updateSetting.dto';

@Injectable()
export class SettingService {
  constructor(private readonly prismaService: PrismaService) {}

  async createSetting(setting: CreateSettingDTO) {
    return this.prismaService.setting.create({ data: setting });
  }

  async getAllSetting() {
    return this.prismaService.setting.findMany();
  }

  async getSettingByKeyAndGroup(key: string, group: string) {
    return this.prismaService.setting.findFirst({
      where: { AND: [{ group: group }, { key: key }] },
    });
  }

  async updateSetting(setting: UpdateSettingDTO) {
    const existedSetting = await this.getSettingByKeyAndGroup(
      setting.key,
      setting.group,
    );
    if (existedSetting) {
      return await this.prismaService.setting.update({
        where: { id: existedSetting.id },
        data: setting,
      });
    }
  }
}
