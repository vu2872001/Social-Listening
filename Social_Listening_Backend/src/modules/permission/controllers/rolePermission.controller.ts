import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { RolePermissionService } from '../services/rolePermission.service';
import {
  RemoveListRolePermissionDTO,
  RemoveRolePermissionDTO,
  RolePermissionDTO,
} from '../dtos/rolePermission.dto';
import { ReturnResult } from 'src/common/models/dto/returnResult';
import { ResponseMessage } from 'src/common/enum/ResponseMessage.enum';
import { formatString } from 'src/utils/formatString';
import { PermissionGuard } from 'src/modules/auth/guards/permission.guard';
import { PermissionPerm } from '../enum/permission.enum';
import { PermissionService } from '../services/permission.service';
import { FindPermissionDTO } from '../dtos/findPermission.dto';
import { PermissionPage } from '../dtos/permissionPage.dto';
import { PagedData } from 'src/common/models/paging/pagedData.dto';
import { AdvancedFilteringService } from 'src/config/database/advancedFiltering.service';

@Controller('permission')
export class PermissionController {
  constructor(
    private readonly permissionService: PermissionService,
    private readonly rolePermissionService: RolePermissionService,
    private readonly advancedFilteringService: AdvancedFilteringService,
  ) {}

  @Post('/get-screens')
  @UseGuards(PermissionGuard(PermissionPerm.AssignPermission.permission))
  async getPermissionScreen() {
    const result = new ReturnResult<object[]>();
    try {
      result.result = await this.permissionService.getPermissionScreen();
    } catch (error) {
      result.message = error.message;
    }
    return result;
  }

  @Post('')
  @UseGuards(PermissionGuard(PermissionPerm.GetAllPermissions.permission))
  async getAllPermission(@Body() page: PermissionPage) {
    const result = new ReturnResult<PagedData<object>>();
    const pagedData = new PagedData<object>(page);
    try {
      const data = this.advancedFilteringService.createFilter(page);
      const listResult = await this.permissionService.getAllPermission(data);

      pagedData.data = listResult;
      pagedData.page.totalElement =
        await this.permissionService.countPermission(data);

      result.result = pagedData;
    } catch (error) {
      result.message = ResponseMessage.MESSAGE_TECHNICAL_ISSUE;
    }
    return result;
  }

  @Post('/find-permission')
  @UseGuards(PermissionGuard(PermissionPerm.AssignPermission.permission))
  async findPermission(@Body() data: FindPermissionDTO) {
    const result = new ReturnResult<object[]>();
    try {
      result.result = await this.permissionService.findPermission(data);
    } catch (error) {
      result.message = error.message;
    }
    return result;
  }

  @Post('assign')
  @UseGuards(PermissionGuard(PermissionPerm.AssignPermission.permission))
  async assignPermission(
    @Body() data: RolePermissionDTO,
  ): Promise<ReturnResult<boolean>> {
    const result = new ReturnResult<boolean>();
    try {
      const { roleId, listPermission } = data;
      Promise.all(
        listPermission.map(async (permissionId) => {
          try {
            const existingRolePermission =
              await this.rolePermissionService.getRolePermission(
                roleId,
                permissionId,
              );

            if (!existingRolePermission) {
              await this.rolePermissionService.assignPermissionToRole(
                roleId,
                permissionId,
              );
            }
          } catch (error) {}
        }),
      );
      result.result = true;
    } catch (error) {
      result.message = formatString(ResponseMessage.MESSAGE_ITEM_EXIST, [
        'RolePermission',
      ]);
    }
    return result;
  }

  @Post('remove')
  @UseGuards(PermissionGuard(PermissionPerm.RemovePermission.permission))
  async removePermission(@Body() data: RemoveRolePermissionDTO) {
    const result = new ReturnResult<boolean>();
    try {
      const { roleId, permissionId } = data;
      const existingRolePermission =
        await this.rolePermissionService.getRolePermission(
          roleId,
          permissionId,
        );

      if (existingRolePermission) {
        await this.rolePermissionService.removePermissionFromRole(
          roleId,
          permissionId,
        );
        result.result = true;
      } else throw new Error();
    } catch (error) {
      result.message = `The role permission is not existed or deleted.`;
    }
    return result;
  }

  @Post('remove-all')
  @UseGuards(PermissionGuard(PermissionPerm.RemoveListPermission.permission))
  async removeListRolePermission(@Body() data: RemoveListRolePermissionDTO) {
    const result = new ReturnResult<boolean>();
    try {
      const removeResult =
        await this.rolePermissionService.removeListRolePermission(data);
      result.result = removeResult;
    } catch (error) {
      result.message = `Something went wrong. Please try again!`;
    }
    return result;
  }
}
