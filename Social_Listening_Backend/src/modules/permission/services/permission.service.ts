import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/config/database/database.config.service';
import { CreatePermissionDTO } from '../dtos/createPermission.dto';
import { UpdatePermissionDTO } from '../dtos/updatePermission.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { PrismaError } from 'src/utils/PrismaError';
import { ReturnResult } from 'src/common/models/dto/returnResult';
import { excludeData } from 'src/utils/excludeData';
import { ResponseMessage } from 'src/common/enum/ResponseMessage.enum';
import { formatString } from 'src/utils/formatString';
import { Permission } from '../model/permission.model';
import { FindPermissionDTO } from '../dtos/findPermission.dto';

@Injectable()
export class PermissionService {
  private readonly logger = new Logger(PermissionService.name);
  constructor(private readonly prismaService: PrismaService) {}

  async createPermission(permission: CreatePermissionDTO) {
    return await this.prismaService.permission.create({ data: permission });
  }

  async editPermission(permission: UpdatePermissionDTO) {
    const result = new ReturnResult<Permission>();
    try {
      const updatedPermisison = await this.prismaService.permission.update({
        where: {
          id: permission.id,
        },
        data: permission,
      });
      result.result = excludeData(updatedPermisison, ['deleted']);
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === PrismaError.RecordDoesNotExist
      ) {
        result.message = formatString(ResponseMessage.MESSAGE_ITEM_NOT_EXIST, [
          'permission',
          permission.id,
        ]);
      }
    }
    return result;
  }

  async getPermissionByName(permissionName: string) {
    return await this.prismaService.permission.findFirst({
      where: { permission: permissionName },
    });
  }

  async getPermissionScreen() {
    const listScreen = await this.prismaService.permission.groupBy({
      by: ['screen'],
      _count: {
        id: true,
      },
    });

    return listScreen.map((screen) => {
      return {
        screen: screen.screen,
        permission: screen._count.id,
      };
    });
  }

  async findPermission(data: FindPermissionDTO) {
    const listPermisison = await this.prismaService.permission.findMany({
      where: { screen: { in: data.screen } },
    });

    return listPermisison.map((permission) => {
      return excludeData(permission, ['deleted']);
    });
  }

  async getAllPermission(page) {
    const listPermission = await this.prismaService.role_Permission.findMany({
      where: page.filter,
      orderBy: page.orders,
      include: {
        role: true,
        permission: true,
      },
      skip: (page.pageNumber - 1) * page.size,
      take: page.size,
    });

    return listPermission.map((permission) => {
      return {
        role: permission.role,
        permission: excludeData(permission.permission, ['deleted']),
      };
    });
  }

  async countPermission(page) {
    return await this.prismaService.role_Permission.count({
      where: page.filter,
    });
  }
}
