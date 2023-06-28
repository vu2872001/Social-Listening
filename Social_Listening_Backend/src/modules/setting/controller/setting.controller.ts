import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { SettingService } from '../service/setting.service';
import { QuerySettingDTO } from '../dto/querySetting.dto';
import { UpdateSettingDTO } from '../dto/updateSetting.dto';
import { SettingPerm } from '../enum/permission.enum';
import { PermissionGuard } from 'src/modules/auth/guards/permission.guard';

@Controller('setting')
export class SettingController {
  constructor(private readonly settingService: SettingService) {}

  @Get('getAllSetting')
  @UseGuards(PermissionGuard(SettingPerm.GetAllSetting.permission))
  async getAllSetting() {
    return await this.settingService.getAllSetting();
  }

  @Post('getSettingByKeyAndGroup')
  async getDatailSetting(@Body() settingData: QuerySettingDTO) {
    const setting = await this.settingService.getSettingByKeyAndGroup(
      settingData.key,
      settingData.group,
    );
    if (!setting) {
      throw new NotFoundException(
        `Not found setting with key ${settingData.key} and group ${settingData.group}`,
      );
    }

    return setting;
  }

  @Put('update-setting')
  @UseGuards(PermissionGuard(SettingPerm.UpdateSetting.permission))
  async updateSetting(@Body() updateSettingData: UpdateSettingDTO) {
    const setting = await this.settingService.getSettingByKeyAndGroup(
      updateSettingData.key,
      updateSettingData.group,
    );
    if (!setting) {
      throw new NotFoundException(
        `Not found setting with key ${updateSettingData.key} and group ${updateSettingData.group}`,
      );
    }

    return await this.settingService.updateSetting(updateSettingData);
  }
}
