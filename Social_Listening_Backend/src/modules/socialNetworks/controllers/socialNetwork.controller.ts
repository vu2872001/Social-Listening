import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SocialNetworkService } from '../services/socialNetwork.service';
import { RequestWithUser } from 'src/modules/auth/interface/requestWithUser.interface';
import {
  ConnectSocialNetworkDTO,
  UpdateSocialNetworkDTO,
} from '../dtos/socialNetwork.dto';
import { PermissionGuard } from 'src/modules/auth/guards/permission.guard';
import { SocialNetworkPerm } from '../enum/permission.enum';
import { SocialGroupService } from 'src/modules/socialGroups/services/socialGroup.service';
import { ReturnResult } from 'src/common/models/dto/returnResult';
import { ResponseMessage } from 'src/common/enum/ResponseMessage.enum';
import { RoleService } from 'src/modules/roles/services/role.service';
import { UserInTabService } from 'src/modules/users/services/userInTab.service';
import { APIKeyGuard } from 'src/modules/auth/guards/apikey.guard';

@Controller('socialNetwork')
export class SocialNetworkController {
  constructor(
    private readonly roleService: RoleService,
    private readonly groupService: SocialGroupService,
    private readonly userInTabService: UserInTabService,
    private readonly socialNetworkService: SocialNetworkService,
  ) {}

  @Post('/connect')
  @UseGuards(PermissionGuard(SocialNetworkPerm.connectSocialNetwork.permission))
  async connectSocialNetwork(
    @Req() request: RequestWithUser,
    @Body() socialNetwork: ConnectSocialNetworkDTO,
  ) {
    const user = request.user;
    const result = new ReturnResult<object>();

    try {
      const role = await this.roleService.getRoleByRoleName(user.role);

      const group = await this.groupService.getSocialGroupByManagerId(user.id);
      if (!group)
        throw new Error(`You don't have permission to connect social network`);

      const socialNetworkCreated =
        await this.socialNetworkService.connectSocialNetwork(socialNetwork);
      if (!socialNetworkCreated)
        throw new Error(ResponseMessage.MESSAGE_TECHNICAL_ISSUE);

      const tabCreated = await this.groupService.createNewTab({
        name: socialNetworkCreated.name,
        groupId: group.id,
        socialId: socialNetworkCreated.id,
      });
      if (!tabCreated) throw new Error(ResponseMessage.MESSAGE_TECHNICAL_ISSUE);

      await this.userInTabService.addUserToTab(user.id, tabCreated.id, role.id);

      result.result = socialNetworkCreated;
    } catch (error) {
      result.message = error.message;
    }
    return result;
  }

  @Put('/edit')
  @UseGuards(PermissionGuard(SocialNetworkPerm.updateSocialNetwork.permission))
  async updateSocialNetwork(@Body() data: UpdateSocialNetworkDTO) {
    return await this.socialNetworkService.updateSocialNetwork(data);
  }

  @Get('/:id/')
  @UseGuards(APIKeyGuard)
  async getTabInfo(@Param('id') id: string) {
    const result = new ReturnResult<boolean>();
    try {
      const socialNetwork = await this.socialNetworkService.getNetworkInfo(id);
      return socialNetwork;
    } catch (error) {
      result.message = error.message;
    }
    return result;
  }
}
