import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { SocialSettingService } from '../services/socialSetting.service';
import { SocialSettingDTO } from '../dtos/socialSetting.dto';
import { ReturnResult } from 'src/common/models/dto/returnResult';
import { PermissionGuard } from 'src/modules/auth/guards/permission.guard';
import { SocialSettingPerm } from '../enum/permission.enum';
import { SocialSetting } from '../models/socialSetting.model';

@Controller('socialTabSeting')
export class SocialSettingController {
  constructor(private readonly socialSettingService: SocialSettingService) { }

  @Get('/:tabId')
  @UseGuards(PermissionGuard(SocialSettingPerm.GetAllSocialSetting.permission))
  async createNewSetting(@Param('tabId') tabId: string) {
    const result = new ReturnResult<SocialSetting[]>();
    try {
      const setting = await this.socialSettingService.getSocialSetting(tabId);
      result.result = setting;
    } catch (error) {
      result.message = error.message;
    }
    return result;
  }

  @Put('/:id/update')
  @UseGuards(PermissionGuard(SocialSettingPerm.UpdateSocialSetting.permission))
  async updateSetting(
    @Param() { id },
    @Body() socialSetting: SocialSettingDTO,
  ) {
    const result = new ReturnResult<object>();
    try {
      const existed = await this.socialSettingService.findSocialSetting(
        socialSetting.tabId,
        socialSetting.group,
        socialSetting.key,
      );
      if (!existed) throw new Error(`Can not update the social setting`);

      const setting = await this.socialSettingService.updateSocicalSetting(
        Number.parseInt(id),
        socialSetting,
      );
      result.result = setting;
    } catch (error) {
      result.message = error.message;
    }
    return result;
  }
}
