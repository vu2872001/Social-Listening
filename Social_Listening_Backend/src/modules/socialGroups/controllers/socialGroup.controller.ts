import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SocialGroupService } from '../services/socialGroup.service';
import { RequestWithUser } from 'src/modules/auth/interface/requestWithUser.interface';
import { ReturnResult } from 'src/common/models/dto/returnResult';
import { SocialGroup } from '../models/socialGroup.model';
import { RoleGuard } from 'src/modules/auth/guards/role.guard';
import { EditSocialGroupDTO } from '../dtos/socialGroup.dto';
import { JWTAuthGuard } from 'src/modules/auth/guards/jwtAuth.guard';
import { SocialTabService } from '../services/socialTab.service';
import { ResponseMessage } from 'src/common/enum/ResponseMessage.enum';

@Controller('socialGroup')
export class SocialGroupController {
  constructor(
    private readonly socialGroupService: SocialGroupService,
    private readonly socialTabService: SocialTabService,
  ) {}

  @Get()
  @UseGuards(RoleGuard('OWNER'))
  async getSocialGroup(@Req() request: RequestWithUser) {
    const user = request.user;
    const result = new ReturnResult<SocialGroup>();
    try {
      const socialGroup =
        await this.socialGroupService.getSocialGroupByManagerId(user.id);
      if (socialGroup) result.result = socialGroup;
      else throw new Error();
    } catch (error) {
      result.message = 'No social group found';
    }
    return result;
  }

  @Put('/:id')
  @UseGuards(RoleGuard('OWNER'))
  async updateSocialGroup(
    @Req() request: RequestWithUser,
    @Param() { id },
    @Body() data: EditSocialGroupDTO,
  ) {
    const user = await request.user;
    const result = new ReturnResult<SocialGroup>();
    try {
      const group = await this.socialGroupService.getSocialGroupById(id);
      if (!group) throw new Error(`Not found social group`);
      else if (group.managerId !== user.id) {
        throw new Error(`Something went wrong`);
      }

      const updatedSocialGroup = await this.socialGroupService.editSocialGroup({
        ...data,
        id: group.id,
      });
      result.result = updatedSocialGroup;
    } catch (error) {
      result.message = error.message;
    }
    return result;
  }

  @Get('/social-tab')
  @UseGuards(JWTAuthGuard)
  async getAllSocialTab(@Req() request: RequestWithUser) {
    const user = request.user;
    const result = new ReturnResult<object[]>();
    try {
      const isActivate = await this.socialGroupService.checkActivate(user.id);

      const listTab = await this.socialTabService.getAllSocialTab(user.id);
      result.result = listTab.map((tab) => {
        return {
          ...tab,
          isActive: isActivate,
        };
      });
    } catch (error) {
      result.message = ResponseMessage.MESSAGE_TECHNICAL_ISSUE;
    }
    return result;
  }
}
