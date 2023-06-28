import { UserInTabService } from 'src/modules/users/services/userInTab.service';
import {
  Body,
  Controller,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { WorkflowService } from '../services/workflow.service';
import { AdvancedFilteringService } from './../../../config/database/advancedFiltering.service';
import { WorkflowPage } from '../dtos/workflowPage.dto';
import { WorkflowModel } from '../models/workflow.model';
import { PagedData } from 'src/common/models/paging/pagedData.dto';
import { ReturnResult } from 'src/common/models/dto/returnResult';
import { SortOrderType } from 'src/common/enum/sortOrderType.enum';
import { WorkflowPerm } from '../enum/permission.enum';
import { PermissionGuard } from 'src/modules/auth/guards/permission.guard';
import { RequestWithUser } from 'src/modules/auth/interface/requestWithUser.interface';
import { WorkflowActivationDTO } from '../dtos/workflowActivation.dto';
import { WorkflowDTO } from '../dtos/workflow.dto';
import { APIKeyGuard } from 'src/modules/auth/guards/apikey.guard';
import { WorkflowNodeType } from 'src/common/enum/workflowNode.enum';
import { NotifyAgentDTO } from '../dtos/workflowNotifyAgent.dto';

@Controller('workflow')
export class WorkflowController {
  constructor(
    private readonly workflowService: WorkflowService,
    private readonly userInTabService: UserInTabService,
    private readonly advancedFilteringService: AdvancedFilteringService,
  ) {}

  @Post()
  @UseGuards(PermissionGuard(WorkflowPerm.GetAllWorkflow.permission))
  async getAllWorkflow(
    @Req() request: RequestWithUser,
    @Body() page: WorkflowPage,
  ) {
    const result = new ReturnResult<PagedData<WorkflowModel>>();
    const pagedData = new PagedData<WorkflowModel>(page);
    try {
      const user = request.user;
      const checkInTab = await this.userInTabService.checkUserInTab(
        user.id,
        page.tabId,
      );
      if (!checkInTab) {
        throw new Error(`You are not allowed to view this page`);
      }

      const data = this.advancedFilteringService.createFilter(page);
      data.filter.AND.push({ socialTab: { id: page.tabId } });
      data.filter.AND.push({ delete: { equals: false } });
      if (this.orderExistKey(data, 'isActive')) {
        data.orders.splice(0, 0, { isActive: SortOrderType.DESC });
      }

      const listWorkflow = await this.workflowService.getAllWorkflow(data);
      const numberWorkflow = await this.workflowService.countWorkflow(data);

      pagedData.data = listWorkflow;
      pagedData.page.totalElement = numberWorkflow;
      result.result = pagedData;
    } catch (error) {
      result.message = error.message;
    }

    return result;
  }

  @Put('/:workflowId/active')
  @UseGuards(PermissionGuard(WorkflowPerm.UpdateActivation.permission))
  async updateWorkflowActivation(
    @Req() request: RequestWithUser,
    @Param() { workflowId },
    @Body() data: WorkflowActivationDTO,
  ) {
    const result = new ReturnResult<boolean>();
    try {
      const user = request.user;
      const workflow = await this.workflowService.getWorkflowById(workflowId);
      if (!workflow) {
        throw new Error(`Workflow ${workflowId} does not exist`);
      }

      const checkInTab = await this.userInTabService.checkUserInTab(
        user.id,
        workflow.tabId,
      );
      if (!checkInTab) {
        throw new Error(`You are not allowed to view this page`);
      }

      if (data.activate === true) {
        await this.workflowService.deactivateAllWorkflow(workflow.type);
      }
      await this.workflowService.updateActivation(workflowId, data);
      result.result = true;
    } catch (error) {
      result.message = error.message;
    }
    return result;
  }

  @Post('remove/:workflowId')
  @UseGuards(PermissionGuard(WorkflowPerm.DeleteWorkflow.permission))
  async deleteWorkflow(
    @Req() request: RequestWithUser,
    @Param() { workflowId },
  ) {
    const result = new ReturnResult<boolean>();
    try {
      const user = request.user;
      const workflow = await this.workflowService.getWorkflowById(workflowId);
      if (!workflow) {
        throw new Error(`Workflow ${workflowId} does not exist`);
      }

      const checkInTab = await this.userInTabService.checkUserInTab(
        user.id,
        workflow.tabId,
      );
      if (!checkInTab) {
        throw new Error(`You are not allowed to view this page`);
      }

      await this.workflowService.deleteWorkflow(workflowId);
      result.result = true;
    } catch (error) {
      result.message = error.message;
    }
    return result;
  }

  @Post('/create')
  @UseGuards(PermissionGuard(WorkflowPerm.CreateWorkflow.permission))
  async createWorkflow(
    @Req() request: RequestWithUser,
    @Body() data: WorkflowDTO,
  ) {
    const result = new ReturnResult<object>();
    try {
      const user = request.user;
      const checkInTab = await this.userInTabService.checkUserInTab(
        user.id,
        data.tabId,
      );
      if (!checkInTab) {
        throw new Error(`You are not allowed to view this page`);
      }

      const newWorkflow = await this.workflowService.createWorkflow(data);
      result.result = newWorkflow;
    } catch (error) {
      result.message = error.message;
    }
    return result;
  }

  @Put('/:workflowId/update')
  @UseGuards(PermissionGuard(WorkflowPerm.UpdateWorkflow.permission))
  async updateWorkflow(
    @Req() request: RequestWithUser,
    @Param() { workflowId },
    @Body() data: WorkflowDTO,
  ) {
    const result = new ReturnResult<object>();
    try {
      const user = request.user;

      const workflow = await this.workflowService.getWorkflowById(workflowId);
      const checkInTab = await this.userInTabService.checkUserInTab(
        user.id,
        data.tabId,
      );
      if (!checkInTab) {
        throw new Error(`You are not allowed to view this page`);
      }
      if (!workflow) {
        throw new Error(`Workflow ${workflowId} does not exist`);
      }

      const updatedWorkflow = await this.workflowService.updateWorkflow(
        workflowId,
        data,
      );
      result.result = updatedWorkflow;
    } catch (error) {
      result.message = error.message;
    }
    return result;
  }

  @Post('/:workflowId/notifyAgent')
  @UseGuards(APIKeyGuard)
  async notifyAgent(@Param() { workflowId }, @Body() data: NotifyAgentDTO) {
    const result = new ReturnResult<boolean>();
    try {
      const workflow = await this.workflowService.getWorkflowById(workflowId);
      await this.workflowService.tryCallHook(
        workflow.tabId,
        data.messageType,
        WorkflowNodeType.NotifyAgent,
        {
          messageId: data.messageId,
          notifyAgentMessage: data.notifyAgentMessage,
        },
      );
    } catch (error) {
      result.message = error.message;
    }
    return result;
  }

  private orderExistKey(data, key: string) {
    return !data.orders.find((workflow) =>
      Object.keys(workflow).find((propKey) => propKey === key),
    );
  }
}
