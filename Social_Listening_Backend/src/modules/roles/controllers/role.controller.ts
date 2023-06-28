import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { RoleService } from '../services/role.service';
import { EmailConfirmGuard } from 'src/modules/auth/guards/emailConfirm.guard';
import { RequestWithUser } from 'src/modules/auth/interface/requestWithUser.interface';
import { JWTAuthGuard } from 'src/modules/auth/guards/jwtAuth.guard';
import { RolePerm } from '../enum/permission.enum';
import { PermissionGuard } from 'src/modules/auth/guards/permission.guard';
import { ReturnResult } from 'src/common/models/dto/returnResult';

@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  @UseGuards(PermissionGuard(RolePerm.GetAllRole.permission))
  async getAllRole() {
    const result = new ReturnResult<object[]>();
    try {
      result.result = await this.roleService.getAllRole();
    } catch (error) {
      result.message = error.message;
    }
    return result;
  }

  @Get('/can-create')
  @UseGuards(EmailConfirmGuard)
  @UseGuards(JWTAuthGuard)
  async getRoleCanCreate(@Req() request: RequestWithUser) {
    const user = request.user;
    const userRole = user.role;

    const role = await this.roleService.getRoleByRoleName(userRole);

    return await this.roleService.roleCanUse(role.level);
  }
}
