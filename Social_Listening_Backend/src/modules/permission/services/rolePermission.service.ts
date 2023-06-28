import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/config/database/database.config.service';
import { RemoveListRolePermissionDTO } from '../dtos/rolePermission.dto';
import { ResponseMessage } from 'src/common/enum/ResponseMessage.enum';

@Injectable()
export class RolePermissionService {
  private readonly logger = new Logger(RolePermissionService.name);
  constructor(private readonly prismaService: PrismaService) {}

  async getRolePermission(roleId: string, permissionId: string) {
    return this.prismaService.role_Permission.findFirst({
      where: { roleId: roleId, permissionId: permissionId },
    });
  }

  async assignPermissionToRole(roleId: string, permissionId: string) {
    return this.prismaService.role_Permission.create({
      data: {
        role: { connect: { id: roleId } },
        permission: { connect: { id: permissionId } },
      },
    });
  }

  async removePermissionFromRole(roleId: string, permissionId: string) {
    try {
      await this.prismaService.role_Permission.delete({
        where: {
          roleId_permissionId: {
            roleId: roleId,
            permissionId: permissionId,
          },
        },
      });
    } catch (error) {
      console.log(error);
    }
  }

  async getAllPermissionOfRole(roleId: string) {
    const data = await this.prismaService.permission.findMany({
      where: {
        Role_Permission: {
          some: { roleId: roleId },
        },
      },
      select: { permission: true },
    });
    return data.map((permission) => permission.permission);
  }

  async removeListRolePermission(data: RemoveListRolePermissionDTO) {
    try {
      await Promise.all(
        data.listRolePermission.map(async (rolePermission) => {
          try {
            const exist = await this.getRolePermission(
              rolePermission.roleId,
              rolePermission.permissionId,
            );

            if (exist) {
              await this.removePermissionFromRole(
                rolePermission.roleId,
                rolePermission.permissionId,
              );
            }
          } catch (error) {}
        }),
      );
      return true;
    } catch (error) {
      throw new Error(ResponseMessage.MESSAGE_TECHNICAL_ISSUE);
    }
  }
}
