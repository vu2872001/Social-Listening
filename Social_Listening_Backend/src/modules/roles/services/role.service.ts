import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/config/database/database.config.service';
import { CreateRoleDTO } from '../dtos/createRole.dto';

@Injectable()
export class RoleService {
  private readonly logger = new Logger(RoleService.name);
  constructor(private readonly prismaService: PrismaService) {}

  async createRole(role: CreateRoleDTO) {
    return this.prismaService.role.create({ data: role });
  }

  async getAllRole() {
    const listRole = await this.prismaService.role.findMany({
      include: {
        _count: {
          select: { User: true, Role_Permission: true },
        },
      },
    });

    return listRole;
  }

  async getRoleByRoleName(roleName: string) {
    return this.prismaService.role.findFirst({ where: { roleName: roleName } });
  }

  async getRoleById(roleId: string) {
    return this.prismaService.role.findFirst({ where: { id: roleId } });
  }

  async roleCanUse(roleLevel: number) {
    const listRoles = await this.prismaService.role.findMany({
      where: {
        level: {
          lt: roleLevel,
        },
      },
    });

    return listRoles;
  }
}
