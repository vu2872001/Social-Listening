import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SocialTabService } from '../services/socialTab.service';
import { PermissionGuard } from 'src/modules/auth/guards/permission.guard';
import { SocialTabPerm } from '../enum/permission.enum';
import { SocialNetworkPerm } from '../../socialNetworks/enum/permission.enum'
import { ReturnResult } from 'src/common/models/dto/returnResult';
import { RequestWithUser } from 'src/modules/auth/interface/requestWithUser.interface';
import { SocialTab } from '../models/socialGroup.model';
import { APIKeyGuard } from 'src/modules/auth/guards/apikey.guard';
import { WorkingState } from 'src/common/enum/workingState.enum';
import { WorkflowService } from 'src/modules/workflows/services/workflow.service';

@Controller('socialTab')
export class SocialTabController {
  constructor(
    private readonly socialTabService: SocialTabService,
    private readonly workflowService: WorkflowService,
  ) { }

  @Get('/:id/working/type/:messageType')
  @UseGuards(APIKeyGuard)
  async getTabWorkingState(@Param() { id, messageType }) {
    const result = new ReturnResult<boolean>();
    try {
      const socialTab = await this.socialTabService.getTabByNetworkId(id);
      const haveReceiveMessageNode =
        await this.workflowService.haveReceiveMessageNode(
          socialTab.id,
          messageType,
        );
      result.result =
        socialTab.isWorked === WorkingState.Working && haveReceiveMessageNode;
    } catch (error) {
      result.message = error.message;
    }
    return result;
  }

  @Get('/:id/accessToken')
  @UseGuards(APIKeyGuard)
  async getTabAccessToken(@Param('id') id: string) {
    const result = new ReturnResult<string>();
    try {
      const tab = await this.socialTabService.getTabByNetworkId(id);
      const socialTab = await this.socialTabService.getSocialTabInfo(tab.id);
      const page_info = socialTab.SocialNetwork.extendData;
      if (page_info) {
        const pageData = JSON.parse(page_info);
        result.result = pageData?.accessToken;
      } else return null;
    } catch (error) {
      result.message = error.message;
    }
    return result;
  }

  @Put('/:id/working')
  @UseGuards(PermissionGuard(SocialTabPerm.updateWorkingStateTab.permission))
  async updateWorkingState(@Req() request: RequestWithUser, @Param() { id }) {
    const result = new ReturnResult<SocialTab>();
    try {
      const socialTab = await this.socialTabService.getSocialTabById(id);
      if (!socialTab) throw new Error(`Not found the connection`);
      if (socialTab.delete) throw new Error(`Not found the connection`);

      const state = !socialTab.isWorked;
      const tab = await this.socialTabService.updateWorkingStateById(id, state);
      tab.isWorked = tab.isWorked === WorkingState.Working;
      result.result = tab;
    } catch (error) {
      result.message = error.message;
    }
    return result;
  }

  @Delete('/:id')
  @UseGuards(PermissionGuard(SocialNetworkPerm.disconnectSocialNetwork.permission))
  async removeSocialTab(@Req() request: RequestWithUser, @Param() { id }) {
    const result = new ReturnResult<SocialTab>();
    try {
      const socialTab = await this.socialTabService.getSocialTabById(id);
      if (!socialTab) throw new Error(`Not found the connection`);
      if (socialTab.delete) throw new Error(`Not found the connection`);

      const tab = await this.socialTabService.removeTabById(id);
      result.result = tab;
    } catch (error) {
      result.message = error.message;
    }
    return result;
  }

  @Post('/get-all-tab')
  async getAllTab(){
    const result = new ReturnResult<object[]>();
    try{
      const listTab = await this.socialTabService.getAllTab();
      result.result = listTab;
    }
    catch (error){
      result.message = error.message;
    }
    return result;
  }
}
